import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AddSkillsDto, RemoveSkillsDto, UpdateSkillsDto } from './dto/skills.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/common/response/response.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService, 
    private readonly responseService: ResponseService
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const user = await this.userService.findOne(userId);

    if (!user) {
      return this.responseService.errorResponse({
        status: HttpStatus.NOT_FOUND,
        response: 'User not found'
      });
    }
    return this.responseService.successResponse(user);
  }

  @Get('upcoming-sessions')
  @ApiOperation({ summary: 'Get upcoming sessions for current user' })
  @ApiResponse({ status: 200, description: 'Return upcoming sessions.' })
  @ApiBearerAuth()
  async getUpcomingSessions(@Request() req) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const sessions = await this.userService.getUserUpcomingSessions(userId);
    return this.responseService.successResponse(sessions);
  }

  @Get('recent-tickets')
  @ApiOperation({ summary: 'Get recent tickets for current user' })
  @ApiResponse({ status: 200, description: 'Return recent tickets.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiBearerAuth()
  async getRecentTickets(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const tickets = await this.userService.getUserRecentTickets(userId, page, limit);
    return this.responseService.successResponse(tickets);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get current user skills' })
  @ApiResponse({ status: 200, description: 'Return user skills.' })
  @ApiBearerAuth()
  async getMySkills(@Request() req) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    
    try {
      const userSkills = await this.userService.getUserSkills(userId);
      return this.responseService.successResponse(userSkills);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.NOT_FOUND,
        response: error.message
      });
    }
  }

  @Post('skills')
  @ApiOperation({ summary: 'Add skills to current user profile' })
  @ApiResponse({ status: 200, description: 'Skills added successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: AddSkillsDto })
  @ApiBearerAuth()
  async addSkills(@Request() req, @Body() addSkillsDto: AddSkillsDto) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    
    try {
      const updatedUser = await this.userService.addSkills(userId, addSkillsDto.skills, req.user.id);
      return this.responseService.successResponse(updatedUser);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message
      });
    }
  }

  @Patch('skills')
  @ApiOperation({ summary: 'Update all skills for current user' })
  @ApiResponse({ status: 200, description: 'Skills updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: UpdateSkillsDto })
  @ApiBearerAuth()
  async updateSkills(@Request() req, @Body() updateSkillsDto: UpdateSkillsDto) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    
    try {
      const updatedUser = await this.userService.updateSkills(userId, updateSkillsDto.skills);
      return this.responseService.successResponse(updatedUser);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message
      });
    }
  }

  @Delete('skills')
  @ApiOperation({ summary: 'Remove specific skills from current user profile' })
  @ApiResponse({ status: 200, description: 'Skills removed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: RemoveSkillsDto })
  @ApiBearerAuth()
  async removeSkills(@Request() req, @Body() removeSkillsDto: RemoveSkillsDto) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    
    try {
      const updatedUser = await this.userService.removeSkills(userId, removeSkillsDto.skills);
      return this.responseService.successResponse(updatedUser);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get(':id/upcoming-sessions')
  @ApiOperation({ summary: 'Get upcoming sessions for a specific user' })
  @ApiResponse({ status: 200, description: 'Return upcoming sessions.' })
  @ApiBearerAuth()
  getUpcomingSessionsForUser(@Param('id') id: string) {
    return this.userService.getUserUpcomingSessions(id);
  }

  @Get(':id/recent-tickets')
  @ApiOperation({ summary: 'Get recent tickets for a specific user' })
  @ApiResponse({ status: 200, description: 'Return recent tickets.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiBearerAuth()
  getRecentTicketsForUser(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.getUserRecentTickets(id, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.userService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req) {
    return this.userService.remove(id, req.user.id);
  }
}
