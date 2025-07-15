import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { ResponseService } from 'src/common/response/response.service';
import { EmailService } from 'src/common/email/email.service';
import { GoogleCalendarService } from 'src/common/google-calendar/google-calendar.service';
import { NotificationService } from 'src/common/notification/notification.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, PrismaService, ResponseService, EmailService, GoogleCalendarService, NotificationService],
  exports: [SessionService],
})
export class SessionModule {}
