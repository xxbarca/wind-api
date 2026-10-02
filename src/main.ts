import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppValidationPipe } from '@/common/pipes';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new AppValidationPipe());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true, // 允许所有来源
    // origin: 'http://localhost:3000', // 允许特定来源
    // origin: ['http://localhost:3000', 'https://example.com'], // 允许多个来源
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    preflightContinue: false,
  });
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  });
  await app.listen(3000);
}
bootstrap();
