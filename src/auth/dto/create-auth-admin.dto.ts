import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateAuthAdminDto {
    @ApiProperty({ type: String, description: 'User email address' })
    email: string;

    @ApiProperty({ type: String, description: 'User password' })
    password: string;

    @ApiProperty({ type: String, description: 'User first name' })
    firstName: string;

    @ApiProperty({ type: String, description: 'User last name' })
    lastName: string;

    @ApiProperty({ enum: Role, description: 'Type of user account' })
    role: Role;
}