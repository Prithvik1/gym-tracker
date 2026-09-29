import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Restrict to the deployed web origin in prod; falls back to open (true) for
  // local dev when WEB_ORIGIN is unset.
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
