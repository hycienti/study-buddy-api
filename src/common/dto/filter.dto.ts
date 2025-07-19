import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export class FilterDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Search term for filtering results',
        example: 'JavaScript'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        example: 'createdAt'
    })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        description: 'Sort order (ascending or descending)',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;
}

export class DateRangeFilterDto extends FilterDto {
    @ApiPropertyOptional({
        description: 'Start date for filtering (ISO format)',
        example: '2025-07-01T00:00:00Z',
        format: 'date-time'
    })
    @IsOptional()
    dateFrom?: Date;

    @ApiPropertyOptional({
        description: 'End date for filtering (ISO format)',
        example: '2025-07-31T23:59:59Z',
        format: 'date-time'
    })
    @IsOptional()
    dateTo?: Date;
}
