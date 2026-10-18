import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return API Gateway info', () => {
      const result = appController.getRoot();
      expect(result.message).toContain('Portfolio Showcase');
      expect(result.status).toBe('online');
      expect(result.hosting).toBeDefined();
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      const result = await appController.getHealth();
      expect(result.status).toBe('healthy');
      expect(result.hosting).toBeDefined();
    });
  });
});
