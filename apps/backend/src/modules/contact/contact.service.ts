import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.contactMessage.create({ data });
  }
}
