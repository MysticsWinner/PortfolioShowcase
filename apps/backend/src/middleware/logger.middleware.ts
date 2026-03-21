import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  private logFilePath = path.join(process.cwd(), 'system.log');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const duration = Date.now() - startTime;
      
      const rawStatus = statusCode >= 400 ? 'FAILED' : 'SUCCESS';
      const colorStatus = statusCode >= 400 ? '\x1b[31mFAILED\x1b[0m' : '\x1b[32mSUCCESS\x1b[0m';
      
      const consoleOut = `[${method}] incoming from ${ip} to ${originalUrl} ${colorStatus} - ${duration}ms`;
      const fileOut = `[${new Date().toISOString()}] [HTTP] [${method}] incoming from ${ip} to ${originalUrl} ${rawStatus} - ${duration}ms\n`;

      this.logger.log(consoleOut);

      // Asynchronously append to filesystem without blocking response
      fs.appendFile(this.logFilePath, fileOut, (err) => {
        if (err) console.error('CRITICAL: Failed to write to system.log', err);
      });
    });

    next();
  }
}
