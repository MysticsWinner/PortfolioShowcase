import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private logger = new Logger('MailService');

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<string>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (host && host !== 'smtp.example.com') {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port || '587', 10),
        secure: parseInt(port || '587', 10) === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Live SMTP nodelayer initialized securely.');
    } else {
      this.logger.warn('Live SMTP constraints not found. Defaulting to Console Simulation rendering.');
    }
  }

  async sendOtpEmail(to: string, otp: string, isResend = false) {
    const from = this.configService.get<string>('MAIL_FROM') || 'noreply@yourdomain.com';
    const subjectTitle = isResend ? 'Your Re-issued Verification Code' : 'Your Verification Code';

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Portfolio Showcase Auth" <${from}>`,
          to,
          subject: subjectTitle,
          text: `Your security verification code is: ${otp}\n\nThis code equates to a 15-minute cryptographic expiry window.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #000; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #333; color: #fff;">
              <h2 style="color: #06b6d4; text-align: center;">Verify Your Identity</h2>
              <p style="text-align: center; color: #aaa;">Please use the following single-use credential to unlock your matrix environment.</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #fff; background: #222; padding: 15px 30px; border-radius: 8px;">${otp}</span>
              </div>
              <p style="font-size: 12px; text-align: center; color: #666;">This cryptographic payload expires mathematically in 15 minutes.</p>
            </div>
          `,
        });
        this.logger.log(`SMTP Transmission successfully dispatched to: ${to}`);
      } catch (error) {
        this.logger.error(`CRITICAL: SMTP routing rejected. Falling back to Console.`);
        this.fallbackConsoleLog(to, otp, isResend);
      }
    } else {
      this.fallbackConsoleLog(to, otp, isResend);
    }
  }

  async sendContactNotificationEmail(submitterName: string, submitterEmail: string, message: string) {
    const from = this.configService.get<string>('MAIL_FROM') || 'noreply@yourdomain.com';
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Portfolio Alerts" <${from}>`,
          to: adminEmail,
          subject: `New Contact Form Submission from ${submitterName}`,
          text: `You have received a new contact submission.\n\nName: ${submitterName}\nEmail: ${submitterEmail}\nMessage:\n${message}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #111; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #fff; border: 1px solid #333;">
              <h2 style="color: #38b2ac; border-bottom: 1px solid #333; padding-bottom: 10px;">New Contact Payload Intercepted</h2>
              <p><strong>Name:</strong> ${submitterName}</p>
              <p><strong>Email:</strong> <a href="mailto:${submitterEmail}" style="color: #06b6d4;">${submitterEmail}</a></p>
              <div style="background: #222; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="white-space: pre-wrap; margin: 0; color: #ccc;">${message}</p>
              </div>
            </div>
          `,
        });
        this.logger.log(`SMTP Contact Alert successfully dispatched to: ${adminEmail}`);
      } catch (error) {
        this.logger.error(`CRITICAL: SMTP routing rejected for contact alert. Falling back to Console.`);
        this.fallbackContactConsoleLog(submitterName, submitterEmail, message);
      }
    } else {
      this.fallbackContactConsoleLog(submitterName, submitterEmail, message);
    }
  }

  private fallbackConsoleLog(to: string, otp: string, isResend: boolean) {
    console.log(`\n======================================`);
    if (isResend) console.log(`🔁 MOCK RESEND DISPATCH TO: ${to}`);
    else console.log(`📧 MOCK EMAIL DISPATCH TO: ${to}`);
    console.log(`🔑 SECURE OTP CODE: ${otp}`);
    console.log(`======================================\n`);
  }

  private fallbackContactConsoleLog(name: string, email: string, message: string) {
    console.log(`\n======================================`);
    console.log(`📬 MOCK CONTACT ALERT DISPATCH`);
    console.log(`FROM: ${name} (${email})`);
    console.log(`MESSAGE:\n${message}`);
    console.log(`======================================\n`);
  }
}
