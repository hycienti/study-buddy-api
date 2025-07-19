import { IsArray, IsString, IsNotEmpty, ArrayMinSize, ArrayMaxSize, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSkillsDto {
  @ApiProperty({
    description: 'Array of skills to add to user profile (will be merged with existing skills)',
    type: [String],
    example: ['JavaScript', 'Python', 'Data Analysis', 'Machine Learning'],
    minItems: 1,
    maxItems: 20
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(50, { each: true })
  skills: string[];
}

export class RemoveSkillsDto {
  @ApiProperty({
    description: 'Array of skills to remove from user profile',
    type: [String],
    example: ['JavaScript', 'Python'],
    minItems: 1,
    maxItems: 20
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills: string[];
}

export class UpdateSkillsDto {
  @ApiProperty({
    description: 'Complete array of skills to replace current skills (replaces all existing skills)',
    type: [String],
    example: ['JavaScript', 'Python', 'Data Analysis', 'Machine Learning', 'React', 'Node.js'],
    maxItems: 30
  })
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(50, { each: true })
  skills: string[];
}
