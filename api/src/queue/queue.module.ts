import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ScheduleService } from './schedule.service';

@Module({
  providers: [QueueService, ScheduleService],
  exports: [QueueService, ScheduleService],
})
export class QueueModule {}
