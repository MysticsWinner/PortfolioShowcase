import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PortfoliosService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret || secret.length !== 32) {
      throw new Error('ENCRYPTION_KEY environment variable must be 32 characters long');
    }
    this.key = Buffer.from(secret, 'utf-8');
  }

  async createPortfolio(userId: string, title: string, rawData: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(rawData, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return this.prisma.portfolio.create({
      data: {
        userId,
        title,
        data: encrypted,
        iv: iv.toString('hex'),
      },
    });
  }

  async getUserPortfolios(userId: string) {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return portfolios.map((portfolio) => {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(portfolio.iv, 'hex'),
      );

      let decrypted = decipher.update(portfolio.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return {
        ...portfolio,
        data: decrypted, // Replaced encrypted data with decrypted data
      };
    });
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    // Ensuring user owns the portfolio before deleting
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio || portfolio.userId !== userId) {
      throw new BadRequestException('Portfolio not found or unauthorized');
    }

    return this.prisma.portfolio.delete({
      where: { id: portfolioId },
    });
  }
}
