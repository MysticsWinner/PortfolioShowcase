import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private contact: ContactService) {}

  @Post()
  submit(@Body() body: any) {
    return this.contact.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.contact.findAll();
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Param('id') id: string, @Body() body: { isRead?: boolean }) {
    return this.contact.markAsRead(id, body?.isRead ?? true);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) {
    return this.contact.delete(id);
  }
}
