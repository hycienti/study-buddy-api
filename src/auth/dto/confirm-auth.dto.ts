import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class ConfirmAuthDto {
  @ApiProperty({ 
    description: 'The email address of the user to confirm', 
    example: 'john.doe@university.edu',
    type: String,
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'The 6-digit confirmation code sent to the user via email', 
    example: '123456',
    type: String,
    minLength: 6,
    maxLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
