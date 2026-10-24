import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: { name: string; email: string; message: string }) {
    const contactMessage = await this.prisma.contactMessage.create({ data });
    
    // Asynchronously dispatch the email notification
    this.mailService.sendContactNotificationEmail(data.name, data.email, data.message).catch(err => {
      console.error('Failed to send contact notification email:', err);
    });

    return contactMessage;
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, isRead: boolean = true) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    });
  }

  async delete(id: string) {
    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }
}
