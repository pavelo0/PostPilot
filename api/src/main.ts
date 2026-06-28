import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(AuthService)));
  app.enableShutdownHooks();
  app.set('trust proxy', 1);

  if (process.env.CORS_ORIGIN) {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
