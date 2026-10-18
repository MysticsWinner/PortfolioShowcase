import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  const configService = app.get(ConfigService);

  const rawFrontendUrl = configService.get<string>('FRONTEND_URL') || '';
  const configuredOrigins = rawFrontendUrl
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const staticAllowedOrigins = [
    'https://www.awesomeprojects.in',
    'https://awesomeprojects.in',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    ...configuredOrigins,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health checks)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/+$/, '');

      // Allow wildcard match if FRONTEND_URL is explicitly '*' or 'all'
      if (rawFrontendUrl === '*' || rawFrontendUrl.toLowerCase() === 'all' || configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      // Check statically known domains
      if (staticAllowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow any Vercel domain (production, preview deployments, branches)
      if (cleanOrigin.endsWith('.vercel.app') || /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow awesomeprojects.in and any subdomains
      if (/^https?:\/\/(.*\.)?awesomeprojects\.in$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow localhost with any port in local dev environments
      if (/^https?:\/\/localhost(:\d+)?$/.test(cleanOrigin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser());

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Server booted securely on port ${port} and env picked up!`);
}
bootstrap();
