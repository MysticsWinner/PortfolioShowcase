import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
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
