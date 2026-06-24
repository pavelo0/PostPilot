import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { CookieOptions } from 'express';
import type { ZodType } from 'zod';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  EMAIL_VERIFICATION_MAX_SENDS_PER_WINDOW,
  EMAIL_VERIFICATION_RATE_WINDOW_MINUTES,
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  EMAIL_VERIFICATION_TTL_MINUTES,
  EXPOSE_EMAIL_VERIFICATION_CODE,
  LOG_EMAIL_VERIFICATION_CODE,
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
} from './auth.constants';
import {
  authCredentialsSchema,
  type AuthCredentialsInput,
  formatZodValidationErrors,
  registerSchema,
  type RegisterInput,
  registerResendSchema,
  type RegisterResendInput,
  registerVerifySchema,
  type RegisterVerifyInput,
} from './auth.schemas';
import type { AuthUser, RegisterStartResponse } from './auth.types';

type SessionPayload = {
  token: string;
  expiresAt: Date;
};

type SessionWriter = Pick<Prisma.TransactionClient, 'session'> | PrismaService;

type VerificationRecord = {
  id: string;
  sentCount: number;
  resendWindowStartedAt: Date;
  lastSentAt: Date;
};

type IssueCodeResult = {
  code: string;
  resendAvailableInSeconds: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async register(payload: unknown): Promise<RegisterStartResponse> {
    const registerInput = this.parseRegisterInput(payload);
    const email = registerInput.email.trim().toLowerCase();
    const firstName = registerInput.firstName.trim();
    const lastName = registerInput.lastName?.trim() || null;
    const passwordHash = await hash(registerInput.password, 12);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerifiedAt: true,
      },
    });

    if (existingUser?.emailVerifiedAt) {
      throw new BadRequestException('Email is already registered');
    }

    const issueResult = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const user = await transaction.user.upsert({
          where: { email },
          update: {
            passwordHash,
            firstName,
            lastName,
            emailVerifiedAt: null,
          },
          create: {
            email,
            passwordHash,
            firstName,
            lastName,
          },
          select: { id: true },
        });

        const verification = await transaction.emailVerification.findUnique({
          where: { userId: user.id },
          select: {
            id: true,
            sentCount: true,
            resendWindowStartedAt: true,
            lastSentAt: true,
          },
        });

        return this.issueVerificationCode(transaction, user.id, verification);
      },
    );

    this.logVerificationCode(email, issueResult.code);

    return {
      requiresVerification: true,
      email,
      resendAvailableInSeconds: issueResult.resendAvailableInSeconds,
      verificationCode: EXPOSE_EMAIL_VERIFICATION_CODE
        ? issueResult.code
        : undefined,
    };
  }

  async resendRegisterCode(payload: unknown): Promise<RegisterStartResponse> {
    const resendInput = this.parseRegisterResendInput(payload);
    const email = resendInput.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerifiedAt: true,
      },
    });

    if (!user || user.emailVerifiedAt) {
      return {
        requiresVerification: true,
        email,
        resendAvailableInSeconds: EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
      };
    }

    const issueResult = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const verification = await transaction.emailVerification.findUnique({
          where: { userId: user.id },
          select: {
            id: true,
            sentCount: true,
            resendWindowStartedAt: true,
            lastSentAt: true,
          },
        });

        return this.issueVerificationCode(transaction, user.id, verification);
      },
    );

    this.logVerificationCode(email, issueResult.code);

    return {
      requiresVerification: true,
      email,
      resendAvailableInSeconds: issueResult.resendAvailableInSeconds,
      verificationCode: EXPOSE_EMAIL_VERIFICATION_CODE
        ? issueResult.code
        : undefined,
    };
  }

  async verifyRegister(
    payload: unknown,
  ): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
    const verifyInput = this.parseRegisterVerifyInput(payload);
    const email = verifyInput.email.trim().toLowerCase();
    const codeHash = this.hashToken(verifyInput.code);
    const now = new Date();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Verification code is invalid or expired');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified');
    }

    const verification = await this.prisma.emailVerification.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        codeHash: true,
        expiresAt: true,
        attempts: true,
        verifiedAt: true,
      },
    });

    if (
      !verification ||
      verification.verifiedAt ||
      verification.expiresAt <= now
    ) {
      throw new BadRequestException('Verification code is invalid or expired');
    }

    if (verification.attempts >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many attempts. Please request a new verification code',
      );
    }

    if (verification.codeHash !== codeHash) {
      await this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Verification code is invalid or expired');
    }

    const session = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        await transaction.emailVerification.update({
          where: { id: verification.id },
          data: {
            attempts: { increment: 1 },
            verifiedAt: now,
          },
        });

        await transaction.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: now },
        });

        return this.createSession(user.id, transaction);
      },
    );

    return {
      user: this.mapUser({ ...user, emailVerifiedAt: now }),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async login(
    payload: unknown,
  ): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
    const credentials = this.parseCredentials(payload);
    const email = credentials.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(
      credentials.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Email is not verified');
    }

    const session = await this.createSession(user.id);

    return {
      user: this.mapUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async logout(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken) {
      return;
    }

    await this.prisma.session.deleteMany({
      where: { tokenHash: this.hashToken(sessionToken) },
    });
  }

  async getUserBySessionToken(
    sessionToken: string | undefined,
  ): Promise<AuthUser | null> {
    if (!sessionToken) {
      return null;
    }

    const session = await this.prisma.session.findFirst({
      where: {
        tokenHash: this.hashToken(sessionToken),
        expiresAt: { gt: new Date() },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            emailVerifiedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    return this.mapUser(session.user);
  }

  async requireUser(sessionToken: string | undefined): Promise<AuthUser> {
    const user = await this.getUserBySessionToken(sessionToken);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }

  getSessionCookieOptions(expiresAt: Date): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expiresAt,
    };
  }

  getClearSessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  getSessionCookieName(): string {
    return SESSION_COOKIE_NAME;
  }

  private parsePayload<T>(schema: ZodType<T>, payload: unknown): T {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formatZodValidationErrors(parsed.error),
      });
    }
    return parsed.data;
  }

  private parseCredentials(payload: unknown): AuthCredentialsInput {
    return this.parsePayload(authCredentialsSchema, payload);
  }

  private parseRegisterInput(payload: unknown): RegisterInput {
    return this.parsePayload(registerSchema, payload);
  }

  private parseRegisterResendInput(payload: unknown): RegisterResendInput {
    return this.parsePayload(registerResendSchema, payload);
  }

  private parseRegisterVerifyInput(payload: unknown): RegisterVerifyInput {
    return this.parsePayload(registerVerifySchema, payload);
  }

  private logVerificationCode(email: string, code: string): void {
    if (!LOG_EMAIL_VERIFICATION_CODE) {
      return;
    }

    this.logger.log(
      `Email verification code for ${email}: ${code} (valid ${EMAIL_VERIFICATION_TTL_MINUTES} min)`,
    );
  }

  private async issueVerificationCode(
    transaction: Prisma.TransactionClient,
    userId: string,
    verification: VerificationRecord | null,
  ): Promise<IssueCodeResult> {
    const now = new Date();
    const verificationCode = this.generateEmailVerificationCode();
    const codeHash = this.hashToken(verificationCode);
    const expiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000,
    );

    const { nextSentCount, nextWindowStartedAt, resendAvailableInSeconds } =
      this.resolveRateLimitWindow(now, verification);

    if (!verification) {
      await transaction.emailVerification.create({
        data: {
          userId,
          codeHash,
          expiresAt,
          attempts: 0,
          verifiedAt: null,
          sentCount: nextSentCount,
          resendWindowStartedAt: nextWindowStartedAt,
          lastSentAt: now,
        },
      });
    } else {
      await transaction.emailVerification.update({
        where: { id: verification.id },
        data: {
          codeHash,
          expiresAt,
          attempts: 0,
          verifiedAt: null,
          sentCount: nextSentCount,
          resendWindowStartedAt: nextWindowStartedAt,
          lastSentAt: now,
        },
      });
    }

    return {
      code: verificationCode,
      resendAvailableInSeconds,
    };
  }

  private resolveRateLimitWindow(
    now: Date,
    verification: VerificationRecord | null,
  ): {
    nextSentCount: number;
    nextWindowStartedAt: Date;
    resendAvailableInSeconds: number;
  } {
    if (!verification) {
      return {
        nextSentCount: 1,
        nextWindowStartedAt: now,
        resendAvailableInSeconds: EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
      };
    }

    const cooldownPassedMs = now.getTime() - verification.lastSentAt.getTime();
    const cooldownMs = EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000;
    if (cooldownPassedMs < cooldownMs) {
      const retryAfterSeconds = Math.ceil(
        (cooldownMs - cooldownPassedMs) / 1000,
      );
      throw new HttpException(
        {
          message: `Please wait ${retryAfterSeconds} seconds before requesting another code`,
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const windowMs = EMAIL_VERIFICATION_RATE_WINDOW_MINUTES * 60 * 1000;
    const windowPassedMs =
      now.getTime() - verification.resendWindowStartedAt.getTime();
    const isWindowExpired = windowPassedMs >= windowMs;

    const nextWindowStartedAt = isWindowExpired
      ? now
      : verification.resendWindowStartedAt;
    const nextSentCount = isWindowExpired ? 1 : verification.sentCount + 1;

    if (nextSentCount > EMAIL_VERIFICATION_MAX_SENDS_PER_WINDOW) {
      const retryAfterSeconds = Math.ceil((windowMs - windowPassedMs) / 1000);
      throw new HttpException(
        {
          message: 'Too many verification code requests. Try again later',
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return {
      nextSentCount,
      nextWindowStartedAt,
      resendAvailableInSeconds: EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
    };
  }

  private async createSession(
    userId: string,
    prismaClient: SessionWriter = this.prisma,
  ): Promise<SessionPayload> {
    const token = this.generateSessionToken();
    const expiresAt = new Date(
      Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await prismaClient.session.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
      select: { id: true },
    });

    return { token, expiresAt };
  }

  private generateSessionToken(): string {
    return randomBytes(48).toString('hex');
  }

  private generateEmailVerificationCode(): string {
    const min = 100000;
    const max = 999999;
    return String(Math.floor(Math.random() * (max - min + 1) + min));
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private mapUser(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    emailVerifiedAt: Date | null;
    createdAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
