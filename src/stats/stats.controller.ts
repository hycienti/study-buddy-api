import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get stats for current user' })
  @ApiResponse({ status: 200, description: 'Return user statistics.' })
  @ApiBearerAuth()
  getCurrentUserStats(@Request() req) {
    return this.statsService.getUserStats(req.user.id);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get stats for a specific user' })
  @ApiResponse({ status: 200, description: 'Return user statistics.' })
  @ApiBearerAuth()
  getUserStats(@Param('id') id: string) {
    return this.statsService.getUserStats(id);
  }

  @Get('global')
  @ApiOperation({ summary: 'Get global platform statistics' })
  @ApiResponse({ status: 200, description: 'Return global statistics.' })
  @ApiBearerAuth()
  getGlobalStats() {
    return this.statsService.getGlobalStats();
  }
}
