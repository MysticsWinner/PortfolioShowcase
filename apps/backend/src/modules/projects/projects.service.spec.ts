import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      project: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPublic', () => {
    it('should return only public projects', async () => {
      const mockProjects = [{ id: 1, name: 'Project 1', visibility: Visibility.PUBLIC }];
      prisma.project.findMany.mockResolvedValue(mockProjects as any);

      const result = await service.findPublic();
      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({ where: { visibility: Visibility.PUBLIC } });
    });
  });

  describe('findPrivate', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1', visibility: Visibility.PUBLIC },
        { id: 2, name: 'Project 2', visibility: Visibility.PRIVATE },
      ];
      prisma.project.findMany.mockResolvedValue(mockProjects as any);

      const result = await service.findPrivate();
      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith();
    });
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto = { name: 'New Project' };
      const createdProject = { id: 1, ...dto };
      prisma.project.create.mockResolvedValue(createdProject as any);

      const result = await service.create(dto);
      expect(result).toEqual(createdProject);
      expect(prisma.project.create).toHaveBeenCalledWith({ data: dto });
    });
  });
});
