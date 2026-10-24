import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility, ProjectStatus } from '@prisma/client';

export interface RubricConfig {
  liveUrl?: number;
  repoUrl?: number;
  technologies?: number;
  content?: number;
  ownership?: number;
}

export const DEFAULT_RUBRIC: RubricConfig = {
  liveUrl: 30,
  repoUrl: 25,
  technologies: 20,
  content: 15,
  ownership: 10,
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  calculateScore(project: any, customRubric?: RubricConfig) {
    const rubric = { ...DEFAULT_RUBRIC, ...(customRubric || project?.rubricConfig || {}) };
    const totalMax = (rubric.liveUrl || 0) + (rubric.repoUrl || 0) + (rubric.technologies || 0) + (rubric.content || 0) + (rubric.ownership || 0) || 100;

    const breakdown: Record<string, { label: string; maxPoints: number; earnedPoints: number; details: string }> = {};

    // 1. Live Deployment & Health (default 30 pts)
    const liveMax = rubric.liveUrl || 30;
    let liveEarned = 0;
    let liveDetails = 'No live URL provided';
    if (project.liveUrl) {
      if (project.healthStatus === 'ONLINE') {
        liveEarned = liveMax;
        liveDetails = 'Live URL verified online and responsive';
      } else if (project.healthStatus === 'DEGRADED') {
        liveEarned = Math.round(liveMax * 0.5);
        liveDetails = 'Live URL reachable but returned warning/status >= 400';
      } else if (project.healthStatus === 'PENDING' || !project.healthStatus) {
        liveEarned = Math.round(liveMax * 0.7);
        liveDetails = 'Live URL provided (pending verification check)';
      } else {
        liveEarned = 0;
        liveDetails = 'Live URL is offline or unreachable';
      }
    }
    breakdown.liveUrl = {
      label: 'Live Deployment & Health',
      maxPoints: liveMax,
      earnedPoints: liveEarned,
      details: liveDetails,
    };

    // 2. Source Code Repository (default 25 pts)
    const repoMax = rubric.repoUrl || 25;
    let repoEarned = 0;
    let repoDetails = 'No repository link provided';
    if (project.repoUrl && /^https?:\/\//i.test(project.repoUrl)) {
      repoEarned = repoMax;
      repoDetails = 'Valid public repository link linked';
    }
    breakdown.repoUrl = {
      label: 'Source Code Repository',
      maxPoints: repoMax,
      earnedPoints: repoEarned,
      details: repoDetails,
    };

    // 3. Technology Breadth (default 20 pts)
    const techMax = rubric.technologies || 20;
    let techEarned = 0;
    const techCount = Array.isArray(project.technologies) ? project.technologies.length : 0;
    if (techCount >= 4) {
      techEarned = techMax;
    } else if (techCount > 0) {
      techEarned = Math.round((techCount / 4) * techMax);
    }
    breakdown.technologies = {
      label: 'Technology Breadth',
      maxPoints: techMax,
      earnedPoints: techEarned,
      details: `${techCount} technologies identified (${techCount >= 4 ? 'Complete stack' : 'Add more stack tags'})`,
    };

    // 4. Project Documentation & Content (default 15 pts)
    const contentMax = rubric.content || 15;
    let contentEarned = 0;
    const contentLength = (project.content || '').trim().length;
    if (contentLength >= 200) {
      contentEarned = contentMax;
    } else if (contentLength >= 80) {
      contentEarned = Math.round(contentMax * 0.6);
    } else if (contentLength > 0) {
      contentEarned = Math.round(contentMax * 0.3);
    }
    breakdown.content = {
      label: 'Project Documentation & Deep-Dive',
      maxPoints: contentMax,
      earnedPoints: contentEarned,
      details: contentLength > 0 ? `${contentLength} characters of documentation` : 'No detailed markdown documentation',
    };

    // 5. Title & Ownership Clarity (default 10 pts)
    const ownerMax = rubric.ownership || 10;
    let ownerEarned = 0;
    const descLength = (project.description || '').trim().length;
    const titleLength = (project.title || '').trim().length;
    if (titleLength >= 3 && descLength >= 25) {
      ownerEarned = ownerMax;
    } else if (titleLength >= 3) {
      ownerEarned = Math.round(ownerMax * 0.5);
    }
    breakdown.ownership = {
      label: 'Title & Overview Clarity',
      maxPoints: ownerMax,
      earnedPoints: ownerEarned,
      details: descLength >= 25 ? 'Strong title and description summary' : 'Brief or missing description',
    };

    const rawTotal = liveEarned + repoEarned + techEarned + contentEarned + ownerEarned;
    const normalizedScore = totalMax === 100 ? rawTotal : Math.round((rawTotal / totalMax) * 100);

    return {
      score: Math.min(100, Math.max(0, normalizedScore)),
      breakdown,
      rubric,
    };
  }

  findPublic(options?: { includeCreator?: boolean }) {
    if (options?.includeCreator) {
      return this.prisma.project.findMany({
        where: { visibility: Visibility.PUBLIC },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          technologies: {
            include: { technology: true },
          },
        },
      });
    }
    return this.prisma.project.findMany({
      where: { visibility: Visibility.PUBLIC },
    });
  }

  findPrivate(options?: { includeCreator?: boolean }) {
    if (options?.includeCreator) {
      return this.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          technologies: {
            include: { technology: true },
          },
        },
      });
    }
    return this.prisma.project.findMany();
  }

  findUserProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        technologies: {
          include: { technology: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        technologies: {
          include: { technology: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async create(data: any, creatorId?: string) {
    const finalData = { ...data };
    if (creatorId && !finalData.creatorId && !finalData.creator) {
      finalData.creatorId = creatorId;
    }
    const techNames = Array.isArray(finalData.technologies) ? finalData.technologies : [];
    delete finalData.technologies;

    if (finalData.liveUrl !== undefined || finalData.repoUrl !== undefined || techNames.length > 0) {
      if (finalData.workabilityScore === undefined) {
        const { score } = this.calculateScore({
          ...finalData,
          technologies: techNames,
        });
        finalData.workabilityScore = score;
      }

      if (finalData.liveUrl && !finalData.healthStatus) {
        finalData.healthStatus = 'PENDING';
      } else if (!finalData.liveUrl) {
        finalData.healthStatus = 'NO_LINK';
      }
    }

    const created = await this.prisma.project.create({ data: finalData });

    if (techNames.length > 0) {
      await this.attachTechnologies(created.id, techNames);
      return (await this.findOne(created.id)) || created;
    }

    return created;
  }


  async bulkCreate(userId: string, candidateProjects: any[]) {
    const createdProjects: any[] = [];

    for (const item of candidateProjects) {
      const techNames: string[] = Array.isArray(item.technologies)
        ? item.technologies.filter(Boolean)
        : [];

      // Default to DRAFT and PRIVATE unless explicitly chosen by user
      const projectPayload: any = {
        title: item.title || 'Untitled Project',
        description: item.description || '',
        content: item.content || null,
        repoUrl: item.repoUrl || null,
        liveUrl: item.liveUrl || null,
        thumbnail: item.thumbnail || null,
        status: item.status || ProjectStatus.DRAFT,
        visibility: item.visibility || Visibility.PRIVATE,
        rubricConfig: item.rubricConfig || DEFAULT_RUBRIC,
        healthStatus: item.liveUrl ? 'PENDING' : 'NO_LINK',
        creatorId: userId,
      };

      const { score } = this.calculateScore({
        ...projectPayload,
        technologies: techNames,
      });
      projectPayload.workabilityScore = score;

      const project = await this.prisma.project.create({
        data: projectPayload,
      });

      if (techNames.length > 0) {
        await this.attachTechnologies(project.id, techNames);
      }

      createdProjects.push(await this.findOne(project.id));
    }

    return {
      count: createdProjects.length,
      projects: createdProjects,
    };
  }

  private async attachTechnologies(projectId: string, techNames: string[]) {
    for (const rawName of techNames) {
      const cleanName = String(rawName).trim();
      if (!cleanName) continue;

      const tech = await this.prisma.technology.upsert({
        where: { name: cleanName },
        update: {},
        create: { name: cleanName },
      });

      await this.prisma.projectTechnology.upsert({
        where: {
          projectId_technologyId: {
            projectId,
            technologyId: tech.id,
          },
        },
        update: {},
        create: {
          projectId,
          technologyId: tech.id,
        },
      }).catch(() => null);
    }
  }

  async checkHealth(id: string, userId?: string, isAdmin?: boolean) {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (userId && !isAdmin && project.creatorId !== userId) {
      throw new UnauthorizedException('You do not have permission to run health check on this project.');
    }

    let status = 'NO_LINK';
    if (project.liveUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(project.liveUrl, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'PortfolioShowcase-HealthCheck/1.0' },
        }).catch(async () => {
          // Fallback to GET in case HEAD is blocked by host
          return await fetch(project.liveUrl!, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'PortfolioShowcase-HealthCheck/1.0' },
          });
        });

        clearTimeout(timeoutId);

        if (res && res.status >= 200 && res.status < 400) {
          status = 'ONLINE';
        } else if (res && res.status >= 400 && res.status < 600) {
          status = 'DEGRADED';
        } else {
          status = 'OFFLINE';
        }
      } catch (err) {
        status = 'OFFLINE';
      }
    }

    const { score, breakdown, rubric } = this.calculateScore({
      ...project,
      healthStatus: status,
    });

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        healthStatus: status,
        lastHealthCheck: new Date(),
        workabilityScore: score,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        technologies: {
          include: { technology: true },
        },
      },
    });

    return {
      project: updated,
      score,
      healthStatus: status,
      breakdown,
      rubric,
    };
  }

  async updateRubric(id: string, userId: string, rubricConfig: RubricConfig, isAdmin?: boolean) {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (userId && !isAdmin && project.creatorId !== userId) {
      throw new UnauthorizedException('You do not have permission to modify this project rubric.');
    }

    const { score, breakdown, rubric } = this.calculateScore(project, rubricConfig);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        rubricConfig: rubricConfig as any,
        workabilityScore: score,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        technologies: {
          include: { technology: true },
        },
      },
    });

    return {
      project: updated,
      score,
      breakdown,
      rubric,
    };
  }

  async update(id: string, data: any, userId?: string, isAdmin?: boolean) {
    if (userId && !isAdmin) {
      const existing = await this.prisma.project.findUnique({ where: { id } });
      if (!existing || existing.creatorId !== userId) {
        throw new UnauthorizedException('You do not have permission to modify this project.');
      }
    }
    const { id: _, creatorId: __, creator: ___, createdAt: ____, updatedAt: _____, technologies, ...cleanData } = data;
    
    // Recalculate score if liveUrl or repoUrl changed
    if (cleanData.liveUrl !== undefined || cleanData.repoUrl !== undefined || cleanData.content !== undefined) {
      const current = await this.prisma.project.findUnique({
        where: { id },
        include: { technologies: { include: { technology: true } } },
      });
      if (current) {
        const { score } = this.calculateScore({
          ...current,
          ...cleanData,
        });
        cleanData.workabilityScore = score;
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: cleanData,
    });

    if (Array.isArray(technologies)) {
      await this.attachTechnologies(id, technologies);
    }

    return this.findOne(id);
  }

  async delete(id: string, userId?: string, isAdmin?: boolean) {
    if (userId && !isAdmin) {
      const existing = await this.prisma.project.findUnique({ where: { id } });
      if (!existing || existing.creatorId !== userId) {
        throw new UnauthorizedException('You do not have permission to delete this project.');
      }
    }
    // Delete join table references first
    await this.prisma.projectTechnology.deleteMany({ where: { projectId: id } }).catch(() => null);
    await this.prisma.projectTag.deleteMany({ where: { projectId: id } }).catch(() => null);
    return this.prisma.project.delete({ where: { id } });
  }
}

