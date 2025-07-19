import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ 
    description: 'The email address of the user', 
    example: 'john.doe@university.edu',
    type: String,
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'The password of the user', 
    example: 'SecurePassword123!',
    type: String,
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
