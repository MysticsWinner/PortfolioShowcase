import { Controller, Post, Body, Get, Patch, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('verify')
  verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('User session invalid or expired');
    }
    const { password, otp, otpExpiresAt, ...safeUser } = req.user;
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() body: { name?: string }) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }
}

