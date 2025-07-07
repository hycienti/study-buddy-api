import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { UserVerificationDto } from './dto/user-verification.dto';
import { UserVerificationStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prismaService.user.count()
    ]);
    const pageSize = users.length;
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pageSize,
        totalPages
      }
    };
  }

  async verifyUser(id: string, dto: UserVerificationDto) {
    const isVerified = dto.status === UserVerificationStatus.VERIFIED;
    // Update user verification status
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { isVerified: isVerified },
      include: {
        verificationDocuments: true,
        address: true,
        Travels: true,
        sendRequest: true,
      }
    });

    // Update the latest verification document for the user
    await this.prismaService.userVerificationDocument.updateMany({
      where: {
        userId: id,
        id: dto.documentId,
        status: { not: dto.status }, // Only update documents not already in the desired status
      },
      data: {
        status: dto.status,
        documentVerifiedAt: dto.status === UserVerificationStatus.VERIFIED ? new Date() : null,
        rejectionReason: dto.rejectionReason,
      },
    });

    return updatedUser;
  }


  findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: {
        Travels: true,
        sendRequest: true,
        verificationDocuments: true,
        address: true,
      }
    });
  }

  remove(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
