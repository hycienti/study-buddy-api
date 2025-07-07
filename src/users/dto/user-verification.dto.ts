import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { UserVerificationStatus } from '@prisma/client';

export class UserVerificationDto {
    @ApiProperty({ description: 'ID of the document verification status is being updated', required: true })
    @IsInt()
    documentId: number;

    @ApiProperty({ enum: UserVerificationStatus, required: true, description: 'New verification status for the document' })
    @IsEnum(UserVerificationStatus)
    status: UserVerificationStatus;

    @ApiPropertyOptional({ type: String, description: 'Reason for rejection, if any' })
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
