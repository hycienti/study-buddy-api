import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @ApiProperty({
    description: 'Session status',
    enum: SessionStatus,
    required: false,
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiProperty({
    description: 'Session feedback',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
