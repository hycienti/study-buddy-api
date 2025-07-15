import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { EmailService } from 'src/common/email/email.service';
import { NotificationType, Prisma } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  message: string;
  data?: any; // Additional data like session ID, ticket ID, etc.
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Create a new notification
  async createNotification(createNotificationDto: CreateNotificationDto) {
    return this.prismaService.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        message: createNotificationDto.message,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  // Create multiple notifications for multiple users
  async createBulkNotifications(notifications: CreateNotificationDto[]) {
    return this.prismaService.notification.createMany({
      data: notifications.map(notif => ({
        userId: notif.userId,
        type: notif.type,
        message: notif.message,
      }))
    });
  }

  // Get notifications for a user with pagination
  async getUserNotifications(
    userId: string, 
    params?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    }
  ) {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type,
    } = params || {};

    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly && { read: false }),
      ...(type && { type }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prismaService.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.notification.count({ where }),
      this.prismaService.notification.count({
        where: { userId, read: false }
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prismaService.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    return this.prismaService.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  // Delete a notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prismaService.notification.delete({
      where: { id: notificationId }
    });
  }

  // Session-related notifications
  async notifySessionBooked(sessionData: {
    buddyId: string;
    learnerId: string;
    module: string;
    topic: string;
    date: Date;
    buddyName: string;
    learnerName: string;
  }) {
    const notifications = [
      {
        userId: sessionData.buddyId,
        type: NotificationType.SESSION_BOOKED,
        message: `New session booked! ${sessionData.learnerName} has booked a session with you for ${sessionData.module} - ${sessionData.topic} on ${sessionData.date.toLocaleDateString()}`,
      },
      {
        userId: sessionData.learnerId,
        type: NotificationType.SESSION_BOOKED,
        message: `Session confirmed! Your session with ${sessionData.buddyName} for ${sessionData.module} - ${sessionData.topic} is scheduled for ${sessionData.date.toLocaleDateString()}`,
      },
    ];

    await this.createBulkNotifications(notifications);
  }

  async notifySessionUpdated(sessionData: {
    buddyId: string;
    learnerId: string;
    status: string;
    module: string;
    topic: string;
    date: Date;
  }) {
    const notifications = [
      {
        userId: sessionData.buddyId,
        type: NotificationType.SESSION_UPDATED,
        message: `Session status updated to ${sessionData.status} for ${sessionData.module} - ${sessionData.topic}`,
      },
      {
        userId: sessionData.learnerId,
        type: NotificationType.SESSION_UPDATED,
        message: `Session status updated to ${sessionData.status} for ${sessionData.module} - ${sessionData.topic}`,
      },
    ];

    await this.createBulkNotifications(notifications);
  }

  // Ticket-related notifications
  async notifyTicketRaised(ticketData: {
    createdById: string;
    module: string;
    topic: string;
    creatorName: string;
  }) {
    // Notify potential study buddies who have skills matching the ticket module
    const potentialBuddies = await this.prismaService.user.findMany({
      where: {
        role: { in: ['BUDDY', 'BOTH'] },
        status: 'ACTIVE',
        skills: { has: ticketData.module },
        id: { not: ticketData.createdById }, // Don't notify the creator
      },
      select: { id: true }
    });

    if (potentialBuddies.length > 0) {
      const notifications = potentialBuddies.map(buddy => ({
        userId: buddy.id,
        type: NotificationType.TICKET_RAISED,
        message: `New help request: ${ticketData.creatorName} needs help with ${ticketData.module} - ${ticketData.topic}`,
      }));

      await this.createBulkNotifications(notifications);
    }
  }

  async notifyTicketClaimed(ticketData: {
    createdById: string;
    claimedById: string;
    module: string;
    topic: string;
    claimerName: string;
  }) {
    await this.createNotification({
      userId: ticketData.createdById,
      type: NotificationType.TICKET_CLAIMED,
      message: `Great news! ${ticketData.claimerName} has claimed your help request for ${ticketData.module} - ${ticketData.topic}`,
    });
  }

  async notifyTicketComment(commentData: {
    ticketId: string;
    createdById: string;
    claimedById?: string;
    commenterName: string;
    module: string;
    topic: string;
  }) {
    const notifyUserIds = [commentData.createdById];
    if (commentData.claimedById && commentData.claimedById !== commentData.createdById) {
      notifyUserIds.push(commentData.claimedById);
    }

    const notifications = notifyUserIds.map(userId => ({
      userId,
      type: NotificationType.TICKET_COMMENT,
      message: `${commentData.commenterName} commented on the ticket: ${commentData.module} - ${commentData.topic}`,
    }));

    await this.createBulkNotifications(notifications);
  }

  // Get unread count for a user
  async getUnreadCount(userId: string) {
    return this.prismaService.notification.count({
      where: { userId, read: false }
    });
  }
}
