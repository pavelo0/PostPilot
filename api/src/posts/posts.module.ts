import { Module } from '@nestjs/common';
import { BotConnectionsModule } from '../bot-connections/bot-connections.module';
import { TelegramModule } from '../telegram/telegram.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TelegramModule, BotConnectionsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
