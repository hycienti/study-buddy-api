import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserAddressDto {
    @ApiProperty({ description: 'The first line of the address', example: '123 Main St' })
    addressLine1: string;

    @ApiProperty({ description: 'The second line of the address', example: 'Apt 4B', required: false })
    addressLine2?: string;

    @ApiProperty({ description: 'The city of the address', example: 'New York' })
    city: string;

    @ApiProperty({ description: 'The state of the address', example: 'NY' })
    state: string;

    @ApiProperty({ description: 'The postal code of the address', example: '10001' })
    postalCode: string;

    @ApiProperty({ description: 'The country of the address', example: 'USA' })
    country: string;
}