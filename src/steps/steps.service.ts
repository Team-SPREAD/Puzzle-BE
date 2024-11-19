// src/steps/steps.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Step } from './steps.schema';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class StepsService {
  constructor(
    @InjectModel(Step.name) private readonly stepModel: Model<Step>,
    private readonly httpService: HttpService, // HTTP 요청용 서비스
  ) {}

  async saveStepImage(boardId: Types.ObjectId, stepNumber: number, stepImgUrl: string): Promise<Step> {
    const validSteps = [3, 4, 5, 6, 7, 8, 9];
    
    if (!validSteps.includes(stepNumber)) {
      throw new Error(`유효하지 않은 단계 번호입니다: ${stepNumber}. 유효한 단계는 ${validSteps.join(', ')}입니다.`);
    }
  
    const stepField = `step${stepNumber}ImgUrl`; // 예: step3ImgUrl
    const updateData = { [stepField]: stepImgUrl, updatedDate: new Date() };
  
    const step = await this.stepModel.findOneAndUpdate(
      { board: boardId },
      { $set: updateData },
      { new: true, upsert: true }
    );
  
    if (stepNumber === 9) {
      const stepImages = [
        step.step3ImgUrl,
        step.step4ImgUrl,
        step.step5ImgUrl,
        step.step6ImgUrl,
        step.step7ImgUrl,
        step.step8ImgUrl,
        step.step9ImgUrl,
      ].filter((url) => url !== undefined);
  
      if (stepImages.length !== 7) {
        throw new Error('모든 단계 이미지(3~9)가 필요합니다.');
      }
  
      const markdownResult = await this.analyzeImagesWithPython(stepImages);
      step.result = markdownResult;
      await step.save();
    }
  
    return step;
  }
  
  

  private async analyzeImagesWithPython(imageUrls: string[]): Promise<string> {
    const pythonApiUrl = process.env.PYTHON_API_URL;
    try {
        console.log('Python API 호출 시작:', pythonApiUrl, imageUrls);
        const response = await this.httpService.post(pythonApiUrl, { imageUrls }).toPromise();
        console.log('Python API 응답 성공:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Python API 호출 실패:', error.message);
        throw new Error(`Python API 호출 실패: ${error.message}`);
    }
}

async findStepByBoardId(boardId: string): Promise<Step | null> {
  return this.stepModel.findOne({ board: new Types.ObjectId(boardId) }).exec();
}
}
