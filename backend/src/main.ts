import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api/api.module';

function configureCors(app: INestApplication): void {
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({ origin: '*' });
  } else {
    app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(';') });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  configureCors(app);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}
bootstrap();
