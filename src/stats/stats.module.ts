import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PrismaService } from 'src/common/prisma-service/prisma.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService, PrismaService],
  exports: [StatsService],
})
export class StatsModule {}
