import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  TelegramChat,
  TelegramChatMember,
  TelegramSentMessage,
} from './telegram.types';

type TelegramApiSuccess<T> = {
  ok: true;
  result: T;
};

type TelegramApiError = {
  ok: false;
  description?: string;
};

type TelegramApiResponse<T> = TelegramApiSuccess<T> | TelegramApiError;

type TelegramBotIdentity = {
  id: number;
};

/**
 * Minimal Telegram Bot API client for channel validation and sending messages.
 */
@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private botId: number | null = null;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new InternalServerErrorException(
        'TELEGRAM_BOT_TOKEN is not configured',
      );
    }
    this.botToken = token;
  }

  /**
   * Resolves channel/chat info by @username or numeric chat id.
   */
  async getChat(chatReference: string): Promise<TelegramChat> {
    return this.callTelegram<TelegramChat>('getChat', {
      chat_id: chatReference,
    });
  }

  /**
   * Returns current bot membership in selected chat.
   */
  async getBotMembership(chatId: string): Promise<TelegramChatMember> {
    const botUserId = await this.getBotId();
    return this.callTelegram<TelegramChatMember>('getChatMember', {
      chat_id: chatId,
      user_id: botUserId,
    });
  }

  /**
   * Sends plain text message to chat.
   */
  async sendMessage(
    chatId: string,
    text: string,
  ): Promise<TelegramSentMessage> {
    return this.callTelegram<TelegramSentMessage>('sendMessage', {
      chat_id: chatId,
      text,
    });
  }

  private async getBotId(): Promise<number> {
    if (this.botId !== null) {
      return this.botId;
    }

    const identity = await this.callTelegram<TelegramBotIdentity>('getMe', {});
    this.botId = identity.id;
    return identity.id;
  }

  private async callTelegram<TResponse>(
    method: string,
    payload: Record<string, number | string>,
  ): Promise<TResponse> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/${method}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Telegram request failed');
    }

    const apiResponse =
      (await response.json()) as TelegramApiResponse<TResponse>;
    if (!apiResponse.ok) {
      throw new BadRequestException(
        apiResponse.description ?? 'Telegram API error',
      );
    }

    return apiResponse.result;
  }
}
