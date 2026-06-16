import { Injectable } from '@nestjs/common';

export type HealthStatus = {
  status: 'ok';
  timestamp: string;
};

@Injectable()
export class HealthService {
  getStatus(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
