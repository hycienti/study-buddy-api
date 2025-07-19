import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserVerificationDto {
    @ApiProperty({ 
        description: 'Whether to approve the user verification request', 
        example: true,
        type: Boolean
    })
    @IsBoolean()
    isApproved: boolean;

    @ApiPropertyOptional({ 
        type: String, 
        description: 'Reason for rejection (required if isApproved is false)',
        example: 'Verification documents are not clear or incomplete',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    rejectionReason?: string;
}
