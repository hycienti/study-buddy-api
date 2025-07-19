import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketCommentDto {
  @ApiProperty({
    description: 'Comment message to add to the ticket',
    example: 'I can help you with this topic. I have experience with SQL JOINs and can walk you through some examples. Let me know when you are available.',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
}
