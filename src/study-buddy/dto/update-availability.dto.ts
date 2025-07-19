import { PartialType } from '@nestjs/swagger';
import { CreateAvailabilityDto } from './create-availability.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {
    @ApiProperty({
        description: 'Partial update of availability - only provided fields will be updated',
        example: {
            startTime: '10:00',
            endTime: '16:00'
        }
    })
    example?: any;
}
