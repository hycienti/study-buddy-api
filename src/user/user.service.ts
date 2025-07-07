import { Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserStatus } from '@prisma/client';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserService {
  constructor(private readonly prismaService: PrismaService, private readonly s3service: S3Service
  ) { }

  findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: {
        address: true,
        // verificationDocuments: true
      }
    });
  }

  async addUserVerificationDocument(userId, documentData) {
    if (!documentData.documentUrl || !documentData.documentType) {
      throw new Error('Document URL and type are required');
    }
    if (!documentData.documentUrl.startsWith('data:')) {
      throw new Error('Invalid document URL format');
    }
    if (!documentData.documentUrl.includes('base64')) {
      throw new Error('Document URL must be a base64 encoded string');
    }
    // Extract the base64 part of the document URL
    if (!documentData.documentUrl.includes(',')) {
      throw new Error('Document URL must contain a comma separating the metadata and base64 data');
    }
    // get the file type from the base64 string
    const mimeType = documentData.documentUrl.split(';')[0].split(':')[1];
    if (!mimeType) {
      throw new Error('Document URL must contain a valid MIME type');
    }

    const base64Document = documentData.documentUrl.split(',')[1];
    const buffer = Buffer.from(base64Document, 'base64');

    // Validate the buffer size (e.g., max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Document size exceeds the maximum limit of 5MB');
    }
    const uploadResult = await this.s3service.uploadFile({
      key: `verification-documents/${userId}/${Date.now()}.${mimeType.split('/')[1]}`,
      body: buffer,
      contentType: mimeType,
    });
    console.log('Upload Result:', uploadResult); 
    if (!uploadResult) {
      throw new Error('Failed to upload document');
    }
    return this.prismaService.userVerificationDocument.create({
      data: {
        userId,
        documentType: documentData.documentType,
        documentUrl: uploadResult?.url ?? documentData?.documentUrl,
      }
    });
  }

  async addUserAddress(userId, addressData) {
    return this.prismaService.userAddress.create({
      data: {
        userId,
        address1: addressData.addressLine1,
        address2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country
      }
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto
    });
  }

  async remove(id: string, userId: string) {
    // Check if the attempting user is the same as the user being deleted or is an admin
    const user = await this.prismaService.user.findUnique({
      where: { id }
    });
    if (!user) {
      throw new Error('User not found');
    }
    const requestingUser = await this.prismaService.user.findUnique({
      where: { id: userId }
    });
    if (!requestingUser) {
      throw new Error('Requesting user not found');
    }
    // Only allow admin to delete other users
    if (user.id !== userId && requestingUser.role !== 'ADMIN') {
      throw new Error('You can only delete your own account');
    }
    return this.prismaService.user.delete({
      where: { id }
    });
  }

  async changeAccountStatus(userId: string, status: UserStatus, currentUserID: string) {
    const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.status === status) {
      throw new Error(`User is already ${status}`);
    }
    // Check if the current user is an admin or the user themselves
    const currentUser = await this.prismaService.user.findUnique({ where: { id: currentUserID } });
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.id !== userId)) {
      throw new Error('Unauthorized to change account status');
    }
    return this.prismaService.user.update({
      where: { id: userId },
      data: { status }
    });
  }

  async getUserAddress(userId: string) {
    return await this.prismaService.userAddress.findMany({
      where: { userId }
    });
  }

  async getUserVerificationDocuments(userId: string) {
    const userdoc = await this.prismaService.userVerificationDocument.findMany({
      where: { userId }
    });
    return userdoc
  }

}
