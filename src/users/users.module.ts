import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { ResponseService } from 'src/common/response/response.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService,PrismaService, ResponseService],
})
export class UsersModule {}
  