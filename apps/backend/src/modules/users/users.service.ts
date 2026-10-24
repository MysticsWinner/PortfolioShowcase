import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async create(data: any) {
    let viewerRole = await this.prisma.role.findUnique({ where: { type: 'VIEWER' } });
    if (!viewerRole) {
      viewerRole = await this.prisma.role.create({ data: { type: 'VIEWER' } });
    }
    return this.prisma.user.create({
      data: {
        ...data,
        roleId: viewerRole.id,
      },
      include: { role: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }
}
