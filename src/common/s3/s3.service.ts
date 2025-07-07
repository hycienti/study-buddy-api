import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, PutObjectCommandOutput, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

interface UploadResult {
    success: boolean;
    key?: string;
    url?: string;
    error?: string;
}

@Injectable()
export class S3Service implements OnModuleInit {
    private s3: S3Client;

    onModuleInit() {
        // Clean the region value - remove any extra characters after underscore
        const cleanRegion = process.env.AWS_REGION?.split('_')[0] || 'eu-north-1';

        // console.log({
        //     AWS_REGION: process.env.AWS_REGION,
        //     CLEAN_REGION: cleanRegion,
        //     AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        //     AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***' : undefined // Don't log actual secret
        // });

        this.s3 = new S3Client({
            region: cleanRegion,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            },
        });
    }

    async uploadFile({ bucket, key, body, contentType }: {
        bucket?: string;
        key: string;
        body: Buffer | Readable;
        contentType: string
    }): Promise<UploadResult> {
        try {
            const bucketName = bucket || process.env.S3BUCKET as string;
            const uploadParams = {
                Bucket: bucketName,
                Key: key,
                Body: body,
                ContentType: contentType,
            };

            const command = new PutObjectCommand(uploadParams);
            const result: PutObjectCommandOutput = await this.s3.send(command);

            // Construct the full S3 URL
            const region = process.env.AWS_REGION?.split('_')[0] || 'eu-north-1';
            const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

            return {
                success: true,
                key: key,
                url: url
            };
        } catch (error) {
            console.error('Upload failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async deleteFile({ bucket, key }: { bucket?: string; key: string }): Promise<UploadResult> {
        try {
            const deleteParams = {
                Bucket: bucket || process.env.AWS_BUCKET_NAME || process.env.S3BUCKET as string,
                Key: key
            };

            const command = new DeleteObjectCommand(deleteParams);
            await this.s3.send(command);

            return {
                success: true,
                key: key
            };
        } catch (error) {
            console.error('Delete failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}