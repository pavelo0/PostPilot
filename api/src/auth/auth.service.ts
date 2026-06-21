import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import type { CookieOptions } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from './auth.constants';
import {
  authCredentialsSchema,
  type AuthCredentialsInput,
} from './auth.schemas';
import type { AuthUser } from './auth.types';

type SessionPayload = {
  token: string;
  expiresAt: Date;
};

/**
 * Handles user authentication and cookie-backed sessions.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers user and creates active session.
   */
  async register(
    payload: unknown,
  ): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
    const credentials = this.parseCredentials(payload);
    const email = credentials.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await hash(credentials.password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    const session = await this.createSession(user.id);

    return {
      user: this.mapUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Authenticates existing user and creates session.
   */
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

  /**
   * Deletes current session token if present.
   */
  async logout(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken) {
      return;
    }

    await this.prisma.session.deleteMany({
      where: { tokenHash: this.hashToken(sessionToken) },
    });
  }

  /**
   * Returns authenticated user for valid session token.
   */
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

  /**
   * Reads user from request cookie and throws on unauthorized access.
   */
  async requireUser(sessionToken: string | undefined): Promise<AuthUser> {
    const user = await this.getUserBySessionToken(sessionToken);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }

  /**
   * Returns cookie options for active auth session.
   */
  getSessionCookieOptions(expiresAt: Date): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expiresAt,
    };
  }

  /**
   * Returns cookie options for clearing auth session.
   */
  getClearSessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  /**
   * Returns project-wide cookie name.
   */
  getSessionCookieName(): string {
    return SESSION_COOKIE_NAME;
  }

  private parseCredentials(payload: unknown): AuthCredentialsInput {
    const parsed = authCredentialsSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body',
      );
    }
    return parsed.data;
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
    createdAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
