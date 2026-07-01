import { Module } from '@nestjs/common';
import { BotConnectionsModule } from '../bot-connections/bot-connections.module';
import { MediaModule } from '../media/media.module';
import { PostsModule } from '../posts/posts.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PublishPostWorker } from '../queue/publish-post.worker';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, MediaModule, QueueModule, PostsModule],
  providers: [PublishPostWorker],
})
export class WorkerModule {}
