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
}
