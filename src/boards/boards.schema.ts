import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Team } from '../teams/teams.schema';

@Schema()
export class Board extends Document {
  @Prop({ required: true })
  boardName: string;
  
  @Prop({ required: true })
  description: string;
  
  @Prop()
  boardImgUrl: string;

  @Prop()
  currentStep: string;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ default: Date.now })
  updatedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Team' }) // Team 모델을 참조하도록 설정
  team: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
