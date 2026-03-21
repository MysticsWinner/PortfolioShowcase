import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.users.findByEmail(email);

      if (!user || !(await compare(password, user.password))) {
        const { UnauthorizedException } = await import('@nestjs/common');
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        const { UnauthorizedException } = await import('@nestjs/common');
        throw new UnauthorizedException('Email not confirmed. Please check your inbox.');
      }

      const payload = { sub: user.id, role: user.role?.type || 'VIEWER' };

      return {
        accessToken: this.jwt.sign(payload),
        user,
      };
    } catch (e: any) {
      if (e.name === 'UnauthorizedException') throw e;
      return { message: "DEBUG_LOGIN_ERROR", error: e.stack || e.message };
    }
  }

  async register(name: string, email: string, pass: string) {
    try {
      const { hash } = await import('bcrypt');
      const hashedPassword = await hash(pass, 10);
      const user = await this.users.create({
        name,
        email,
        password: hashedPassword,
      });

      if (!user.isActive) {
        return { requiresConfirmation: true, message: 'Please confirm your email' };
      }

      const payload = { sub: user.id, role: 'VIEWER' };
      return {
        accessToken: this.jwt.sign(payload),
        user,
      };
    } catch (e: any) {
      if (e.code === 'P2002') {
        const { ConflictException } = await import('@nestjs/common');
        throw new ConflictException('Email already in use.');
      }
      throw e;
    }
  }
}
