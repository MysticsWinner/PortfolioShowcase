import { Controller, Get, Post, Body, Delete, Param, Query } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  async createPortfolio(@Body() body: { userId: string; title: string; data: string }) {
    if (!body.title || !body.data || !body.userId) {
      throw new Error('UserId, title, and data are required');
    }
    return this.portfoliosService.createPortfolio(body.userId, body.title, body.data);
  }

  @Get()
  async getPortfolios(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('UserId is required');
    }
    return this.portfoliosService.getUserPortfolios(userId);
  }

  @Delete(':id')
  async deletePortfolio(@Query('userId') userId: string, @Param('id') id: string) {
    if (!userId) {
      throw new Error('UserId is required');
    }
    return this.portfoliosService.deletePortfolio(userId, id);
  }
}

