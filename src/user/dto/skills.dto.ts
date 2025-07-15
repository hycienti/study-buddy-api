import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSkillsDto {
  @ApiProperty({
    description: 'Array of skills to add to user profile',
    type: [String],
    example: ['JavaScript', 'Python', 'Data Analysis', 'Machine Learning'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills: string[];
}

export class RemoveSkillsDto {
  @ApiProperty({
    description: 'Array of skills to remove from user profile',
    type: [String],
    example: ['JavaScript', 'Python'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills: string[];
}

export class UpdateSkillsDto {
  @ApiProperty({
    description: 'Complete array of skills to replace current skills',
    type: [String],
    example: ['JavaScript', 'Python', 'Data Analysis', 'Machine Learning'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills: string[];
}
