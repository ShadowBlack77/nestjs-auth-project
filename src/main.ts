import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api/v1");
  app.enableCors({
    credentials: true
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
