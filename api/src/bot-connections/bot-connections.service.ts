import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import type { ConnectBotInput } from './bot-connections.schemas';
import { connectBotSchema } from './bot-connections.schemas';
import { BotTokenCrypto } from './bot-token-crypto';
import type {
  BotSetupDto,
  ChannelBotAdminStatus,
  BotConnectionDto,
} from './bot-connections.types';

type BotConnectionRecord = {
  encryptedToken: string | null;
  tokenLastFour: string | null;
  isActive: boolean;
  connectedAt: Date | null;
  disconnectedAt: Date | null;
  progressConnectedOnceAt: Date | null;
};

/**
 * Manages per-user bot token lifecycle and live bot/channel health checks.
 */
@Injectable()
export class BotConnectionsService {
  private tokenCrypto: BotTokenCrypto | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Returns bot setup snapshot for settings and onboarding UI.
   */
  async getSetupForUser(userId: string): Promise<BotSetupDto> {
    const [connection, channels] = await Promise.all([
      this.prisma.botConnection.findUnique({
        where: { userId },
        select: {
          encryptedToken: true,
          tokenLastFour: true,
          isActive: true,
          connectedAt: true,
          disconnectedAt: true,
          progressConnectedOnceAt: true,
        },
      }),
      this.prisma.channel.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramUsername: true,
          title: true,
          telegramChatId: true,
        },
      }),
    ]);

    if (!connection) {
      return {
        bot: this.toBotDto(null, 'missing', null),
        channels: channels.map((channel) => ({
          ...channel,
          adminStatus: 'unknown',
        })),
      };
    }

    if (!connection.isActive || !connection.encryptedToken) {
      return {
        bot: this.toBotDto(connection, 'missing', null),
        channels: channels.map((channel) => ({
          ...channel,
          adminStatus: 'unknown',
        })),
      };
    }

    try {
      const activeToken = this.getTokenCrypto().decrypt(
        connection.encryptedToken,
      );
      const identity = await this.telegramService.getBotIdentity(activeToken);
      const channelsWithStatus = await Promise.all(
        channels.map(async (channel) => {
          const adminStatus = await this.getChannelAdminStatus(
            activeToken,
            channel.telegramChatId,
          );
          return {
            ...channel,
            adminStatus,
          };
        }),
      );

      return {
        bot: this.toBotDto(connection, 'connected', identity.username ?? null),
        channels: channelsWithStatus,
      };
    } catch {
      return {
        bot: this.toBotDto(connection, 'token_invalid', null),
        channels: channels.map((channel) => ({
          ...channel,
          adminStatus: 'check_failed',
        })),
      };
    }
  }

  /**
   * Validates and stores bot token for current user.
   */
  async connectForUser(userId: string, payload: unknown): Promise<BotSetupDto> {
    const input = this.parseConnectInput(payload);
    const token = input.token.trim();

    await this.telegramService.getBotIdentity(token);

    const now = new Date();
    const existingConnection = await this.prisma.botConnection.findUnique({
      where: { userId },
      select: { progressConnectedOnceAt: true },
    });
    await this.prisma.botConnection.upsert({
      where: { userId },
      create: {
        userId,
        encryptedToken: this.getTokenCrypto().encrypt(token),
        tokenLastFour: token.slice(-4),
        isActive: true,
        connectedAt: now,
        disconnectedAt: null,
        progressConnectedOnceAt: now,
      },
      update: {
        encryptedToken: this.getTokenCrypto().encrypt(token),
        tokenLastFour: token.slice(-4),
        isActive: true,
        connectedAt: now,
        disconnectedAt: null,
        ...(existingConnection?.progressConnectedOnceAt === null
          ? { progressConnectedOnceAt: now }
          : {}),
      },
    });

    return this.getSetupForUser(userId);
  }

  /**
   * Deactivates bot token while preserving sticky onboarding progress.
   */
  async disconnectForUser(userId: string): Promise<BotSetupDto> {
    const existingConnection = await this.prisma.botConnection.findUnique({
      where: { userId },
      select: {
        id: true,
        progressConnectedOnceAt: true,
      },
    });

    if (!existingConnection) {
      await this.prisma.botConnection.create({
        data: {
          userId,
          isActive: false,
          disconnectedAt: new Date(),
        },
      });
      return this.getSetupForUser(userId);
    }

    await this.prisma.botConnection.update({
      where: { userId },
      data: {
        encryptedToken: null,
        tokenLastFour: null,
        isActive: false,
        disconnectedAt: new Date(),
      },
    });

    return this.getSetupForUser(userId);
  }

  /**
   * Returns decrypted active token or throws user-facing setup error.
   */
  async getRequiredActiveTokenForUser(userId: string): Promise<string> {
    const connection = await this.prisma.botConnection.findUnique({
      where: { userId },
      select: {
        encryptedToken: true,
        isActive: true,
      },
    });

    if (!connection?.isActive || !connection.encryptedToken) {
      throw new BadRequestException('Connect bot token first');
    }

    try {
      return this.getTokenCrypto().decrypt(connection.encryptedToken);
    } catch {
      throw new InternalServerErrorException(
        'Stored bot token cannot be decrypted',
      );
    }
  }

  private getTokenCrypto(): BotTokenCrypto {
    if (this.tokenCrypto === null) {
      this.tokenCrypto = new BotTokenCrypto();
    }

    return this.tokenCrypto;
  }

  private parseConnectInput(payload: unknown): ConnectBotInput {
    const parsed = connectBotSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body',
      );
    }
    return parsed.data;
  }

  private async getChannelAdminStatus(
    token: string,
    telegramChatId: string,
  ): Promise<ChannelBotAdminStatus> {
    try {
      const membership = await this.telegramService.getBotMembership(
        token,
        telegramChatId,
      );

      if (
        membership.status === 'administrator' ||
        membership.status === 'creator'
      ) {
        return 'admin';
      }

      return 'not_admin';
    } catch {
      return 'check_failed';
    }
  }

  private toBotDto(
    connection: BotConnectionRecord | null,
    health: BotConnectionDto['health'],
    username: string | null,
  ): BotConnectionDto {
    if (!connection) {
      return {
        configured: false,
        tokenMask: null,
        health: 'missing',
        username: null,
        connectedAt: null,
        disconnectedAt: null,
        progressConnectedOnce: false,
        progressConnectedOnceAt: null,
      };
    }

    return {
      configured: connection.isActive && connection.encryptedToken !== null,
      tokenMask: connection.tokenLastFour
        ? `****************${connection.tokenLastFour}`
        : null,
      health,
      username,
      connectedAt: connection.connectedAt?.toISOString() ?? null,
      disconnectedAt: connection.disconnectedAt?.toISOString() ?? null,
      progressConnectedOnce: connection.progressConnectedOnceAt !== null,
      progressConnectedOnceAt:
        connection.progressConnectedOnceAt?.toISOString() ?? null,
    };
  }
}
