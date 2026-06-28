import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { BillingModule } from './billing/billing.module';
import { BotConnectionsModule } from './bot-connections/bot-connections.module';
import { ChannelsModule } from './channels/channels.module';
import { HealthModule } from './health/health.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    HealthModule,
    AuthModule,
    BillingModule,
    BotConnectionsModule,
    ChannelsModule,
    PostsModule,
  ],
})
export class AppModule {}
