import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import { PostsService } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
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
 * BullMQ worker that publishes scheduled posts at the planned time.
 */
@Injectable()
export class PublishPostWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PublishPostWorker.name);
  private worker: Worker<PublishPostJobData> | null = null;

  constructor(
    private readonly postsService: PostsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker<PublishPostJobData>(
      POST_PUBLISH_QUEUE,
      async (job) => {
        if (job.name !== POST_PUBLISH_JOB) {
          return;
        }

        const { postId, userId } = job.data;
        const post = await this.prisma.post.findFirst({
          where: { id: postId, userId },
          select: { id: true, status: true },
        });

        if (!post) {
          this.logger.warn(`Scheduled post ${postId} not found, skipping`);
          return;
        }

        if (post.status !== 'scheduled') {
          this.logger.log(
            `Post ${postId} is ${post.status}, skipping scheduled publish`,
          );
          return;
        }

        try {
          await this.postsService.publishForUser(postId, userId, {});
          this.logger.log(`Published scheduled post ${postId}`);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Unknown publish error';
          this.logger.error(`Failed to publish scheduled post ${postId}: ${message}`);
        }
      },
      { connection: getRedisConnectionOptions() },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Job ${job?.id ?? 'unknown'} failed: ${error.message}`,
      );
    });

    this.logger.log('Publish post worker started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
  }
}
