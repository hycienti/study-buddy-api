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
import { TravelsModule } from './travels/travels.module';
import { SenderRequestModule } from './sender-request/sender-request.module';
import { PaymentModule } from './payment/payment.module';
import { StatsModule } from './stats/stats.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, UsersModule, UserModule, TravelsModule, SenderRequestModule, PaymentModule, StatsModule],
  controllers: [AppController],
  // providers: [AppService, PrismaService, EmailService, ResponseService],
  providers: [AppService, PrismaService, ResponseService],
})
export class AppModule {}
