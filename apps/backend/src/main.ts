import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Server booted securely on port ${port} and env picked up!`);
}
bootstrap();
