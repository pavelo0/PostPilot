import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { ChannelsService } from './channels.service';
import type { ChannelDto } from './channels.types';

/**
 * Channel connect/status endpoints for authenticated users.
 */
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  /**
   * Returns all current user connected channels.
   */
  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ channels: ChannelDto[] }> {
    const channels = await this.channelsService.listForUser(
      request.authUser!.id,
    );
    return { channels };
  }

  /**
   * Returns current user connected channel status.
   */
  @Get('me')
  async getMyChannel(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ channel: ChannelDto }> {
    const channel = await this.channelsService.getForUser(request.authUser!.id);
    return { channel };
  }

  /**
   * Connects or updates user channel after bot admin check.
   */
  @Post('connect')
  async connect(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<{ channel: ChannelDto }> {
    const channel = await this.channelsService.connectForUser(
      request.authUser!.id,
      body,
    );
    return { channel };
  }
}
