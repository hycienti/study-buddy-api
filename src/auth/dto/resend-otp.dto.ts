import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({ 
    description: 'The email address of the user requesting OTP resend', 
    example: 'john.doe@university.edu',
    type: String,
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
