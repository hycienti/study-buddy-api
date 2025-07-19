import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiPropertyOptional({
    description: 'Update ticket status (OPEN, CLAIMED, RESOLVED, CLOSED)',
    enum: TicketStatus,
    example: TicketStatus.CLAIMED,
    enumName: 'TicketStatus'
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
