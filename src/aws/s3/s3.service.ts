// src/aws/s3/s3.service.ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multerS3 from 'multer-s3';
import multer from 'multer';
import path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  public getMulterS3Config() {
    return {
      storage: multerS3({
        s3: this.client,
        bucket: this.configService.get('AWS_S3_BUCKETNAME'),
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: ObjectCannedACL.public_read,
        key(req, file, done) {
          const basename = path.basename(file.originalname, path.extname(file.originalname));
          const mimetype = file.mimetype.split('/')[1];
          const key = `puzzle-board-images/${basename}_${Date.now()}.${mimetype}`;
          done(null, key);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
      fileFilter(req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('지원되지 않는 파일 형식입니다.'), false);
        }
      },
    };
  }

  public async uploadSingleFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('파일이 존재하지 않습니다.');

    const key = `puzzle-board-images/${Date.now().toString()}-${file.originalname}`;
    const params = {
      Key: key,
      Body: file.buffer,
      Bucket: this.configService.get('AWS_S3_BUCKETNAME'),
      ACL: ObjectCannedACL.public_read,
      ContentDisposition: 'inline', // 브라우저에서 바로 보이도록 설정
      ContentType: file.mimetype,    // 파일의 MIME 타입 설정
    };
    const command = new PutObjectCommand(params);

    const uploadFileS3 = await this.client.send(command);
    if (uploadFileS3.$metadata.httpStatusCode !== 200) {
      throw new BadRequestException('파일 업로드 실패');
    }

    return { url: `https://${this.configService.get('AWS_S3_BUCKETNAME')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}` };
  }
}
