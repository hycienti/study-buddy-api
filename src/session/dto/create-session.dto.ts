import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'ID of the study buddy',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  buddyId: string;

  @ApiProperty({
    description: 'Module or subject',
    example: 'Data & Decisions',
  })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({
    description: 'Specific topic',
    example: 'SQL Queries',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({
    description: 'Session date and time',
    example: '2025-07-20T14:00:00Z',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Optional meeting link (will be auto-generated if not provided)',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingLink?: string;
}
