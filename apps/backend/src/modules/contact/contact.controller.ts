import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contact: ContactService) {}

  @Post()
  submit(@Body() body: any) {
    return this.contact.create(body);
  }
}
