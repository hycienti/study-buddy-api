import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './common/prisma-service/prisma.service';
import { AuthModule } from './auth/auth.module';
// import { EmailService } from './common/email/email.service';
import { ResponseService } from './common/response/response.service';
import { UsersModule } from './users/users.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { StudyBuddyModule } from './study-buddy/study-buddy.module';
import { SessionModule } from './session/session.module';
import { TicketModule } from './ticket/ticket.module';
import { StatsModule } from './stats/stats.module';
import { NotificationModule } from './common/notification/notification.module';
import { GoogleCalendarModule } from './common/google-calendar/google-calendar.module';
import { TasksService } from './common/tasks/tasks.service';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule, 
    UsersModule, 
    UserModule, 
    StudyBuddyModule,
    SessionModule,
    TicketModule,
    StatsModule,
    NotificationModule,
    GoogleCalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, ResponseService, TasksService],
})
export class AppModule {}
