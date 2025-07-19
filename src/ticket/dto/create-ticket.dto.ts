import { IsString, IsNotEmpty, IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Module or subject for which help is needed',
    example: 'Data & Decisions',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  module: string;

  @ApiProperty({
    description: 'Specific topic within the module',
    example: 'SQL JOIN Operations',
    minLength: 2,
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  topic: string;

  @ApiProperty({
    description: 'Detailed description of the help needed, including specific questions or areas of confusion',
    example: 'I need help understanding complex JOIN operations in SQL. Specifically, I\'m struggling with LEFT JOIN vs INNER JOIN and when to use each one. I have some sample queries that aren\'t working as expected.',
    minLength: 10,
    maxLength: 2000
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    description: 'Preferred times for help sessions (flexible text format)',
    type: [String],
    example: ['Monday 2-4 PM', 'Wednesday 10-12 AM', 'Friday afternoon'],
    maxItems: 10
  })
  @IsArray()
  @IsOptional()
  preferredTimes?: string[];

  @ApiPropertyOptional({
    description: 'File attachment URLs (uploaded files, screenshots, documents)',
    type: [String],
    example: ['https://s3.bucket.com/file1.pdf', 'https://s3.bucket.com/screenshot.png'],
    maxItems: 5
  })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}
