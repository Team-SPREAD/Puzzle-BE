    // src/aws/s3/s3.controller.ts
    import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
    import { FileInterceptor } from '@nestjs/platform-express';
    import { S3Service } from './s3.service';
    import { UploadFile } from './s3.types';

    @Controller('file')
    export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadFile> {
        return await this.s3Service.uploadSingleFile(file);
    }
    }
