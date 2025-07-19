import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
    @ApiProperty({
        description: 'Indicates if the request was successful',
        example: true
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Operation completed successfully'
    })
    message: string;

    @ApiProperty({
        description: 'Response data',
        required: false
    })
    data?: T;

    @ApiProperty({
        description: 'Error details (only present when success is false)',
        required: false
    })
    error?: string;
}

export class PaginationDto {
    @ApiProperty({
        description: 'Current page number',
        example: 1,
        minimum: 1
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of items',
        example: 150
    })
    total: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 15
    })
    totalPages: number;
}

export class PaginatedResponseDto<T> {
    @ApiProperty({
        description: 'Array of items for current page'
    })
    items: T[];

    @ApiProperty({
        description: 'Pagination information',
        type: PaginationDto
    })
    pagination: PaginationDto;
}
