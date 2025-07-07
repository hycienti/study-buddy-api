import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { ResponseService } from 'src/common/response/response.service';
import { S3Service } from 'src/common/s3/s3.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, ResponseService, S3Service],
})
export class UserModule {}
