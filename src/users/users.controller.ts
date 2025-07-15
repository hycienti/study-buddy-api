import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ResponseService } from 'src/common/response/response.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserVerificationDto } from './dto/user-verification.dto';
import { UserStatus } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR', 'PARTNER', 'STAFF')
export class UsersController {
  constructor(
    private readonly usersService: UsersService, 
    private readonly responseService: ResponseService
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering, search, and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, bio, major, or school' })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus, description: 'Filter by user status' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const result = await this.usersService.findAll(
        Number(page) || 1,
        Number(limit) || 10,
        search,
        status,
        role,
        sortBy || 'createdAt',
        sortOrder || 'desc'
      );
      
      if (!result.users || result.users.length === 0) {
        return this.responseService.errorResponse({
          status: 404,
          response: 'No users found'
        });
      }
      
      return this.responseService.successResponse(result.users, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: 500,
        response: error.message
      });
    }
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify or reject a user' })
  @ApiResponse({ status: 200, description: 'User verification status updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async verifyUser(@Param('id') id: string, @Body() dto: UserVerificationDto) {
    try {
      const result = await this.usersService.verifyUser(id, dto);
      if (!result) {
        return this.responseService.errorResponse({
          status: 404,
          response: 'User not found'
        });
      }
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({
        status: 500,
        response: error.message
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const result = await this.usersService.findOne(id);
      if (!result) {
        return this.responseService.errorResponse({
          status: 404,
          response: 'User not found'
        });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = result;
      return this.responseService.successResponse(userWithoutPassword);
    } catch (error) {
      return this.responseService.errorResponse({
        status: 500,
        response: error.message
      });
    }
  }
}
