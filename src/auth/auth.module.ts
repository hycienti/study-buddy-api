import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { EmailService } from 'src/common/email/email.service';
import { ResponseService } from 'src/common/response/response.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' } 
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, EmailService, ResponseService, JwtStrategy],
  exports: [ PrismaService, EmailService, ResponseService, PassportModule]
})
export class AuthModule {}
