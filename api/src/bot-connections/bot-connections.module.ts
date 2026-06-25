import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { BotConnectionsController } from './bot-connections.controller';
import { BotConnectionsService } from './bot-connections.service';

@Module({
  imports: [TelegramModule],
  controllers: [BotConnectionsController],
  providers: [BotConnectionsService],
  exports: [BotConnectionsService],
})
export class BotConnectionsModule {}
