import { ApiProperty } from '@nestjs/swagger';

export class ConfirmAuthDto {
  @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'The confirmation code sent to the user', example: '123456' })
  code: string;
}
