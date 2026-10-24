import { Controller, Get, Post, Patch, Delete, Body, Param, UseInterceptors, UseGuards, Request } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  getPublic() {
    return this.projects.findPublic({ includeCreator: true });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyProjects(@Request() req: any) {
    return this.projects.findUserProjects(req.user.id);
  }

  @Get('private')
  @UseGuards(JwtAuthGuard)
  getPrivate() {
    return this.projects.findPrivate({ includeCreator: true });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const project = await this.projects.findOne(id);
    if (!project) return null;
    const { breakdown, rubric } = this.projects.calculateScore(project);
    return {
      ...project,
      breakdown,
      rubric,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() body: any) {
    return this.projects.create(body, req.user?.id);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  bulkCreate(@Request() req: any, @Body() body: { projects: any[] }) {
    return this.projects.bulkCreate(req.user.id, body.projects || []);
  }

  @Post(':id/health-check')
  @UseGuards(JwtAuthGuard)
  checkHealth(@Request() req: any, @Param('id') id: string) {
    const isAdmin = req.user?.role?.type === 'ADMIN';
    return this.projects.checkHealth(id, req.user?.id, isAdmin);
  }

  @Patch(':id/rubric')
  @UseGuards(JwtAuthGuard)
  updateRubric(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const isAdmin = req.user?.role?.type === 'ADMIN';
    return this.projects.updateRubric(id, req.user?.id, body, isAdmin);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const isAdmin = req.user?.role?.type === 'ADMIN';
    return this.projects.update(id, body, req.user?.id, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Request() req: any, @Param('id') id: string) {
    const isAdmin = req.user?.role?.type === 'ADMIN';
    return this.projects.delete(id, req.user?.id, isAdmin);
  }
}

