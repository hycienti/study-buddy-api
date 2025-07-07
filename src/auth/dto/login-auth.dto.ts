import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'password123' })
  password: string;
}
