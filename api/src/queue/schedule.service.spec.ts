import { BadRequestException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { QueueService } from './queue.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let queueService: jest.Mocked<Pick<QueueService, 'schedulePublish' | 'removePublishJob'>>;
  let prisma: jest.Mocked<Pick<PrismaService, 'channel'>>;

  beforeEach(() => {
    queueService = {
      schedulePublish: jest.fn(),
      removePublishJob: jest.fn(),
    };

    prisma = {
      channel: {
        findFirst: jest.fn(),
      },
    } as unknown as jest.Mocked<Pick<PrismaService, 'channel'>>;

    scheduleService = new ScheduleService(
      prisma as unknown as PrismaService,
      queueService as unknown as QueueService,
    );
  });

  it('rejects scheduledAt in the past', () => {
    const past = new Date(Date.now() - 60_000).toISOString();

    expect(() => scheduleService.parseScheduledAt(past)).toThrow(BadRequestException);
  });

  it('accepts scheduledAt at least one minute in the future', () => {
    const future = new Date(Date.now() + 120_000).toISOString();
    const parsed = scheduleService.parseScheduledAt(future);

    expect(parsed.getTime()).toBeGreaterThan(Date.now());
  });

  it('resolves channel for schedule', async () => {
    prisma.channel.findFirst.mockResolvedValue({ id: 'channel-1' });

    await expect(
      scheduleService.resolveChannelForSchedule('user-1', 'channel-1'),
    ).resolves.toEqual({ id: 'channel-1' });
  });

  it('enqueues publish job', async () => {
    const scheduledAt = new Date(Date.now() + 120_000);

    await scheduleService.enqueueScheduledPost('post-1', 'user-1', scheduledAt);

    expect(queueService.schedulePublish).toHaveBeenCalledWith(
      'post-1',
      'user-1',
      scheduledAt,
    );
  });
});
