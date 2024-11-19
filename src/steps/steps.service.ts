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
    // stepNumber의 타입과 값 출력
    console.log('stepNumber:', stepNumber, typeof stepNumber);
  
    const stepField = `step${stepNumber}ImgUrl`; // 예: step1ImgUrl
    const updateData = { [stepField]: stepImgUrl, updatedDate: new Date() };
  
    // 업데이트된 Step 문서
    const step = await this.stepModel.findOneAndUpdate(
      { board: boardId },
      { $set: updateData },
      { new: true, upsert: true }, // 없으면 생성
    );
    console.log('Updated Step Document:', step);
  
    // stepNumber를 정수로 변환하여 조건 확인
    if (Number(stepNumber) === 9) {
      const stepImages = [
        step.step1ImgUrl,
        step.step2ImgUrl,
        step.step3ImgUrl,
        step.step4ImgUrl,
        step.step5ImgUrl,
        step.step6ImgUrl,
        step.step7ImgUrl,
        step.step8ImgUrl,
        step.step9ImgUrl,
      ].filter((url) => url !== undefined); // undefined 제거
    
      console.log('Images to send to Python API:', stepImages);
    
      if (stepImages.length !== 9) {
        console.error('Not all steps have images:', stepImages);
        throw new Error('모든 단계 이미지가 필요합니다.');
      }
    
      const markdownResult = await this.analyzeImagesWithPython(stepImages);
      step.result = markdownResult;
      await step.save();
    } else {
      console.log('stepNumber is not 9, skipping Python API call.');
    }
  
    return step;
  }
  

  private async analyzeImagesWithPython(imageUrls: string[]): Promise<string> {
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000/analyze-images';
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
