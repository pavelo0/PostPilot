import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from './queue.service';

/**
 * Manages scheduled post lifecycle and queue synchronization.
 */
@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Validates and returns parsed scheduled date.
   */
  parseScheduledAt(value: string): Date {
    const scheduledAt = new Date(value);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid scheduledAt date');
    }

    const minTime = Date.now() + 60_000;
    if (scheduledAt.getTime() < minTime) {
      throw new BadRequestException(
        'Scheduled time must be at least 1 minute in the future',
      );
    }

    return scheduledAt;
  }

  /**
   * Ensures channel belongs to user when scheduling.
   */
  async resolveChannelForSchedule(
    userId: string,
    channelId: string,
  ): Promise<{ id: string }> {
    const channel = await this.prisma.channel.findFirst({
      where: { id: channelId, userId },
      select: { id: true },
    });

    if (!channel) {
      throw new BadRequestException('Channel not found');
    }

    return channel;
  }

  /**
   * Enqueues publish job after post is saved as scheduled.
   */
  async enqueueScheduledPost(
    postId: string,
    userId: string,
    scheduledAt: Date,
  ): Promise<void> {
    await this.queueService.schedulePublish(postId, userId, scheduledAt);
  }

  /**
   * Cancels pending publish job for a post.
   */
  async cancelScheduledPost(postId: string): Promise<void> {
    await this.queueService.removePublishJob(postId);
  }
}
