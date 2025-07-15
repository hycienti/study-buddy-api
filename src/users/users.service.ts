import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { UserVerificationDto } from './dto/user-verification.dto';
import { Prisma, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    status?: UserStatus,
    role?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: Prisma.UserWhereInput = {
      ...(status && { status }),
      ...(role && { role: role as any }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { major: { contains: search, mode: 'insensitive' } },
          { schoolName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Build orderBy clause for sorting
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy === 'name' || sortBy === 'email' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          bio: true,
          avatarUrl: true,
          skills: true,
          createdAt: true,
          updatedAt: true,
          schoolName: true,
          studyYear: true,
          major: true,
          emailVerified: true,
          phoneVerified: true,
          status: true,
          _count: {
            select: {
              sessionsAsBuddy: true,
              sessionsAsLearner: true,
              ticketsCreated: true,
              ticketsClaimed: true,
            },
          },
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyUser(id: string, dto: UserVerificationDto) {
    // For now, just update user status or related verification logic
    // Since the schema doesn't have verification fields, we'll update status
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { 
        status: dto.isApproved ? UserStatus.ACTIVE : UserStatus.SUSPENDED 
      },
      include: {
        availability: true,
        sessionsAsBuddy: { take: 5, orderBy: { createdAt: 'desc' } },
        sessionsAsLearner: { take: 5, orderBy: { createdAt: 'desc' } },
        ticketsCreated: { take: 5, orderBy: { createdAt: 'desc' } },
        ticketsClaimed: { take: 5, orderBy: { createdAt: 'desc' } },
      }
    });

    return updatedUser;
  }

  findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: {
        availability: true,
        sessionsAsBuddy: {
          include: {
            learner: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        sessionsAsLearner: {
          include: {
            buddy: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ticketsCreated: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        ticketsClaimed: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            sessionsAsBuddy: true,
            sessionsAsLearner: true,
            ticketsCreated: true,
            ticketsClaimed: true,
          },
        },
      }
    });
  }

  remove(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
