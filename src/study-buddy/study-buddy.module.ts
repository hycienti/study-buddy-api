import { Module } from '@nestjs/common';
import { StudyBuddyService } from './study-buddy.service';
import { StudyBuddyController } from './study-buddy.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { ResponseService } from 'src/common/response/response.service';

@Module({
  controllers: [StudyBuddyController],
  providers: [StudyBuddyService, PrismaService, ResponseService],
  exports: [StudyBuddyService],
})
export class StudyBuddyModule {}
