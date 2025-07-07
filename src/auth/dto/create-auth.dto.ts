import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateAuthDto {
    @ApiProperty({ type: String, description: 'User email address' })
    email: string;

    @ApiProperty({ type: String, description: 'User password' })
    password: string;

    @ApiProperty({ type: String, description: 'User full name' })
    fullname: string;

    @ApiProperty({ enum: UserRole, description: 'Type of user account' })
    userAccountType: UserRole;
}