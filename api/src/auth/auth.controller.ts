import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/public.decorator';
import { AuthService } from './auth.service';
import type { AuthResponse, AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Get('me')
  me(@Req() request: AuthenticatedRequest): AuthResponse {
    return { user: request.authUser! };
  }
}
