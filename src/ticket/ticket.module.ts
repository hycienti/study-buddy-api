import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { ResponseService } from 'src/common/response/response.service';
import { EmailService } from 'src/common/email/email.service';
import { NotificationService } from 'src/common/notification/notification.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService, PrismaService, ResponseService, EmailService, NotificationService],
  exports: [TicketService],
})
export class TicketModule {}
