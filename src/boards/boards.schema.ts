// src/boards/boards.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({ type: Types.ObjectId, ref: 'Team' })
  team: Types.ObjectId;
}
export const BoardSchema = SchemaFactory.createForClass(Board);