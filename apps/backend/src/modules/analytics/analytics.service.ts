import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async trackEvent(eventName: string, path?: string, visitorId?: string) {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          eventName,
          path,
          visitorId,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to record analytics event: ${error.message}`);
    }
  }

  // Dashboard admin retrieval method
  async getMetrics() {
    return this.prisma.analyticsEvent.count();
  }
}
