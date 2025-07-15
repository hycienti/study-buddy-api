import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { ResponseService } from 'src/common/response/response.service';
import { EmailService } from 'src/common/email/email.service';
import { GoogleCalendarModule } from 'src/common/google-calendar/google-calendar.module';
import { NotificationService } from 'src/common/notification/notification.service';

@Module({
  imports: [GoogleCalendarModule],
  controllers: [SessionController],
  providers: [SessionService, PrismaService, ResponseService, EmailService, NotificationService],
  exports: [SessionService],
})
export class SessionModule {}
