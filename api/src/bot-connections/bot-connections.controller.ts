import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { BotConnectionsService } from './bot-connections.service';
import type { BotSetupDto } from './bot-connections.types';

/**
 * Bot setup endpoints for per-user token management in settings.
 */
@Controller('bot')
export class BotConnectionsController {
  constructor(private readonly botConnectionsService: BotConnectionsService) {}

  /**
   * Returns bot setup and channel health snapshot.
   */
  @Get('me')
  async getMyBotSetup(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ setup: BotSetupDto }> {
    const setup = await this.botConnectionsService.getSetupForUser(
      request.authUser!.id,
    );
    return { setup };
  }

  /**
   * Validates and stores bot token.
   */
  @Post('connect')
  async connect(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<{ setup: BotSetupDto }> {
    const setup = await this.botConnectionsService.connectForUser(
      request.authUser!.id,
      body,
    );
    return { setup };
  }

  /**
   * Performs an explicit status refresh.
   */
  @Post('recheck')
  async recheck(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ setup: BotSetupDto }> {
    const setup = await this.botConnectionsService.getSetupForUser(
      request.authUser!.id,
    );
    return { setup };
  }

  /**
   * Disconnects bot token while preserving onboarding progress.
   */
  @Delete('disconnect')
  async disconnect(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ setup: BotSetupDto }> {
    const setup = await this.botConnectionsService.disconnectForUser(
      request.authUser!.id,
    );
    return { setup };
  }
}
