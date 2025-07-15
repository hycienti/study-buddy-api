import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';

export interface UserStats {
  totalSessions: number;
  totalHours: number;
  sessionsAsBuddy: number;
  sessionsAsLearner: number;
  peopleHelped: number; // unique learners as buddy
  helpedBy: number; // unique buddies as learner
  completedSessions: number;
  pendingSessions: number;
  totalTickets: number;
  ticketsCreated: number;
  ticketsClaimed: number;
  ticketsResolved: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserStats(userId: string): Promise<UserStats> {
    // Get session statistics
    const [
      sessionsAsBuddy,
      sessionsAsLearner,
      ticketsCreated,
      ticketsClaimed,
      uniqueLearners,
      uniqueBuddies,
    ] = await Promise.all([
      // Sessions as buddy
      this.prismaService.session.findMany({
        where: { buddyId: userId },
        select: {
          status: true,
          date: true,
          learner: { select: { id: true } }
        }
      }),
      
      // Sessions as learner
      this.prismaService.session.findMany({
        where: { learnerId: userId },
        select: {
          status: true,
          date: true,
          buddy: { select: { id: true } }
        }
      }),
      
      // Tickets created
      this.prismaService.ticket.findMany({
        where: { createdById: userId },
        select: { status: true }
      }),
      
      // Tickets claimed
      this.prismaService.ticket.findMany({
        where: { claimedById: userId },
        select: { status: true }
      }),
      
      // Unique learners helped (as buddy)
      this.prismaService.session.findMany({
        where: { 
          buddyId: userId,
          status: 'COMPLETED'
        },
        select: {
          learner: { select: { id: true } }
        },
        distinct: ['learnerId']
      }),
      
      // Unique buddies who helped (as learner)
      this.prismaService.session.findMany({
        where: { 
          learnerId: userId,
          status: 'COMPLETED'
        },
        select: {
          buddy: { select: { id: true } }
        },
        distinct: ['buddyId']
      }),
    ]);

    // Calculate totals
    const totalSessions = sessionsAsBuddy.length + sessionsAsLearner.length;
    const completedSessions = [
      ...sessionsAsBuddy,
      ...sessionsAsLearner
    ].filter(s => s.status === 'COMPLETED');

    // Estimate total hours (assume 1 hour per session as default)
    const totalHours = completedSessions.length * 1;

    const pendingSessions = [
      ...sessionsAsBuddy,
      ...sessionsAsLearner
    ].filter(s => ['PENDING', 'CONFIRMED'].includes(s.status)).length;

    const ticketsResolved = [
      ...ticketsCreated,
      ...ticketsClaimed
    ].filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

    return {
      totalSessions,
      totalHours,
      sessionsAsBuddy: sessionsAsBuddy.length,
      sessionsAsLearner: sessionsAsLearner.length,
      peopleHelped: uniqueLearners.length,
      helpedBy: uniqueBuddies.length,
      completedSessions: completedSessions.length,
      pendingSessions,
      totalTickets: ticketsCreated.length + ticketsClaimed.length,
      ticketsCreated: ticketsCreated.length,
      ticketsClaimed: ticketsClaimed.length,
      ticketsResolved,
    };
  }

  async getGlobalStats() {
    const [
      totalUsers,
      totalSessions,
      totalTickets,
      activeUsers,
      completedSessions,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.session.count(),
      this.prismaService.ticket.count(),
      this.prismaService.user.count({
        where: {
          OR: [
            { 
              sessionsAsBuddy: { 
                some: { 
                  date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
                } 
              } 
            },
            { 
              sessionsAsLearner: { 
                some: { 
                  date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
                } 
              } 
            },
            {
              ticketsCreated: {
                some: {
                  createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
              }
            },
            {
              ticketsClaimed: {
                some: {
                  updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
              }
            }
          ]
        }
      }),
      this.prismaService.session.count({
        where: { status: 'COMPLETED' }
      }),
    ]);

    return {
      totalUsers,
      totalSessions,
      totalTickets,
      activeUsers,
      completedSessions,
      activeSessionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    };
  }
}
