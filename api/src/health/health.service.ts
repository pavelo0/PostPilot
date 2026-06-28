import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

export type HealthStatus = {
  status: 'ok' | 'degraded';
  timestamp: string;
  db: 'up' | 'down';
  email: 'configured' | 'missing';
};

/**
 * Проверка живости API и readiness (PostgreSQL, email delivery).
 */
@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async getStatus(): Promise<HealthStatus> {
    const dbUp = await this.checkDatabase();
    const emailConfigured = this.emailService.isConfigured();

    return {
      status: dbUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      db: dbUp ? 'up' : 'down',
      email: emailConfigured ? 'configured' : 'missing',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
