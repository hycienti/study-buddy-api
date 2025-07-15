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
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/common/response/response.service';
import { TicketStatus } from '@prisma/client';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new help request ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    try {
      const createdById = req.user.id;
      const ticket = await this.ticketService.createTicket(createdById, createTicketDto);
      return this.responseService.successResponse(ticket);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get tickets with advanced filtering and search' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully.' })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'module', required: false, description: 'Filter by module' })
  @ApiQuery({ name: 'createdBy', required: false, description: 'Filter by creator ID' })
  @ApiQuery({ name: 'claimedBy', required: false, description: 'Filter by claimer ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async findAll(
    @Query('status') status?: TicketStatus,
    @Query('module') module?: string,
    @Query('createdBy') createdBy?: string,
    @Query('claimedBy') claimedBy?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: any,
    @Query('sortOrder') sortOrder?: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const filters = { 
        status, 
        module, 
        createdById: createdBy, 
        claimedById: claimedBy,
        search,
        sortBy,
        sortOrder,
      };
      const result = await this.ticketService.getTickets(
        filters,
        Number(page) || 1,
        Number(limit) || 10,
      );
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tickets by module, topic, or description' })
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

      const result = await this.ticketService.searchTickets(
        query,
        Number(page) || 1,
        Number(limit) || 10,
      );
      return this.responseService.successResponse(result.tickets, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get('my/created')
  @ApiOperation({ summary: 'Get tickets created by the current user' })
  @ApiResponse({ status: 200, description: 'User created tickets retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async getMyCreatedTickets(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user.id;
      const result = await this.ticketService.getTickets(
        { createdById: userId },
        Number(page) || 1,
        Number(limit) || 10,
      );
      return this.responseService.successResponse(result.tickets, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get('my/claimed')
  @ApiOperation({ summary: 'Get tickets claimed by the current user' })
  @ApiResponse({ status: 200, description: 'User claimed tickets retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async getMyClaimedTickets(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user.id;
      const result = await this.ticketService.getTickets(
        { claimedById: userId },
        Number(page) || 1,
        Number(limit) || 10,
      );
      return this.responseService.successResponse(result.tickets, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const ticket = await this.ticketService.getTicketById(id);
      return this.responseService.successResponse(ticket);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket (only creator, claimer, or admin)' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  @ApiResponse({ status: 403, description: 'Unauthorized to update this ticket.' })
  async update(@Param('id') id: string, @Request() req, @Body() updateTicketDto: UpdateTicketDto) {
    try {
      const userId = req.user.id;
      const ticket = await this.ticketService.updateTicket(id, userId, updateTicketDto);
      return this.responseService.successResponse(ticket);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') 
          ? HttpStatus.NOT_FOUND 
          : error.message.includes('Unauthorized')
          ? HttpStatus.FORBIDDEN
          : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Claim a ticket (study buddies only)' })
  @ApiResponse({ status: 200, description: 'Ticket claimed successfully.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  @ApiResponse({ status: 400, description: 'Cannot claim ticket (already claimed, own ticket, etc.).' })
  async claim(@Param('id') id: string, @Request() req) {
    try {
      const claimedById = req.user.id;
      const ticket = await this.ticketService.claimTicket(id, claimedById);
      return this.responseService.successResponse(ticket);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a ticket' })
  @ApiResponse({ status: 201, description: 'Comment added successfully.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  async addComment(
    @Param('id') id: string,
    @Request() req,
    @Body() createCommentDto: CreateTicketCommentDto,
  ) {
    try {
      const userId = req.user.id;
      const comment = await this.ticketService.addComment(id, userId, createCommentDto);
      return this.responseService.successResponse(comment);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a ticket' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.ticketService.getTicketComments(
        id,
        Number(page) || 1,
        Number(limit) || 20,
      );
      return this.responseService.successResponse(result.comments, result.pagination);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket (only creator or admin)' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Ticket not found.' })
  @ApiResponse({ status: 403, description: 'Unauthorized to delete this ticket.' })
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.ticketService.deleteTicket(id, userId);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({
        status: error.message.includes('not found') 
          ? HttpStatus.NOT_FOUND 
          : error.message.includes('Unauthorized')
          ? HttpStatus.FORBIDDEN
          : HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }
}
