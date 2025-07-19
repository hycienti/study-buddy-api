import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({
        description: 'User email address',
        example: 'jane.smith@university.edu',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User full name',
        example: 'Jane Smith',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'User password',
        example: 'SecurePassword123!',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'User role in the platform',
        enum: UserRole,
        example: UserRole.BUDDY,
        enumName: 'UserRole'
    })
    role: UserRole;

    @ApiPropertyOptional({
        description: 'User bio or description',
        example: 'Experienced tutor in mathematics and computer science',
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional({
        description: 'User avatar URL',
        example: 'https://example.com/avatar.jpg'
    })
    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @ApiPropertyOptional({
        description: 'User skills and expertise areas',
        type: [String],
        example: ['Mathematics', 'Statistics', 'Python', 'R']
    })
    @IsArray()
    @IsOptional()
    skills?: string[];

    @ApiPropertyOptional({
        description: 'School or university name',
        example: 'University of Science'
    })
    @IsString()
    @IsOptional()
    schoolName?: string;

    @ApiPropertyOptional({
        description: 'Year of study',
        example: '4th Year'
    })
    @IsString()
    @IsOptional()
    studyYear?: string;

    @ApiPropertyOptional({
        description: 'Major subject of study',
        example: 'Mathematics'
    })
    @IsString()
    @IsOptional()
    major?: string;
}
