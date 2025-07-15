import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UserVerificationDto {
    @ApiProperty({ description: 'Whether to approve the user', required: true })
    @IsBoolean()
    isApproved: boolean;

    @ApiPropertyOptional({ type: String, description: 'Reason for rejection, if any' })
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
