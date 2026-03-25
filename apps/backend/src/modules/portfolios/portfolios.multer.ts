import { memoryStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export const multerConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB strict limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Only permit PDF and DOCX binary extensions over the network stream
    if (file.mimetype.match(/\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('CRITICAL: Unsupported file extension. Only .pdf, .doc, and .docx are permitted.'), false);
    }
  },
  storage: memoryStorage(),
};
