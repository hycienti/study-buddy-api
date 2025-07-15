import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketCommentDto {
  @ApiProperty({
    description: 'Comment message',
    example: 'I can help you with this topic. Let me know when you are available.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
