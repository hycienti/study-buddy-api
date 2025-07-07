import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseService } from 'src/common/response/response.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserVerificationDto } from './dto/user-verification.dto';


@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR', 'PARTNER', 'STAFF')

export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly responseService: ResponseService) { }

  @Get()
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const res = await this.usersService.findAll(page, limit);
    if (!res.users || res.users.length === 0) {
      return this.responseService.errorResponse({
        status: 404,
        response: 'No users found'
      });
    }
    return this.responseService.successResponse(res.users, res.pagination);
  }

  @Patch(':id/accept-reject-verification')
  async acceptRejectVerification(@Param('id') id: string, @Body() dto: UserVerificationDto) {
    const res = await this.usersService.verifyUser(id, dto);
    if (!res) {
      return this.responseService.errorResponse({
        status: 404,
        response: 'User not found'
      });
    }
    return this.responseService.successResponse(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.usersService.findOne(id);
    if (!res) {
      return this.responseService.errorResponse({
        status: 404,
        response: 'User not found'
      });
    }
    return this.responseService.successResponse(res);
  }
}
