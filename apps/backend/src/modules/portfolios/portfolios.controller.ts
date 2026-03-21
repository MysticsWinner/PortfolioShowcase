import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  async createPortfolio(@Request() req, @Body() body: { title: string; data: string }) {
    if (!body.title || !body.data) {
      throw new Error('Title and data are required');
    }
    return this.portfoliosService.createPortfolio(req.user.id, body.title, body.data);
  }

  @Get()
  async getPortfolios(@Request() req) {
    return this.portfoliosService.getUserPortfolios(req.user.id);
  }

  @Delete(':id')
  async deletePortfolio(@Request() req, @Param('id') id: string) {
    return this.portfoliosService.deletePortfolio(req.user.id, id);
  }
}

