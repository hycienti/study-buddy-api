import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StudyBuddyService } from './study-buddy.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('study-buddy')
@Controller('study-buddy')
export class StudyBuddyController {
  constructor(
    private readonly studyBuddyService: StudyBuddyService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all study buddies with advanced filtering' })
  @ApiResponse({ status: 200, description: 'List of study buddies retrieved successfully.' })
  @ApiQuery({ name: 'module', required: false, description: 'Filter by module/skill' })
  @ApiQuery({ name: 'topic', required: false, description: 'Filter by topic' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'schoolName', required: false, description: 'Filter by school name' })
  @ApiQuery({ name: 'studyYear', required: false, description: 'Filter by study year' })
  @ApiQuery({ name: 'major', required: false, description: 'Filter by major' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async findAll(
    @Query('module') module?: string,
    @Query('topic') topic?: string,
    @Query('search') search?: string,
    @Query('schoolName') schoolName?: string,
    @Query('studyYear') studyYear?: string,
    @Query('major') major?: string,
    @Query('sortBy') sortBy?: any,
    @Query('sortOrder') sortOrder?: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const params = {
        module,
        topic,
        search,
        schoolName,
        studyYear,
        major,
        sortBy,
        sortOrder,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      };
      
      const result = await this.studyBuddyService.findAllStudyBuddies(params);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search study buddies by skills, name, or bio' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully.' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      if (!query) {
        return this.responseService.errorResponse({
          status: HttpStatus.BAD_REQUEST,
          response: 'Search query is required',
        });
      }

      const result = await this.studyBuddyService.searchStudyBuddies(
        query,
        Number(page) || 1,
        Number(limit) || 10,
      );
      return this.responseService.successResponse(result.buddies, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get study buddy by ID with availability and session history' })
  @ApiResponse({ status: 200, description: 'Study buddy retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Study buddy not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const buddy = await this.studyBuddyService.findStudyBuddyById(id);
      if (!buddy) {
        return this.responseService.errorResponse({
          status: HttpStatus.NOT_FOUND,
          response: 'Study buddy not found',
        });
      }
      return this.responseService.successResponse(buddy);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add availability for the current user' })
  @ApiResponse({ status: 201, description: 'Availability added successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input or overlapping availability.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async addAvailability(
    @Request() req,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    try {
      const userId = req.user.id;
      const availability = await this.studyBuddyService.addAvailability(
        userId,
        createAvailabilityDto,
      );
      return this.responseService.successResponse(availability);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Get('me/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user availability' })
  @ApiResponse({ status: 200, description: 'User availability retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyAvailability(@Request() req) {
    try {
      const userId = req.user.id;
      const availability = await this.studyBuddyService.getUserAvailability(userId);
      return this.responseService.successResponse(availability);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Patch('availability/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully.' })
  @ApiResponse({ status: 404, description: 'Availability not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateAvailability(
    @Param('id') id: string,
    @Request() req,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    try {
      const userId = req.user.id;
      const availability = await this.studyBuddyService.updateAvailability(
        id,
        userId,
        updateAvailabilityDto,
      );
      return this.responseService.successResponse(availability);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Delete('availability/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove availability' })
  @ApiResponse({ status: 200, description: 'Availability removed successfully.' })
  @ApiResponse({ status: 404, description: 'Availability not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async removeAvailability(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.id;
      await this.studyBuddyService.removeAvailability(id, userId);
      return this.responseService.successResponse({ message: 'Availability removed successfully' });
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }
}
