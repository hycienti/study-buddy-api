import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ConfirmForgotPasswordDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The confirmation code sent to the user',
    example: '123456',
    type: String,
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'The new password for the user',
    example: 'newPassword123',
    type: String,
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @Length(8, 128)
  newPassword: string;
}
