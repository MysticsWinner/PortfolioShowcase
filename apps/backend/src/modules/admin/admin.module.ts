import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { BackupService } from './backup.service';

@Module({
  providers: [AdminService, BackupService],
  controllers: [AdminController],
})
export class AdminModule {}
