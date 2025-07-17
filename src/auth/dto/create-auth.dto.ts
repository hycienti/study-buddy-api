import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class AvailabilityDto {

    @ApiProperty({ type: Number, description: 'Day of week (0=Sunday, 6=Saturday)', example: 1 })
    dayOfWeek: number;

    @ApiProperty({ type: String, description: 'Start time (HH:mm)', example: '14:00' })
    @IsString()
    startTime: string;

    @ApiProperty({ type: String, description: 'End time (HH:mm)', example: '16:30' })
    @IsString()
    endTime: string;
}

export class CreateAuthDto {
    @ApiProperty({ type: String, description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ type: String, description: 'User password', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ type: String, description: 'User full name' })
    @IsString()
    fullname: string;

    @ApiPropertyOptional({ type: String, description: 'School name' })
    @IsOptional()
    @IsString()
    schoolName?: string;

    @ApiPropertyOptional({ type: String, description: 'Year of study' })
    @IsOptional()
    @IsString()
    studyYear?: string;

    @ApiPropertyOptional({ type: String, description: 'Major subject' })
    @IsOptional()
    @IsString()
    major?: string;

    @ApiPropertyOptional({ type: [AvailabilityDto], description: 'Array of availabilities' })
    @IsOptional()
    availabilities?: AvailabilityDto[];
}