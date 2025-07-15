import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/common/response/response.service';
import { NotificationType } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'unreadOnly', required: false, description: 'Show only unread notifications' })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType, description: 'Filter by notification type' })
  async getNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('type') type?: NotificationType,
  ) {
    try {
      const userId = req.user.id;
      const params = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        unreadOnly: unreadOnly === 'true',
        type,
      };

      const result = await this.notificationService.getUserNotifications(userId, params);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully.' })
  async getUnreadCount(@Request() req) {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      return this.responseService.successResponse({ unreadCount: count });
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.id;
      const notification = await this.notificationService.markAsRead(id, userId);
      return this.responseService.successResponse(notification);
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  async markAllAsRead(@Request() req) {
    try {
      const userId = req.user.id;
      await this.notificationService.markAllAsRead(userId);
      return this.responseService.successResponse({ message: 'All notifications marked as read' });
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        response: error.message,
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully.' })
  async deleteNotification(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.id;
      await this.notificationService.deleteNotification(id, userId);
      return this.responseService.successResponse({ message: 'Notification deleted successfully' });
    } catch (error) {
      return this.responseService.errorResponse({
        status: HttpStatus.BAD_REQUEST,
        response: error.message,
      });
    }
  }
}
