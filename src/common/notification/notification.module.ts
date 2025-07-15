import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../prisma-service/prisma.service';
import { EmailService } from '../email/email.service';
import { ResponseService } from '../response/response.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, EmailService, ResponseService],
  exports: [NotificationService],
})
export class NotificationModule {}
