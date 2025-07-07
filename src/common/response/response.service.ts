import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
    // Method to format success responses
    successResponse(data: any, pagination?: any) {
        return {
            status: 'success',
            data: data,
            error: null,
            meta: this.getMeta(pagination),
        };
    }

    // Method to format error responses and throw an HttpException
    errorResponse(error: { status?: number; response?: string, errorDetails?: object | string }) {
        const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const response = {
            status: 'error',
            data: null,
            error: {
                code: status,
                message: error.response || 'An unexpected error occurred',
                details: error?.errorDetails ?? {}
            },
            meta: this.getMeta(),
        };
        throw new HttpException(response, status);
    }

    // Helper method to generate meta information, optionally including pagination
    private getMeta(pagination?: any) {
        const meta: any = {
            version: '1.0',
            timestamp: new Date().toISOString()
        };
        if (pagination) {
            meta.pagination = pagination;
        }
        return meta;
    }
}
