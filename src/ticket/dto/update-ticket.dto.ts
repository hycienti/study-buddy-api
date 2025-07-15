import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiProperty({
    description: 'Ticket status',
    enum: TicketStatus,
    required: false,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
