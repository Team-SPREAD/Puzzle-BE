// src/teams/teams.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/users.schema';

@Schema()
export class Team extends Document {
  @Prop({ required: true })
  teamName: string;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ default: Date.now })
  updatedDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) // User 모델을 참조하도록 설정
  users: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
