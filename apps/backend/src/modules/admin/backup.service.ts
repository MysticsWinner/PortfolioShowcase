import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private configService: ConfigService) {}

  @Cron(CronExpression.EVERY_WEEK)
  handleWeeklyBackup() {
    this.logger.log('Initiating automated PostgreSQL backup sequence...');

    const dbUrl = this.configService.get<string>('DATABASE_URL');
    if (!dbUrl) {
      this.logger.error('DATABASE_URL is undefined; aborting backup payload.');
      return;
    }

    // Isolate pure db credentials. In production, parsing the URI cleanly is preferred.
    const backupCommand = `pg_dump "${dbUrl}" > ./backup_dump_${Date.now()}.sql`;

    exec(backupCommand, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`CRITICAL: Database Backup failed. Ensure pg_dump is available in the Node PATH. Error: ${error.message}`);
        // Fallback or send admin error email if pg_dump is absent
        return;
      }
      this.logger.log(`Database backup artifact successfully finalized to disk space.`);
    });
  }
}
