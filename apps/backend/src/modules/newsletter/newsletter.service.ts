import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    try {
      const sub = await this.prisma.subscriber.create({
        data: { email },
      });
      return { message: "Successfully subscribed to the matrix.", subscriber: sub };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Identity already registered in the subscription matrix.');
      }
      throw error;
    }
  }
}
