import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, Min, Max, Matches, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityDto {
  @ApiProperty({
    description: 'Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in HH:MM format (24-hour)',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format (24-hour)',
    example: '17:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;
}

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Array of availability time slots',
    type: [AvailabilityDto],
    example: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availabilities: AvailabilityDto[];
}

export class UpdateAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Availability ID (required for updates)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in HH:MM format (24-hour)',
    example: '10:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format (24-hour)',
    example: '16:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;
}

export class BulkUpdateAvailabilityDto {
  @ApiProperty({
    description: 'Array of availability updates (will replace all existing availabilities)',
    type: [UpdateAvailabilityDto],
    example: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '13:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAvailabilityDto)
  availabilities: UpdateAvailabilityDto[];
}
