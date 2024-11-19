import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { StepsController } from './steps.controller';
import { StepsService } from './steps.service';
import { Step, StepSchema } from './steps.schema';
import { S3Service } from '../aws/s3/s3.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule, // HTTP 요청 모듈 추가
    MongooseModule.forFeature([{ name: Step.name, schema: StepSchema }]),
  ],
  controllers: [StepsController],
  providers: [StepsService, S3Service],
  exports: [StepsService],
})
export class StepsModule {}
