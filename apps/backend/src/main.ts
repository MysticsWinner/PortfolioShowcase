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
  if (!frontendUrl) {
    console.warn("WARNING: FRONTEND_URL is wildly undefined. CORS is restricting all cross-origin requests.");
  }
  
  app.enableCors({
    origin: frontendUrl || false,
    credentials: true,
  });

  app.use(cookieParser());

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Server booted securely on port ${port} and env picked up!`);
}
bootstrap();
