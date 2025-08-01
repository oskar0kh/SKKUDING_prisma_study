import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common'; // pipe용 ValidationPipe 적용

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // 모든 HTTP Request에 대해 DTO 유효성 검사 진행

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();