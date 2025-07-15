import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { EmailService } from 'src/common/email/email.service';
import { GoogleCalendarService } from 'src/common/google-calendar/google-calendar.service';
import { NotificationService } from 'src/common/notification/notification.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionStatus, UserRole, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly notificationService: NotificationService,
  ) {}

  // Generate Google Meet link using the Google Calendar service
  private generateMeetingLink(): string {
    return this.googleCalendarService.generateMeetLink();
  }

  // Check if buddy is available at the requested time
  private async isBuddyAvailable(buddyId: string, sessionDate: Date): Promise<boolean> {
    const dayOfWeek = sessionDate.getDay();
    const timeString = sessionDate.toTimeString().substring(0, 5); // HH:MM format

    // Check availability
    const availability = await this.prismaService.availability.findFirst({
      where: {
        userId: buddyId,
        dayOfWeek,
        startTime: { lte: timeString },
        endTime: { gt: timeString },
      },
    });

    if (!availability) {
      return false;
    }

    // Check for conflicting sessions
    const sessionStart = new Date(sessionDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    const sessionEnd = new Date(sessionDate.getTime() + 90 * 60 * 1000); // 1.5 hours after

    const conflictingSessions = await this.prismaService.session.findFirst({
      where: {
        buddyId,
        date: {
          gte: sessionStart,
          lte: sessionEnd,
        },
        status: { in: [SessionStatus.PENDING, SessionStatus.CONFIRMED] },
      },
    });

    return !conflictingSessions;
  }

  // Create a new session
  async createSession(learnerId: string, createSessionDto: CreateSessionDto) {
    const sessionDate = new Date(createSessionDto.date);

    // Validate future date
    if (sessionDate <= new Date()) {
      throw new Error('Session date must be in the future');
    }

    // Check if buddy exists and is available
    const buddy = await this.prismaService.user.findUnique({
      where: { 
        id: createSessionDto.buddyId,
        role: { in: [UserRole.BUDDY, UserRole.BOTH] },
        status: UserStatus.ACTIVE,
      },
    });

    if (!buddy) {
      throw new Error('Study buddy not found or not available');
    }

    // Check availability
    const isAvailable = await this.isBuddyAvailable(createSessionDto.buddyId, sessionDate);
    if (!isAvailable) {
      throw new Error('Study buddy is not available at the requested time');
    }

    // Check if learner exists
    const learner = await this.prismaService.user.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    // Generate enhanced meeting link with participant emails
    let meetingLink = createSessionDto.meetingLink;
    let eventId = '';
    let calendarEventUrl = '';

    if (!meetingLink) {
      try {
        const meetDetails = await this.googleCalendarService.generateMeetLinkWithParticipants(
          buddy.email,
          learner.email,
          {
            module: createSessionDto.module,
            topic: createSessionDto.topic,
            date: sessionDate,
            buddyName: buddy.name,
            learnerName: learner.name,
          }
        );
        meetingLink = meetDetails.meetLink;
        eventId = meetDetails.eventId;
        calendarEventUrl = meetDetails.calendarEventUrl;
      } catch (error) {
        console.error('Error generating enhanced meet link:', error);
        meetingLink = this.generateMeetingLink();
      }
    }

    // Create session
    const session = await this.prismaService.session.create({
      data: {
        buddyId: createSessionDto.buddyId,
        learnerId,
        module: createSessionDto.module,
        topic: createSessionDto.topic,
        date: sessionDate,
        meetingLink,
        status: SessionStatus.PENDING,
      },
      include: {
        buddy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        learner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Send notification emails
    await this.sendSessionNotifications(session);

    // Send in-app notifications
    await this.notificationService.notifySessionBooked({
      buddyId: session.buddyId,
      learnerId: session.learnerId,
      module: session.module,
      topic: session.topic,
      date: session.date,
      buddyName: session.buddy.name,
      learnerName: session.learner.name,
    });

    return session;
  }

  // Get sessions for a user
  async getUserSessions(userId: string, role: 'buddy' | 'learner' | 'all' = 'all', page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    let where: Prisma.SessionWhereInput = {};
    
    if (role === 'buddy') {
      where.buddyId = userId;
    } else if (role === 'learner') {
      where.learnerId = userId;
    } else {
      where.OR = [{ buddyId: userId }, { learnerId: userId }];
    }

    const [sessions, total] = await Promise.all([
      this.prismaService.session.findMany({
        where,
        include: {
          buddy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          learner: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prismaService.session.count({ where }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Enhanced findAll with filtering, search, sort, and pagination
  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: SessionStatus;
    module?: string;
    buddyId?: string;
    learnerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'date' | 'createdAt' | 'module' | 'status';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      module,
      buddyId,
      learnerId,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params || {};

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SessionWhereInput = {};

    if (search) {
      where.OR = [
        { module: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { buddy: { name: { contains: search, mode: 'insensitive' } } },
        { learner: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (module) {
      where.module = { contains: module, mode: 'insensitive' };
    }

    if (buddyId) {
      where.buddyId = buddyId;
    }

    if (learnerId) {
      where.learnerId = learnerId;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Build order by
    const orderBy: Prisma.SessionOrderByWithRelationInput = {};
    if (sortBy === 'date') {
      orderBy.date = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'module') {
      orderBy.module = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    }

    const [sessions, total] = await Promise.all([
      this.prismaService.session.findMany({
        where,
        include: {
          buddy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          learner: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prismaService.session.count({ where }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        search,
        status,
        module,
        buddyId,
        learnerId,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
    };
  }

  // Get session by ID
  async getSessionById(id: string, userId: string) {
    const session = await this.prismaService.session.findFirst({
      where: {
        id,
        OR: [{ buddyId: userId }, { learnerId: userId }],
      },
      include: {
        buddy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        learner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found or unauthorized');
    }

    return session;
  }

  // Update session
  async updateSession(id: string, userId: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.prismaService.session.findFirst({
      where: {
        id,
        OR: [{ buddyId: userId }, { learnerId: userId }],
      },
      include: {
        buddy: {
          select: { id: true, name: true, email: true },
        },
        learner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found or unauthorized');
    }

    // Only allow certain updates based on user role and session status
    const updateData: any = {};

    if (updateSessionDto.status) {
      // Only buddy can confirm, both can cancel
      if (updateSessionDto.status === SessionStatus.CONFIRMED && session.buddyId !== userId) {
        throw new Error('Only the study buddy can confirm the session');
      }
      updateData.status = updateSessionDto.status;
    }

    if (updateSessionDto.feedback) {
      // Only allow feedback after session is completed
      if (session.status !== SessionStatus.COMPLETED) {
        throw new Error('Feedback can only be added to completed sessions');
      }
      updateData.feedback = updateSessionDto.feedback;
    }

    // Update other fields if provided and session is still pending
    if (session.status === SessionStatus.PENDING) {
      if (updateSessionDto.date) {
        const newDate = new Date(updateSessionDto.date);
        if (newDate <= new Date()) {
          throw new Error('Session date must be in the future');
        }
        updateData.date = newDate;
      }
      if (updateSessionDto.module) updateData.module = updateSessionDto.module;
      if (updateSessionDto.topic) updateData.topic = updateSessionDto.topic;
      if (updateSessionDto.meetingLink) updateData.meetingLink = updateSessionDto.meetingLink;
    }

    const updatedSession = await this.prismaService.session.update({
      where: { id },
      data: updateData,
      include: {
        buddy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        learner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Send notification for status changes
    if (updateSessionDto.status) {
      await this.sendSessionStatusNotification(updatedSession);
      // Send in-app notification
      await this.notificationService.notifySessionUpdated({
        buddyId: updatedSession.buddyId,
        learnerId: updatedSession.learnerId,
        status: updatedSession.status,
        module: updatedSession.module,
        topic: updatedSession.topic,
        date: updatedSession.date,
      });
    }

    return updatedSession;
  }

  // Cancel session
  async cancelSession(id: string, userId: string) {
    return this.updateSession(id, userId, { status: SessionStatus.CANCELLED });
  }

  // Auto-expire pending sessions
  async expirePendingSessions() {
    const expiredSessions = await this.prismaService.session.updateMany({
      where: {
        status: SessionStatus.PENDING,
        date: {
          lt: new Date(),
        },
      },
      data: {
        status: SessionStatus.CANCELLED,
      },
    });

    return expiredSessions;
  }

  // Auto-complete ongoing sessions
  async completeOngoingSessions() {
    const completedSessions = await this.prismaService.session.updateMany({
      where: {
        status: SessionStatus.CONFIRMED,
        date: {
          lt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      },
      data: {
        status: SessionStatus.COMPLETED,
      },
    });

    return completedSessions;
  }

  // Send session notifications
  private async sendSessionNotifications(session: any) {
    try {
      // Notify buddy
      await this.emailService.sendEmail(
        session.buddy.email,
        'New Session Request',
        `You have a new session request from ${session.learner.name} for ${session.module} - ${session.topic} on ${session.date.toLocaleDateString()}.`,
      );

      // Notify learner
      await this.emailService.sendEmail(
        session.learner.email,
        'Session Request Submitted',
        `Your session request with ${session.buddy.name} for ${session.module} - ${session.topic} has been submitted and is pending confirmation.`,
      );
    } catch (error) {
      console.error('Failed to send session notifications:', error);
    }
  }

  // Send session status notifications
  private async sendSessionStatusNotification(session: any) {
    try {
      let subject = '';
      let buddyMessage = '';
      let learnerMessage = '';

      switch (session.status) {
        case SessionStatus.CONFIRMED:
          subject = 'Session Confirmed';
          buddyMessage = `Your session with ${session.learner.name} has been confirmed for ${session.date.toLocaleDateString()}. Meeting link: ${session.meetingLink}`;
          learnerMessage = `Your session with ${session.buddy.name} has been confirmed for ${session.date.toLocaleDateString()}. Meeting link: ${session.meetingLink}`;
          break;
        case SessionStatus.CANCELLED:
          subject = 'Session Cancelled';
          buddyMessage = `The session with ${session.learner.name} scheduled for ${session.date.toLocaleDateString()} has been cancelled.`;
          learnerMessage = `The session with ${session.buddy.name} scheduled for ${session.date.toLocaleDateString()} has been cancelled.`;
          break;
        case SessionStatus.COMPLETED:
          subject = 'Session Completed';
          buddyMessage = `The session with ${session.learner.name} has been marked as completed.`;
          learnerMessage = `The session with ${session.buddy.name} has been marked as completed.`;
          break;
      }

      if (buddyMessage) {
        await this.emailService.sendEmail(session.buddy.email, subject, buddyMessage);
      }
      if (learnerMessage) {
        await this.emailService.sendEmail(session.learner.email, subject, learnerMessage);
      }
    } catch (error) {
      console.error('Failed to send session status notifications:', error);
    }
  }
}
