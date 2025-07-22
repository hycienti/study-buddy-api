import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UserRole, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class StudyBuddyService {
  constructor(private readonly prismaService: PrismaService) {}

  // Enhanced get all study buddies with filtering, search, sort, and pagination
  async findAllStudyBuddies(params?: {
    module?: string;
    topic?: string;
    search?: string;
    schoolName?: string;
    studyYear?: string;
    major?: string;
    sortBy?: 'name' | 'createdAt' | 'completedSessions' | 'schoolName';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      module,
      topic,
      search,
      schoolName,
      studyYear,
      major,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = params || {};

    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = {
      role: { in: [UserRole.BUDDY, UserRole.BOTH] },
      status: UserStatus.ACTIVE,
      emailVerified: true,
      availability: {
        some: {},
      },
    };

    // Filter by module/skills - enhanced search
    if (module) {
      where.OR = [
        { skills: { has: module } }, // exact match
        { skills: { hasSome: module.split(' ') } }, // partial matches for multi-word modules
      ];
    }

    // Filter by school details
    if (schoolName) {
      where.schoolName = { contains: schoolName, mode: 'insensitive' };
    }
    if (studyYear) {
      where.studyYear = { contains: studyYear, mode: 'insensitive' };
    }
    if (major) {
      where.major = { contains: major, mode: 'insensitive' };
    }

    // Add search functionality - enhanced to search skills
    if (search) {
      const searchTerms = search.toLowerCase().split(' ');
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } },
        { major: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: searchTerms } }, // search in skills array
        ...searchTerms.map(term => ({ skills: { has: term } })), // exact skill matches
      ];
    }

    // Build order by
    let orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'schoolName') {
      orderBy.schoolName = sortOrder;
    } else if (sortBy === 'completedSessions') {
      // For counting completed sessions, we'll need to handle this differently
      orderBy.createdAt = sortOrder; // fallback
    }

    const [buddies, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        include: {
          availability: true,
          _count: {
            select: {
              sessionsAsBuddy: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prismaService.user.count({ where }),
    ]);

    let processedBuddies = buddies.map(buddy => ({
      ...buddy,
      completedSessions: (buddy as any)._count.sessionsAsBuddy,
    }));

    // If sorting by completed sessions, sort manually
    if (sortBy === 'completedSessions') {
      processedBuddies.sort((a, b) => {
        const diff = a.completedSessions - b.completedSessions;
        return sortOrder === 'asc' ? diff : -diff;
      });
    }

    return {
      buddies: processedBuddies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get study buddy by ID with availability
  async findStudyBuddyById(id: string) {
    const buddy = await this.prismaService.user.findUnique({
      where: { 
        id,
        role: { in: [UserRole.BUDDY, UserRole.BOTH] },
        status: UserStatus.ACTIVE,
      },
      include: {
        availability: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        sessionsAsBuddy: {
          where: { status: 'COMPLETED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            learner: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            sessionsAsBuddy: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!buddy) {
      return null;
    }

    return {
      ...buddy,
      completedSessions: (buddy as any)._count.sessionsAsBuddy,
    };
  }

  // Add availability for a user
  async addAvailability(userId: string, createAvailabilityDto: CreateAvailabilityDto) {
    // Check if user can be a buddy
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== UserRole.BUDDY && user.role !== UserRole.BOTH)) {
      throw new Error('User is not authorized to add availability');
    }

    // Check for overlapping availability on the same day
    const existingAvailability = await this.prismaService.availability.findFirst({
      where: {
        userId,
        dayOfWeek: createAvailabilityDto.dayOfWeek,
        OR: [
          {
            startTime: { lte: createAvailabilityDto.startTime },
            endTime: { gt: createAvailabilityDto.startTime },
          },
          {
            startTime: { lt: createAvailabilityDto.endTime },
            endTime: { gte: createAvailabilityDto.endTime },
          },
          {
            startTime: { gte: createAvailabilityDto.startTime },
            endTime: { lte: createAvailabilityDto.endTime },
          },
        ],
      },
    });

    if (existingAvailability) {
      throw new Error('Overlapping availability exists for this time slot');
    }

    return this.prismaService.availability.create({
      data: {
        userId,
        ...createAvailabilityDto,
      },
    });
  }

  // Update availability
  async updateAvailability(id: string, userId: string, updateAvailabilityDto: UpdateAvailabilityDto) {
    const availability = await this.prismaService.availability.findFirst({
      where: { id, userId },
    });

    if (!availability) {
      throw new Error('Availability not found or unauthorized');
    }

    return this.prismaService.availability.update({
      where: { id },
      data: updateAvailabilityDto,
    });
  }

  // Remove availability
  async removeAvailability(id: string, userId: string) {
    const availability = await this.prismaService.availability.findFirst({
      where: { id, userId },
    });

    if (!availability) {
      throw new Error('Availability not found or unauthorized');
    }

    return this.prismaService.availability.delete({
      where: { id },
    });
  }

  // Get user's availability
  async getUserAvailability(userId: string) {
    return this.prismaService.availability.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  // Search study buddies by skills/modules
  async searchStudyBuddies(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = {
      role: { in: [UserRole.BUDDY, UserRole.BOTH] },
      status: UserStatus.ACTIVE,
      emailVerified: true,
      availability: {
        some: {},
      },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { skills: { has: query } },
        { bio: { contains: query, mode: 'insensitive' } },
        { major: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [buddies, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        include: {
          availability: true,
          _count: {
            select: {
              sessionsAsBuddy: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      buddies: buddies.map(buddy => ({
        ...buddy,
        completedSessions: (buddy as any)._count.sessionsAsBuddy,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
