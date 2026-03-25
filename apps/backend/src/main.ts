import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl ? frontendUrl : [
      'http://localhost:3000',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  app.use(cookieParser());

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Server booted securely on port ${port} and env picked up!`);
}
bootstrap();
