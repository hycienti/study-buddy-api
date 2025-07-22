import { Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserStatus } from '@prisma/client';

@Injectable()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserService {
  constructor(private readonly prismaService: PrismaService) { }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    // Check if the user trying to update is the same user
    if (id !== userId) {
      throw new Error('Unauthorized to update this user');
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string, userId: string) {
    // Check if the user trying to delete is the same user
    if (id !== userId) {
      throw new Error('Unauthorized to delete this user');
    }

    return this.prismaService.user.delete({
      where: { id }
    });
  }

  async changeAccountStatus(userId: string, status: UserStatus, currentUserID: string) {
    const user = await this.prismaService.user.findUnique({ 
      where: { id: userId },
      select: { id: true, status: true } // Only select what we need
    });
    if (!user) throw new Error('User not found');
    
    if (user.status === status) {
      throw new Error(`User is already ${status}`);
    }
    
    // Only allow self to change status
    if (currentUserID !== userId) {
      throw new Error('Unauthorized to change account status');
    }
    
    return this.prismaService.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  // Get recent tickets for user
  async getUserRecentTickets(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [createdTickets, claimedTickets] = await Promise.all([
      this.prismaService.ticket.findMany({
        where: { createdById: userId },
        include: {
          claimedBy: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.ticket.findMany({
        where: { claimedById: userId },
        include: {
          createdBy: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      createdTickets,
      claimedTickets,
      totalCreated: createdTickets.length,
      totalClaimed: claimedTickets.length,
    };
  }

  // Get upcoming sessions for user
  async getUserUpcomingSessions(userId: string) {
    const now = new Date();
    
    const [asBuddy, asLearner] = await Promise.all([
      this.prismaService.session.findMany({
        where: {
          buddyId: userId,
          date: { gte: now },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          learner: { select: { id: true, name: true, avatarUrl: true } }
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      this.prismaService.session.findMany({
        where: {
          learnerId: userId,
          date: { gte: now },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          buddy: { select: { id: true, name: true, avatarUrl: true } }
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
    ]);

    return {
      asBuddy,
      asLearner,
      total: asBuddy.length + asLearner.length,
    };
  }

  // Skills management methods
  async addSkills(userId: string, skills: string[], currentUserId: string) {
    if (currentUserId !== userId) {
      throw new Error('Unauthorized to add skills');
    }
    
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });
    if (!user) throw new Error('User not found');
    
    return this.prismaService.user.update({
      where: { id: userId },
      data: { skills: [...user.skills, ...skills] },
    });
  }

  async removeSkills(userId: string, skillsToRemove: string[]) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { skills: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedSkills = (user.skills || []).filter(
      skill => !skillsToRemove.includes(skill)
    );

    return this.prismaService.user.update({
      where: { id: userId },
      data: { skills: updatedSkills },
    });
  }

  async updateSkills(userId: string, skills: string[]) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true } // Only select what we need
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove duplicates
    const uniqueSkills = [...new Set(skills)];

    return this.prismaService.user.update({
      where: { id: userId },
      data: { skills: uniqueSkills },
    });
  }

  async getUserSkills(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true,
        skills: true 
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
