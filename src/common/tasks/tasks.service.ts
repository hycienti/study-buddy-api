import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly sessionService: SessionService) {}

  // Run every 15 minutes to expire pending sessions
  @Cron('0 */15 * * * *') // Every 15 minutes
  async handleExpirePendingSessions() {
    this.logger.log('Running pending sessions expiration task...');
    try {
      const result = await this.sessionService.expirePendingSessions();
      this.logger.log(`Expired ${result.count} pending sessions`);
    } catch (error) {
      this.logger.error('Error expiring pending sessions:', error);
    }
  }

  // Run every 30 minutes to complete ongoing sessions
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCompleteOngoingSessions() {
    this.logger.log('Running ongoing sessions completion task...');
    try {
      const result = await this.sessionService.completeOngoingSessions();
      this.logger.log(`Completed ${result.count} ongoing sessions`);
    } catch (error) {
      this.logger.error('Error completing ongoing sessions:', error);
    }
  }

  // Run daily at midnight to clean up old data (optional)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    this.logger.log('Running daily cleanup task...');
    try {
      // Add any daily cleanup tasks here
      // For example: delete old notifications, archive old tickets, etc.
      this.logger.log('Daily cleanup completed');
    } catch (error) {
      this.logger.error('Error during daily cleanup:', error);
    }
  }
}
