import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { HealthService, type HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async getHealth(): Promise<HealthStatus> {
    const status = await this.healthService.getStatus();

    if (status.db === 'down') {
      throw new ServiceUnavailableException(status);
    }

    return status;
  }
}
