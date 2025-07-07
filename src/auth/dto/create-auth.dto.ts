import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
    @ApiProperty({ type: String, description: 'User email address' })
    email: string;

    @ApiProperty({ type: String, description: 'User password' })
    password: string;

    @ApiProperty({ type: String, description: 'User first name' })
    firstName: string;

    @ApiProperty({ type: String, description: 'User last name' })
    lastName: string;

    @ApiProperty({ enum: ['Sender', 'Traveler'], description: 'Type of user account' })
    userAccountType: "Sender" | "Traveler";
}