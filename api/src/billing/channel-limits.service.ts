import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ChannelLimitSnapshot,
  SubscriptionPlan,
} from './channel-limits.types';

const planChannelLimits: Record<SubscriptionPlan, number> = {
  basic: 1,
  pro: 3,
  enterprise: 5,
};

/**
 * Provides channel quota checks with a mock plan source.
 */
@Injectable()
export class ChannelLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns current mock subscription plan for user.
   */
  getPlanForUser(): SubscriptionPlan {
    const configuredPlan = process.env.DEFAULT_SUBSCRIPTION_PLAN?.trim();
    if (
      configuredPlan === 'basic' ||
      configuredPlan === 'pro' ||
      configuredPlan === 'enterprise'
    ) {
      return configuredPlan;
    }
    return 'basic';
  }

  /**
   * Returns channel usage and quota snapshot.
   */
  async getSnapshotForUser(userId: string): Promise<ChannelLimitSnapshot> {
    const plan = this.getPlanForUser();
    const used = await this.prisma.channel.count({
      where: { userId },
    });
    return {
      plan,
      limit: planChannelLimits[plan],
      used,
    };
  }

  /**
   * Throws when user cannot create one more channel.
   */
  async assertCanAddChannel(userId: string): Promise<void> {
    const snapshot = await this.getSnapshotForUser(userId);
    if (snapshot.used >= snapshot.limit) {
      throw new ForbiddenException(
        `Достигнут лимит каналов для тарифа ${snapshot.plan} (${snapshot.limit}). Удалите один из каналов или повысьте тариф.`,
      );
    }
  }
}
