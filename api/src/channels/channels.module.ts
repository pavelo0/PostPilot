import { Module } from '@nestjs/common';
import { BotConnectionsModule } from '../bot-connections/bot-connections.module';
import { BillingModule } from '../billing/billing.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
  imports: [TelegramModule, BotConnectionsModule, BillingModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
