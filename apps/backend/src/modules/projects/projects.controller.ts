import { Controller, Get, Post, Body, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  getPublic() {
    return this.projects.findPublic();
  }

  @Get('private')
  getPrivate() {
    return this.projects.findPrivate();
  }

  @Post()
  create(@Body() body: any) {
    return this.projects.create(body);
  }
}
