jest.mock('../bot-connections/bot-connections.service', () => ({
  BotConnectionsService: class BotConnectionsService {
    getRequiredActiveTokenForUser = jest.fn().mockResolvedValue('bot-token');
  },
}));

jest.mock('../telegram/telegram.service', () => ({
  TelegramService: class TelegramService {
    getBotMembership = jest.fn().mockResolvedValue({ status: 'administrator' });
    sendPhoto = jest.fn().mockResolvedValue({
      message_id: 42,
      photo: [{ file_id: 'photo-file-id' }],
    });
  },
}));

import { PostsService } from './posts.service';
import { ScheduleService } from '../queue/schedule.service';
import { TelegramService } from '../telegram/telegram.service';
import { BotConnectionsService } from '../bot-connections/bot-connections.service';

describe('PostsService publish with stored media', () => {
  const scheduleService = {
    parseScheduledAt: jest.fn(),
    resolveChannelForSchedule: jest.fn(),
    enqueueScheduledPost: jest.fn(),
    cancelScheduledPost: jest.fn(),
  };

  const mediaStorage = {
    save: jest.fn(),
    load: jest.fn().mockResolvedValue({
      buffer: Buffer.from('stored-image'),
      mimeType: 'image/jpeg',
      originalName: 'photo.jpg',
    }),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };

  const prisma = {
    post: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    channel: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'channel-1',
        telegramChatId: '-100123',
        telegramUsername: '@demo',
      }),
    },
  };

  const telegramService = new TelegramService();
  const botConnectionsService = new BotConnectionsService();

  const postsService = new PostsService(
    prisma as never,
    telegramService as never,
    botConnectionsService as never,
    scheduleService as unknown as ScheduleService,
    mediaStorage as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads pending media from storage when publish is called without files', async () => {
    const scheduledPost = {
      id: 'post-1',
      userId: 'user-1',
      channelId: 'channel-1',
      title: null,
      body: 'Caption',
      status: 'scheduled',
      scheduledAt: new Date('2026-07-01T12:00:00.000Z'),
      telegramMessageId: null,
      publishedAt: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      channel: { title: 'Channel', telegramUsername: '@demo' },
      mediaItems: [
        {
          id: 'media-1',
          mediaType: 'photo',
          telegramFileId: null,
          storageKey: 'posts/post-1/media-1.jpg',
          originalName: 'photo.jpg',
          mimeType: 'image/jpeg',
          order: 0,
        },
      ],
    };

    prisma.post.findFirst.mockResolvedValue(scheduledPost);
    prisma.post.update.mockResolvedValue({
      ...scheduledPost,
      status: 'published',
      telegramMessageId: 42,
      publishedAt: new Date(),
      mediaItems: [
        {
          id: 'media-1',
          mediaType: 'photo',
          telegramFileId: 'photo-file-id',
          storageKey: null,
          originalName: 'photo.jpg',
          mimeType: 'image/jpeg',
          order: 0,
        },
      ],
    });

    await postsService.publishForUser('post-1', 'user-1', {});

    expect(mediaStorage.load).toHaveBeenCalledWith('posts/post-1/media-1.jpg');
    expect(telegramService.sendPhoto).toHaveBeenCalled();
    expect(mediaStorage.deleteMany).toHaveBeenCalledWith(['posts/post-1/media-1.jpg']);
  });
});
