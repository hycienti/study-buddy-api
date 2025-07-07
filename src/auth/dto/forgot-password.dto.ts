import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
  email: string;
}
