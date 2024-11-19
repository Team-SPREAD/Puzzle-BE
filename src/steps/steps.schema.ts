import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Step extends Document {
  
  @Prop()
  step1ImgUrl: string;

  @Prop()
  step2ImgUrl: string;

  @Prop()
  step3ImgUrl: string;

  @Prop()
  step4ImgUrl: string;

  @Prop()
  step5ImgUrl: string;

  @Prop()
  step6ImgUrl: string;

  @Prop()
  step7ImgUrl: string;

  @Prop()
  step8ImgUrl: string;

  @Prop()
  step9ImgUrl: string;

  @Prop()
  result: string;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ default: Date.now })
  updatedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Board' })
  board: Types.ObjectId;
}

export const StepSchema = SchemaFactory.createForClass(Step);
