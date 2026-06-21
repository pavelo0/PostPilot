import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { HealthModule } from './health/health.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    ChannelsModule,
    PostsModule,
  ],
})
export class AppModule {}
