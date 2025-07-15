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
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/common/response/response.service';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Book a new session with a study buddy' })
  @ApiResponse({ status: 201, description: 'Session booked successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input or buddy not available.' })
  async create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    try {
      const learnerId = req.user.id;
      const session = await this.sessionService.createSession(learnerId, createSessionDto);
      return this.responseService.successResponse(session);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get sessions with advanced filtering' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, description: 'Session status' })
  @ApiQuery({ name: 'module', required: false, description: 'Module filter' })
  @ApiQuery({ name: 'buddyId', required: false, description: 'Filter by buddy ID' })
  @ApiQuery({ name: 'learnerId', required: false, description: 'Filter by learner ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: any,
    @Query('module') module?: string,
    @Query('buddyId') buddyId?: string,
    @Query('learnerId') learnerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: any,
    @Query('sortOrder') sortOrder?: any,
  ) {
    try {
      const params = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        status,
        module,
        buddyId,
        learnerId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        sortBy,
        sortOrder,
      };
      
      const result = await this.sessionService.findAll(params);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Get('my-sessions')
  @ApiOperation({ summary: 'Get current user sessions' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved successfully.' })
  @ApiQuery({ name: 'role', required: false, enum: ['buddy', 'learner', 'all'], description: 'Filter by user role in session' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async getMysessions(
    @Request() req,
    @Query('role') role?: 'buddy' | 'learner' | 'all',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user.id;
      const result = await this.sessionService.getUserSessions(
        userId,
        role || 'all',
        Number(page) || 1,
        Number(limit) || 10,
      );
      return this.responseService.successResponse(result.sessions, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.id;
      const session = await this.sessionService.getSessionById(id, userId);
      return this.responseService.successResponse(session);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session (confirm, cancel, add feedback, etc.)' })
  @ApiResponse({ status: 200, description: 'Session updated successfully.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  @ApiResponse({ status: 400, description: 'Invalid update or unauthorized.' })
  async update(@Param('id') id: string, @Request() req, @Body() updateSessionDto: UpdateSessionDto) {
    try {
      const userId = req.user.id;
      const session = await this.sessionService.updateSession(id, userId, updateSessionDto);
      return this.responseService.successResponse(session);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel session' })
  @ApiResponse({ status: 200, description: 'Session cancelled successfully.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.id;
      const session = await this.sessionService.cancelSession(id, userId);
      return this.responseService.successResponse(session);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Post('expire-pending')
  @ApiOperation({ summary: 'Expire pending sessions (admin/system operation)' })
  @ApiResponse({ status: 200, description: 'Pending sessions expired successfully.' })
  async expirePending() {
    try {
      const result = await this.sessionService.expirePendingSessions();
      return this.responseService.successResponse({
        message: `${result.count} pending sessions expired`,
        count: result.count,
      });
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Post('complete-ongoing')
  @ApiOperation({ summary: 'Complete ongoing sessions (admin/system operation)' })
  @ApiResponse({ status: 200, description: 'Ongoing sessions completed successfully.' })
  async completeOngoing() {
    try {
      const result = await this.sessionService.completeOngoingSessions();
      return this.responseService.successResponse({
        message: `${result.count} ongoing sessions completed`,
        count: result.count,
      });
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }
}
