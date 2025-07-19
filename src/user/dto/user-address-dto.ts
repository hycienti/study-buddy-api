import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UserAddressDto {
    @ApiProperty({ 
        description: 'The first line of the address (street number and name)', 
        example: '123 Main Street',
        maxLength: 200
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    addressLine1: string;

    @ApiPropertyOptional({ 
        description: 'The second line of the address (apartment, suite, etc.)', 
        example: 'Apt 4B',
        maxLength: 200
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    addressLine2?: string;

    @ApiProperty({ 
        description: 'The city of the address', 
        example: 'New York',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city: string;

    @ApiProperty({ 
        description: 'The state or province of the address', 
        example: 'NY',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    state: string;

    @ApiProperty({ 
        description: 'The postal or ZIP code of the address', 
        example: '10001',
        maxLength: 20
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    postalCode: string;

    @ApiProperty({ 
        description: 'The country of the address', 
        example: 'United States',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    country: string;
}