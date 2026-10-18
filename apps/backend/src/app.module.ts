import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './middleware/logger.middleware';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ContactModule } from './modules/contact/contact.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailModule } from './modules/mail/mail.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CacheModule.register({ isGlobal: true, ttl: 60000 }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ContactModule,
    PortfoliosModule,
    AdminModule,
    MailModule,
    NewsletterModule,
    ChatModule,
    AnalyticsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
