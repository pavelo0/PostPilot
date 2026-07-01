import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  POST_PUBLISH_JOB,
  POST_PUBLISH_QUEUE,
  type PublishPostJobData,
} from './queue.constants';

function getRedisConnectionOptions(): { url: string; maxRetriesPerRequest: null } {
  return {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    maxRetriesPerRequest: null,
  };
}

/**
 * BullMQ producer for scheduled post publish jobs.
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queue: Queue<PublishPostJobData>;

  constructor() {
    this.queue = new Queue<PublishPostJobData>(POST_PUBLISH_QUEUE, {
      connection: getRedisConnectionOptions(),
    });
  }

  /**
   * Enqueues a delayed publish job keyed by post id.
   */
  async schedulePublish(
    postId: string,
    userId: string,
    scheduledAt: Date,
  ): Promise<void> {
    const delay = Math.max(scheduledAt.getTime() - Date.now(), 0);

    await this.removePublishJob(postId);

    await this.queue.add(
      POST_PUBLISH_JOB,
      { postId, userId },
      {
        jobId: postId,
        delay,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Scheduled publish job for post ${postId} in ${delay}ms`,
    );
  }

  /**
   * Removes a pending publish job for the post.
   * Skips active jobs — they are removed automatically on completion.
   */
  async removePublishJob(postId: string): Promise<void> {
    const job = await this.queue.getJob(postId);
    if (!job) {
      return;
    }

    const state = await job.getState();
    if (state === 'active') {
      return;
    }

    try {
      await job.remove();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('locked by another worker')) {
        return;
      }
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
