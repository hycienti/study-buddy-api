import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { EmailService } from 'src/common/email/email.service';
import { NotificationService } from 'src/common/notification/notification.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { TicketStatus, UserRole, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  // Create a new ticket
  async createTicket(createdById: string, createTicketDto: CreateTicketDto) {
    const ticket = await this.prismaService.ticket.create({
      data: {
        createdById,
        module: createTicketDto.module,
        topic: createTicketDto.topic,
        description: createTicketDto.description,
        preferredTimes: createTicketDto.preferredTimes || [],
        attachments: createTicketDto.attachments || [],
        status: TicketStatus.OPEN,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Send notification to potential study buddies
    await this.notifyPotentialBuddies(ticket);

    // Send in-app notifications
    await this.notificationService.notifyTicketRaised({
      createdById: ticket.createdById,
      module: ticket.module,
      topic: ticket.topic,
      creatorName: ticket.createdBy.name,
    });

    return ticket;
  }

  // Enhanced get tickets with filtering, search, sort, and pagination
  async getTickets(
    filters: {
      status?: TicketStatus;
      module?: string;
      createdById?: string;
      claimedById?: string;
      search?: string;
      sortBy?: 'createdAt' | 'updatedAt' | 'module' | 'status';
      sortOrder?: 'asc' | 'desc';
    } = {},
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const {
      status,
      module,
      createdById,
      claimedById,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;
    
    const where: Prisma.TicketWhereInput = {};
    
    if (status) where.status = status;
    if (module) where.module = { contains: module, mode: 'insensitive' };
    if (createdById) where.createdById = createdById;
    if (claimedById) where.claimedById = claimedById;

    // Add search functionality
    if (search) {
      where.OR = [
        { module: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { createdBy: { name: { contains: search, mode: 'insensitive' } } },
        { claimedBy: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build order by
    const orderBy: Prisma.TicketOrderByWithRelationInput = {};
    if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    } else if (sortBy === 'module') {
      orderBy.module = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    }

    const [tickets, total] = await Promise.all([
      this.prismaService.ticket.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          claimedBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { comments: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prismaService.ticket.count({ where }),
    ]);

    return {
      tickets: tickets.map(ticket => ({
        ...ticket,
        commentCount: (ticket as any)._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        status,
        module,
        createdById,
        claimedById,
        search,
        sortBy,
        sortOrder,
      },
    };
  }

  // Get ticket by ID
  async getTicketById(id: string) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        claimedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  // Update ticket
  async updateTicket(id: string, userId: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        claimedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check permissions
    const canUpdate = 
      ticket.createdById === userId || 
      ticket.claimedById === userId ||
      await this.isUserAdmin(userId);

    if (!canUpdate) {
      throw new Error('Unauthorized to update this ticket');
    }

    const updatedTicket = await this.prismaService.ticket.update({
      where: { id },
      data: updateTicketDto,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        claimedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Send notification for status changes
    if (updateTicketDto.status) {
      await this.sendTicketStatusNotification(updatedTicket);
    }

    return updatedTicket;
  }

  // Claim a ticket
  async claimTicket(id: string, claimedById: string) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== TicketStatus.OPEN) {
      throw new Error('Ticket is not available for claiming');
    }

    if (ticket.createdById === claimedById) {
      throw new Error('Cannot claim your own ticket');
    }

    // Check if user can be a buddy
    const user = await this.prismaService.user.findUnique({
      where: { id: claimedById },
    });

    if (!user || (user.role !== UserRole.BUDDY && user.role !== UserRole.BOTH)) {
      throw new Error('User is not authorized to claim tickets');
    }

    const updatedTicket = await this.prismaService.ticket.update({
      where: { id },
      data: {
        claimedById,
        status: TicketStatus.CLAIMED,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        claimedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Send notification to ticket creator
    await this.sendTicketClaimedNotification(updatedTicket);

    // Send in-app notification
    await this.notificationService.notifyTicketClaimed({
      createdById: updatedTicket.createdById,
      claimedById: updatedTicket.claimedById!,
      module: updatedTicket.module,
      topic: updatedTicket.topic,
      claimerName: updatedTicket.claimedBy!.name,
    });

    return updatedTicket;
  }

  // Add comment to ticket
  async addComment(ticketId: string, userId: string, createCommentDto: CreateTicketCommentDto) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        claimedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const comment = await this.prismaService.ticketComment.create({
      data: {
        ticketId,
        userId,
        message: createCommentDto.message,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        ticket: {
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
            claimedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Send notification to relevant users
    await this.sendCommentNotification(comment);

    // Send in-app notification
    await this.notificationService.notifyTicketComment({
      ticketId: comment.ticketId,
      createdById: comment.ticket.createdById,
      claimedById: comment.ticket.claimedById || undefined,
      commenterName: comment.user.name,
      module: comment.ticket.module,
      topic: comment.ticket.topic,
    });

    return comment;
  }

  // Get comments for a ticket
  async getTicketComments(ticketId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prismaService.ticketComment.findMany({
        where: { ticketId },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.ticketComment.count({
        where: { ticketId },
      }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Delete ticket (only creator or admin)
  async deleteTicket(id: string, userId: string) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const canDelete = 
      ticket.createdById === userId || 
      await this.isUserAdmin(userId);

    if (!canDelete) {
      throw new Error('Unauthorized to delete this ticket');
    }

    await this.prismaService.ticket.delete({
      where: { id },
    });

    return { message: 'Ticket deleted successfully' };
  }

  // Search tickets
  async searchTickets(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.TicketWhereInput = {
      OR: [
        { module: { contains: query, mode: 'insensitive' } },
        { topic: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [tickets, total] = await Promise.all([
      this.prismaService.ticket.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          claimedBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.ticket.count({ where }),
    ]);

    return {
      tickets: tickets.map(ticket => ({
        ...ticket,
        commentCount: (ticket as any)._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Helper methods
  private async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    // Note: Adjust this based on your UserRole enum values
    return false; // TODO: Add admin role to UserRole enum or use existing role system
  }

  private async notifyPotentialBuddies(ticket: any) {
    try {
      // Find study buddies with relevant skills
      const potentialBuddies = await this.prismaService.user.findMany({
        where: {
          role: { in: [UserRole.BUDDY, UserRole.BOTH] },
          status: UserStatus.ACTIVE,
          skills: { has: ticket.module },
          id: { not: ticket.createdById },
        },
        select: { email: true, name: true },
        take: 10, // Limit to prevent spam
      });

      // Send notifications
      for (const buddy of potentialBuddies) {
        await this.emailService.sendEmail(
          buddy.email,
          'New Help Request Available',
          `A new help request for ${ticket.module} - ${ticket.topic} is available. Check it out on the platform!`,
        );
      }
    } catch (error) {
      console.error('Failed to notify potential buddies:', error);
    }
  }

  private async sendTicketClaimedNotification(ticket: any) {
    try {
      await this.emailService.sendEmail(
        ticket.createdBy.email,
        'Your Help Request Has Been Claimed',
        `${ticket.claimedBy.name} has claimed your help request for ${ticket.module} - ${ticket.topic}. They will reach out to you soon!`,
      );
    } catch (error) {
      console.error('Failed to send ticket claimed notification:', error);
    }
  }

  private async sendTicketStatusNotification(ticket: any) {
    try {
      let subject = '';
      let message = '';

      switch (ticket.status) {
        case TicketStatus.RESOLVED:
          subject = 'Help Request Resolved';
          message = `Your help request for ${ticket.module} - ${ticket.topic} has been marked as resolved.`;
          break;
        case TicketStatus.CLOSED:
          subject = 'Help Request Closed';
          message = `Your help request for ${ticket.module} - ${ticket.topic} has been closed.`;
          break;
      }

      if (subject && message) {
        await this.emailService.sendEmail(ticket.createdBy.email, subject, message);
      }
    } catch (error) {
      console.error('Failed to send ticket status notification:', error);
    }
  }

  private async sendCommentNotification(comment: any) {
    try {
      const ticket = comment.ticket;
      const commenter = comment.user;
      
      // Notify ticket creator (if they didn't comment)
      if (ticket.createdBy.id !== commenter.id) {
        await this.emailService.sendEmail(
          ticket.createdBy.email,
          'New Comment on Your Help Request',
          `${commenter.name} commented on your help request for ${ticket.module} - ${ticket.topic}.`,
        );
      }

      // Notify claimer (if they didn't comment and ticket is claimed)
      if (ticket.claimedBy && ticket.claimedBy.id !== commenter.id) {
        await this.emailService.sendEmail(
          ticket.claimedBy.email,
          'New Comment on Claimed Help Request',
          `${commenter.name} commented on the help request for ${ticket.module} - ${ticket.topic} that you claimed.`,
        );
      }
    } catch (error) {
      console.error('Failed to send comment notification:', error);
    }
  }
}
