import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import type {
  TelegramChat,
  TelegramChatMember,
  TelegramPhotoMessage,
  TelegramSentMessage,
  TelegramVideoMessage,
} from './telegram.types';

export type MediaItem = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  mediaType: 'photo' | 'video';
};

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
  username?: string;
};

/**
 * Minimal Telegram Bot API client for channel validation and sending messages.
 */
@Injectable()
export class TelegramService {
  private readonly botIdByToken = new Map<string, number>();

  /**
   * Resolves channel/chat info by @username or numeric chat id.
   */
  async getChat(botToken: string, chatReference: string): Promise<TelegramChat> {
    return this.callTelegram<TelegramChat>(botToken, 'getChat', {
      chat_id: chatReference,
    });
  }

  /**
   * Returns current bot membership in selected chat.
   */
  async getBotMembership(
    botToken: string,
    chatId: string,
  ): Promise<TelegramChatMember> {
    const botUserId = await this.getBotId(botToken);
    return this.callTelegram<TelegramChatMember>(botToken, 'getChatMember', {
      chat_id: chatId,
      user_id: botUserId,
    });
  }

  /**
   * Returns bot identity for provided token.
   */
  async getBotIdentity(botToken: string): Promise<TelegramBotIdentity> {
    return this.callTelegram<TelegramBotIdentity>(botToken, 'getMe', {});
  }

  /**
   * Sends HTML-formatted message to chat.
   * Telegram parses <b>, <i>, <u>, <s>, <code>, <pre>, <a>, <blockquote>.
   */
  async sendMessage(
    botToken: string,
    chatId: string,
    text: string,
  ): Promise<TelegramSentMessage> {
    return this.callTelegram<TelegramSentMessage>(botToken, 'sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  }

  /**
   * Sends a single photo to chat with HTML caption.
   */
  async sendPhoto(
    botToken: string,
    chatId: string,
    file: MediaItem,
    caption: string,
  ): Promise<TelegramPhotoMessage> {
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    form.append('photo', new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }), file.originalName);
    return this.callTelegramFormData<TelegramPhotoMessage>(botToken, 'sendPhoto', form);
  }

  /**
   * Sends a single video to chat with HTML caption.
   */
  async sendVideo(
    botToken: string,
    chatId: string,
    file: MediaItem,
    caption: string,
  ): Promise<TelegramVideoMessage> {
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    form.append('video', new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }), file.originalName);
    return this.callTelegramFormData<TelegramVideoMessage>(botToken, 'sendVideo', form);
  }

  /**
   * Sends 2-10 media files as album. Caption goes on the first item only.
   */
  async sendMediaGroup(
    botToken: string,
    chatId: string,
    files: MediaItem[],
    caption: string,
  ): Promise<TelegramSentMessage[]> {
    const form = new FormData();
    form.append('chat_id', chatId);

    const mediaJson = files.map((file, index) => {
      const attachName = `file${index}`;
      form.append(attachName, new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }), file.originalName);
      return {
        type: file.mediaType,
        media: `attach://${attachName}`,
        ...(index === 0 ? { caption, parse_mode: 'HTML' } : {}),
      };
    });

    form.append('media', JSON.stringify(mediaJson));
    return this.callTelegramFormData<TelegramSentMessage[]>(botToken, 'sendMediaGroup', form);
  }

  private async callTelegramFormData<TResponse>(
    botToken: string,
    method: string,
    form: FormData,
  ): Promise<TResponse> {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/${method}`,
      { method: 'POST', body: form },
    );

    if (!response.ok) {
      throw new BadRequestException('Telegram request failed');
    }

    const apiResponse = (await response.json()) as TelegramApiResponse<TResponse>;
    if (!apiResponse.ok) {
      throw new BadRequestException(apiResponse.description ?? 'Telegram API error');
    }

    return apiResponse.result;
  }

  private async getBotId(botToken: string): Promise<number> {
    const cachedBotId = this.botIdByToken.get(botToken);
    if (cachedBotId !== undefined) {
      return cachedBotId;
    }

    const identity = await this.getBotIdentity(botToken);
    this.botIdByToken.set(botToken, identity.id);
    return identity.id;
  }

  private async callTelegram<TResponse>(
    botToken: string,
    method: string,
    payload: Record<string, string | number | boolean>,
  ): Promise<TResponse> {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/${method}`,
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
