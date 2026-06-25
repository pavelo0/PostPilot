export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export type ChannelLimitSnapshot = {
  plan: SubscriptionPlan;
  limit: number;
  used: number;
};
