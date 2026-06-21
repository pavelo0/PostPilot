import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/public.decorator';
import { AuthService } from './auth.service';
import type { AuthResponse, AuthenticatedRequest } from './auth.types';

/**
 * HTTP endpoints for auth and session lifecycle.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers user and sets session cookie.
   */
  @Public()
  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const { user, token, expiresAt } = await this.authService.register(body);
    response.cookie(
      this.authService.getSessionCookieName(),
      token,
      this.authService.getSessionCookieOptions(expiresAt),
    );
    return { user };
  }

  /**
   * Logs in user and sets session cookie.
   */
  @Public()
  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const { user, token, expiresAt } = await this.authService.login(body);
    response.cookie(
      this.authService.getSessionCookieName(),
      token,
      this.authService.getSessionCookieOptions(expiresAt),
    );
    return { user };
  }

  /**
   * Clears active session for current cookie.
   */
  @Post('logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    await this.authService.logout(request.sessionToken);
    response.clearCookie(
      this.authService.getSessionCookieName(),
      this.authService.getClearSessionCookieOptions(),
    );
    return { success: true };
  }

  /**
   * Returns current authenticated user.
   */
  @Get('me')
  me(@Req() request: AuthenticatedRequest): AuthResponse {
    return { user: request.authUser! };
  }
}
