import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUrl } from 'class-validator';

enum DocumentType {
    STUDENT_ID = 'student_id',
    TRANSCRIPT = 'transcript',
    ENROLLMENT_LETTER = 'enrollment_letter',
    PASSPORT = 'passport',
    DRIVERS_LICENSE = 'drivers_license',
    OTHER = 'other'
}

export class UserVerificationDocumentDto {
    @ApiProperty({ 
        description: 'The type of verification document being uploaded',
        enum: DocumentType,
        example: DocumentType.STUDENT_ID,
        enumName: 'DocumentType'
    })
    @IsEnum(DocumentType)
    @IsNotEmpty()
    documentType: DocumentType;

    @ApiProperty({ 
        description: 'The URL of the uploaded document (typically from cloud storage)',
        example: 'https://s3.bucket.com/verification-docs/student-id-123.jpg',
        format: 'url'
    })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    documentUrl: string;
}

