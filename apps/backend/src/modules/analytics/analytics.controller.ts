import { Controller, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  track(@Body() body: { eventName: string; path?: string; visitorId?: string }) {
    // We intentionally don't await this to keep the API extremely fast (fire & forget)
    this.analyticsService.trackEvent(body.eventName, body.path, body.visitorId);
    return { ok: true };
  }
}
