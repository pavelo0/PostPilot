import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChannelLimitsService } from '../billing/channel-limits.service';
import type { Channel } from '../generated/prisma/client';
import { BotConnectionsService } from '../bot-connections/bot-connections.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import {
  connectChannelSchema,
  type ConnectChannelInput,
} from './channels.schemas';
import type { ChannelDto } from './channels.types';

type ChannelSelectResult = Pick<
  Channel,
  | 'id'
  | 'userId'
  | 'telegramChatId'
  | 'telegramUsername'
  | 'title'
  | 'botConnectedAt'
  | 'createdAt'
  | 'updatedAt'
>;

/**
 * Handles connect/status flow for user channels.
 */
@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly botConnectionsService: BotConnectionsService,
    private readonly channelLimitsService: ChannelLimitsService,
  ) {}

  /**
   * Returns connected channels for current user.
   */
  async listForUser(userId: string): Promise<ChannelDto[]> {
    const channels = await this.prisma.channel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: this.channelSelect(),
    });

    return channels.map((channel) => this.toDto(channel));
  }

  /**
   * Returns latest connected channel for backward compatibility.
   */
  async getForUser(userId: string): Promise<ChannelDto> {
    const channel = await this.prisma.channel.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: this.channelSelect(),
    });

    if (!channel) {
      throw new NotFoundException('Channel is not connected');
    }

    return this.toDto(channel);
  }

  /**
   * Connects channel and verifies bot admin permissions.
   */
  async connectForUser(userId: string, payload: unknown): Promise<ChannelDto> {
    const input = this.parseConnectInput(payload);
    const botToken =
      await this.botConnectionsService.getRequiredActiveTokenForUser(userId);
    const chat = await this.telegramService.getChat(botToken, input.channel);

    if (chat.type !== 'channel' && chat.type !== 'supergroup') {
      throw new BadRequestException('Only channel chats are supported');
    }

    const membership = await this.telegramService.getBotMembership(
      botToken,
      String(chat.id),
    );
    if (
      membership.status !== 'administrator' &&
      membership.status !== 'creator'
    ) {
      throw new BadRequestException(
        'Bot must be admin in the selected channel',
      );
    }

    const telegramChatId = String(chat.id);
    const existingChannel = await this.prisma.channel.findUnique({
      where: {
        userId_telegramChatId: {
          userId,
          telegramChatId,
        },
      },
      select: this.channelSelect(),
    });

    if (!existingChannel) {
      await this.channelLimitsService.assertCanAddChannel(userId);
    }

    const channel = await this.prisma.channel.upsert({
      where: {
        userId_telegramChatId: {
          userId,
          telegramChatId,
        },
      },
      create: {
        userId,
        telegramChatId,
        telegramUsername: chat.username ?? null,
        title: chat.title ?? null,
        botConnectedAt: new Date(),
      },
      update: {
        telegramUsername: chat.username ?? null,
        title: chat.title ?? null,
        botConnectedAt: new Date(),
      },
      select: this.channelSelect(),
    });

    return this.toDto(channel);
  }

  private parseConnectInput(payload: unknown): ConnectChannelInput {
    const parsed = connectChannelSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body',
      );
    }
    return parsed.data;
  }

  private channelSelect() {
    return {
      id: true,
      userId: true,
      telegramChatId: true,
      telegramUsername: true,
      title: true,
      botConnectedAt: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  private toDto(channel: ChannelSelectResult): ChannelDto {
    return {
      id: channel.id,
      userId: channel.userId,
      telegramChatId: channel.telegramChatId,
      telegramUsername: channel.telegramUsername,
      title: channel.title,
      botConnectedAt: channel.botConnectedAt.toISOString(),
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
    };
  }
}
