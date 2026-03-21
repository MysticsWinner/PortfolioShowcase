import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request, UseInterceptors, UploadedFile, StreamableFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfoliosService } from './portfolios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { multerConfig } from './portfolios.multer';
import type { Response } from 'express';

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

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@Request() req, @Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Binary stream payload missing.');
    return this.portfoliosService.uploadPortfolioFile(req.user.id, id, file);
  }

  @Get(':id/download')
  async downloadFile(@Request() req, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return this.portfoliosService.downloadPortfolioFile(req.user.id, id, res);
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

