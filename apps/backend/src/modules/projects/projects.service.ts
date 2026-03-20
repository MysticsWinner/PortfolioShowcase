import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  findPublic() {
    return this.prisma.project.findMany({
      where: { visibility: Visibility.PUBLIC },
    });
  }

  findPrivate() {
    return this.prisma.project.findMany();
  }

  create(data: any) {
    return this.prisma.project.create({ data });
  }
}
