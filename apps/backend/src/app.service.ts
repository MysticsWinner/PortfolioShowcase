import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export interface HostingInfo {
  provider: 'Render' | 'Vercel' | 'Production Cloud' | 'Local Development';
  isRender: boolean;
  isVercel: boolean;
  serviceName: string;
  serviceId?: string;
  externalUrl?: string;
  region: string;
  nodeEnv: string;
  platform: string;
  nodeVersion: string;
  gitCommit?: string;
  gitBranch?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  hosting: HostingInfo;
  services: {
    database: 'connected' | 'disconnected';
  };
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHostingInfo(): HostingInfo {
    const isRender = process.env.RENDER === 'true' || !!process.env.RENDER_SERVICE_ID;
    const isVercel = !!process.env.VERCEL;

    let provider: HostingInfo['provider'] = 'Local Development';
    if (isRender) {
      provider = 'Render';
    } else if (isVercel) {
      provider = 'Vercel';
    } else if (process.env.NODE_ENV === 'production') {
      provider = 'Production Cloud';
    }

    const gitCommit =
      process.env.RENDER_GIT_COMMIT ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT ||
      process.env.GITHUB_SHA ||
      'development';

    const gitBranch =
      process.env.RENDER_GIT_BRANCH ||
      process.env.VERCEL_GIT_COMMIT_REF ||
      process.env.GIT_BRANCH ||
      'unknown';

    return {
      provider,
      isRender,
      isVercel,
      serviceName: process.env.RENDER_SERVICE_NAME || 'portfolio-backend',
      serviceId: process.env.RENDER_SERVICE_ID || undefined,
      externalUrl: process.env.RENDER_EXTERNAL_URL || undefined,
      region: process.env.RENDER_REGION || 'global',
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
      gitCommit,
      gitBranch,
    };
  }

  async getHealth(): Promise<HealthResponse> {
    const hosting = this.getHostingInfo();
    let dbStatus: 'connected' | 'disconnected' = 'connected';

    try {
      // Fast non-blocking ping to verify database connectivity without row locks
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      hosting,
      services: {
        database: dbStatus,
      },
    };
  }

  getHello() {
    const hosting = this.getHostingInfo();
    return {
      message: 'Portfolio Showcase API Gateway Active',
      status: 'online',
      hosting: {
        provider: hosting.provider,
        isRender: hosting.isRender,
        serviceName: hosting.serviceName,
        region: hosting.region,
      },
      healthCheckEndpoint: '/health',
      docs: '/api/docs',
    };
  }
}
