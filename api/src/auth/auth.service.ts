import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { CookieOptions } from 'express';
import type { ZodType } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from './auth.constants';
import {
  authCredentialsSchema,
  type AuthCredentialsInput,
  formatZodValidationErrors,
  registerSchema,
  type RegisterInput,
} from './auth.schemas';
import type { AuthUser } from './auth.types';

type SessionPayload = {
  token: string;
  expiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    payload: unknown,
  ): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
    const registerInput = this.parseRegisterInput(payload);
    const email = registerInput.email.trim().toLowerCase();
    const firstName = registerInput.firstName.trim();
    const lastName = registerInput.lastName?.trim() || null;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await hash(registerInput.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const session = await this.createSession(user.id);

    return {
      user: this.mapUser(user),
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

  private async createSession(userId: string): Promise<SessionPayload> {
    const token = this.generateSessionToken();
    const expiresAt = new Date(
      Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.session.create({
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

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private mapUser(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
