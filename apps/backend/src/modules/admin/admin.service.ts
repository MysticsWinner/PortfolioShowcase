import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        role: {
          select: { type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
  }

  async toggleUserRole(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) throw new NotFoundException('User not found');

    const newRoleType = user.role.type === 'ADMIN' ? 'VIEWER' : 'ADMIN';
    const newRole = await this.prisma.role.findUnique({ where: { type: newRoleType } });

    if (!newRole) throw new NotFoundException(`Role ${newRoleType} not initialized in DB`);

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: newRole.id },
      select: { id: true, role: { select: { type: true } } },
    });
  }
}
