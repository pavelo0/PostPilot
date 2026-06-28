import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BotConnectionsModule } from '../bot-connections/bot-connections.module';
import { TelegramModule } from '../telegram/telegram.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TelegramModule,
    BotConnectionsModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
