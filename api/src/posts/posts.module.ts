import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TelegramModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
