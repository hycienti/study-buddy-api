import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAuthAdminDto {
    @ApiProperty({ 
        type: String, 
        description: 'Administrator email address',
        example: 'admin@university.edu',
        format: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ 
        type: String, 
        description: 'Administrator password',
        example: 'AdminPassword123!',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({ 
        type: String, 
        description: 'Administrator first name',
        example: 'John'
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ 
        type: String, 
        description: 'Administrator last name',
        example: 'Smith'
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;
}