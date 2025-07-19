import { PartialType } from '@nestjs/swagger';
import { CreateSessionDto } from './create-session.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @ApiPropertyOptional({
    description: 'Update the session status (only buddy can confirm, both can cancel)',
    enum: SessionStatus,
    example: SessionStatus.CONFIRMED,
    enumName: 'SessionStatus'
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiPropertyOptional({
    description: 'Add feedback after session completion (only available for completed sessions)',
    example: 'Great session! Very helpful with SQL concepts.',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
