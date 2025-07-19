import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'Partial update of user profile - only provided fields will be updated. Password updates require additional validation.',
        example: {
            name: 'Updated Name',
            bio: 'Updated bio description',
            skills: ['JavaScript', 'React', 'Node.js'],
            major: 'Software Engineering'
        }
    })
    example?: any;
}
