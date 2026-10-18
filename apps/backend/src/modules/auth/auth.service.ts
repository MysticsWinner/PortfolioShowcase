import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  private generateOtp(): { otp: string; expiresAt: Date } {
    const length = parseInt(this.configService.get<string>('OTP_LENGTH') || '6', 10);
    const type = this.configService.get<string>('OTP_TYPE') || 'numeric';

    let chars = '0123456789';
    if (type === 'alphanumeric') {
      chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    }

    let otp = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      otp += chars[randomIndex];
    }

    // OTP Expires in 15 minutes globally
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return { otp, expiresAt };
  }

  async login(email: string, password: string) {
    try {
      const user = await this.users.findByEmail(email);

      if (!user || !(await compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'ACCOUNT_NOT_VERIFIED',
          email: user.email,
        });
      }

      const payload = { sub: user.id, role: user.role?.type || 'VIEWER' };
      const { password: _, otp: __, otpExpiresAt: ___, ...sanitizedUser } = user;

      return {
        accessToken: this.jwt.sign(payload),
        user: sanitizedUser,
      };
    } catch (e: any) {
      if (e.name === 'UnauthorizedException' || e.status === 401) throw e;
      const { InternalServerErrorException } = await import('@nestjs/common');
      throw new InternalServerErrorException('Authentication service temporarily unavailable. Please try again.');
    }
  }

  async register(name: string, email: string, pass: string) {
    try {
      const { hash } = await import('bcrypt');
      const hashedPassword = await hash(pass, 10);

      const { otp, expiresAt } = this.generateOtp();

      const user = await this.users.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt: expiresAt,
        isActive: false,
      });

      // SMTP Email Dispatch (or fallback to console gracefully internally)
      await this.mailService.sendOtpEmail(email, otp, false);

      return { requiresVerification: true, email: user.email };
    } catch (e: any) {
      if (e.code === 'P2002') {
        const { ConflictException } = await import('@nestjs/common');
        throw new ConflictException('Email already in use.');
      }
      throw e;
    }
  }

  async verifyOtp(email: string, submittedOtp: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid verification attempt.');

    if (user.isActive) {
      throw new BadRequestException('Account is already fully authorized.');
    }

    if (user.otp !== submittedOtp) {
      throw new BadRequestException('The OTP provided is mathematically incorrect.');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('The OTP has expired. Please request a new transmission.');
    }

    // Activate user and nullify OTP constraints
    const activatedUser = await this.users.update(user.id, {
      isActive: true,
      otp: null,
      otpExpiresAt: null,
    });

    const payload = { sub: activatedUser.id, role: activatedUser.role?.type || 'VIEWER' };
    const { password: _, otp: __, otpExpiresAt: ___, ...sanitizedUser } = activatedUser;

    return {
      message: "Verification successful!",
      accessToken: this.jwt.sign(payload),
      user: sanitizedUser,
    };
  }

  async resendOtp(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid email block.');
    if (user.isActive) throw new BadRequestException('Account is already active.');

    const { otp, expiresAt } = this.generateOtp();

    await this.users.update(user.id, {
      otp,
      otpExpiresAt: expiresAt,
    });

    await this.mailService.sendOtpEmail(email, otp, true);

    return { message: "New OTP actively dispatched." };
  }
}
