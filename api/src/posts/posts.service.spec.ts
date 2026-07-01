jest.mock('../bot-connections/bot-connections.service', () => ({
  BotConnectionsService: class BotConnectionsService {},
}));

jest.mock('../telegram/telegram.service', () => ({
  TelegramService: class TelegramService {},
}));

import { BadRequestException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ScheduleService } from '../queue/schedule.service';

describe('PostsService calendar helpers', () => {
  const scheduleService = {
    parseScheduledAt: jest.fn(),
    resolveChannelForSchedule: jest.fn(),
    enqueueScheduledPost: jest.fn(),
    cancelScheduledPost: jest.fn(),
  };

  const prisma = {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    channel: {
      findFirst: jest.fn(),
    },
  };

  const mediaStorage = {
    save: jest.fn(),
    load: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };

  const postsService = new PostsService(
    prisma as never,
    {} as never,
    {} as never,
    scheduleService as unknown as ScheduleService,
    mediaStorage as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid calendar range', async () => {
    await expect(
      postsService.listForCalendar('user-1', {
        from: '2026-06-30',
        to: '2026-06-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns scheduled and published posts in range', async () => {
    const scheduledAt = new Date('2026-06-15T10:00:00.000Z');
    const publishedAt = new Date('2026-06-20T12:00:00.000Z');

    prisma.post.findMany.mockResolvedValue([
      {
        id: 'post-scheduled',
        userId: 'user-1',
        channelId: 'channel-1',
        title: 'Scheduled',
        body: 'Body',
        status: 'scheduled',
        scheduledAt,
        telegramMessageId: null,
        publishedAt: null,
        errorMessage: null,
        createdAt: scheduledAt,
        updatedAt: scheduledAt,
        channel: { title: 'Channel', telegramUsername: '@demo' },
        mediaItems: [],
      },
      {
        id: 'post-published',
        userId: 'user-1',
        channelId: 'channel-1',
        title: 'Published',
        body: 'Body',
        status: 'published',
        scheduledAt: null,
        telegramMessageId: 10,
        publishedAt,
        errorMessage: null,
        createdAt: publishedAt,
        updatedAt: publishedAt,
        channel: { title: 'Channel', telegramUsername: '@demo' },
        mediaItems: [],
      },
    ]);

    const posts = await postsService.listForCalendar('user-1', {
      from: '2026-06-01',
      to: '2026-06-30',
    });

    expect(posts).toHaveLength(2);
    expect(posts[0]?.id).toBe('post-scheduled');
    expect(posts[1]?.id).toBe('post-published');
    expect(posts[0]?.channelLabel).toBe('@demo');
  });
});
