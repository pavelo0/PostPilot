import { Module } from '@nestjs/common';
import { ChannelLimitsService } from './channel-limits.service';

@Module({
  providers: [ChannelLimitsService],
  exports: [ChannelLimitsService],
})
export class BillingModule {}
