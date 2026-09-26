import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppValidationPipe } from '@/common/pipes';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new AppValidationPipe());
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
