import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`[INCOMING] ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`);
    
    // Log the request body if it exists (masking password)
    if (request.body && Object.keys(request.body).length > 0) {
      const sanitizedBody = { ...request.body };
      if (sanitizedBody.password) sanitizedBody.password = '***';
      this.logger.debug(`[PAYLOAD] ${JSON.stringify(sanitizedBody)}`);
    }

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      if (statusCode >= 400) {
        this.logger.warn(
          `[OUTGOING] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} \x1b[33m+${duration}ms\x1b[0m`
        );
      } else {
        this.logger.log(
          `[OUTGOING] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} \x1b[32m+${duration}ms\x1b[0m`
        );
      }
    });

    next();
  }
}
