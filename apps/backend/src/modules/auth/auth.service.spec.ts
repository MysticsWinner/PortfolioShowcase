import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockMailService = {
      sendOtpEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    mailService = module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if user is inactive', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 1, password: 'hash', isActive: false } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login('test@test.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should return token for active user with correct password', async () => {
      const mockUser = { id: 1, password: 'hash', isActive: true, role: { type: 'ADMIN' } };
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mockToken');

      const result = await service.login('test@test.com', 'password');
      const { password: _, ...expectedUser } = mockUser;
      expect(result).toEqual({ accessToken: 'mockToken', user: expectedUser });
    });
  });

  describe('verifyOtp', () => {
    it('should throw exception if OTP is incorrect', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 15);
      
      usersService.findByEmail.mockResolvedValue({ isActive: false, otp: '123456', otpExpiresAt: futureDate } as any);
      await expect(service.verifyOtp('test@test.com', '654321')).rejects.toThrow(BadRequestException);
    });

    it('should verify OTP and activate user', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 15);
      
      const mockUser = { id: 1, isActive: false, otp: '123456', otpExpiresAt: futureDate, role: { type: 'ADMIN' } };
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      
      const updatedUser = { ...mockUser, isActive: true, otp: null, otpExpiresAt: null };
      usersService.update.mockResolvedValue(updatedUser as any);
      jwtService.sign.mockReturnValue('mockToken');

      const result = await service.verifyOtp('test@test.com', '123456');
      
      const { password: _, otp: __, otpExpiresAt: ___, ...expectedUpdatedUser } = updatedUser;
      expect(result).toEqual({
        message: 'Verification successful!',
        accessToken: 'mockToken',
        user: expectedUpdatedUser,
      });
      expect(usersService.update).toHaveBeenCalledWith(1, { isActive: true, otp: null, otpExpiresAt: null });
    });
  });
});
