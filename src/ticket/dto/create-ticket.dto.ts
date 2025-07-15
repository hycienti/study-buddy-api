import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
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
    description: 'Detailed description of the help needed',
    example: 'I need help understanding complex JOIN operations in SQL...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Preferred times for help sessions',
    type: [String],
    example: ['Monday 2-4 PM', 'Wednesday 10-12 AM'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  preferredTimes?: string[];

  @ApiProperty({
    description: 'File attachments (URLs)',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}
