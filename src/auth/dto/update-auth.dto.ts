import { PartialType } from '@nestjs/swagger';
import { CreateAuthDto } from './create-auth.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
    @ApiProperty({
        description: 'Updates are applied partially - only provided fields will be updated',
        example: {
            fullname: 'Updated Name',
            schoolName: 'New University',
            major: 'Computer Science'
        }
    })
    example?: any;
}
