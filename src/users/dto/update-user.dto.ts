import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'Partial update of user - only provided fields will be updated. Password field requires special handling for security.',
        example: {
            name: 'Updated Name',
            bio: 'Updated professional bio',
            skills: ['Advanced Mathematics', 'Statistics', 'Data Science'],
            studyYear: 'Graduate'
        }
    })
    example?: any;
}
