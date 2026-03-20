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
    const user = await this.users.findByEmail(email);

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, role: user.role.type };

    return {
      accessToken: this.jwt.sign(payload),
      user,
    };
  }
}
