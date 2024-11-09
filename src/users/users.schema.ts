import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  avatar?: string;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ default: Date.now })
  updatedDate: Date;

  // @Prop({ type: [{ type: Types.ObjectId, ref: 'Team' }] })
  // teams: Types.ObjectId[]; // teams 관계 추가
}

export const UserSchema = SchemaFactory.createForClass(User);
