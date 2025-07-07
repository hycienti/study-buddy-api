import { ApiProperty } from '@nestjs/swagger';

export class UserVerificationDocumentDto {
    @ApiProperty({ description: 'The type of the document', example: 'passport' })
    documentType: string;

    @ApiProperty({ description: 'The URL of the document', example: 'https://example.com/document.jpg' })
    documentUrl: string;

}

