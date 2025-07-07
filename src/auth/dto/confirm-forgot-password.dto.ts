import { ApiProperty } from '@nestjs/swagger';

export class ConfirmForgotPasswordDto {
  @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'The confirmation code sent to the user', example: '123456' })
  code: string;

  @ApiProperty({ description: 'The new password for the user', example: 'newPassword123' })
  newPassword: string;
}
