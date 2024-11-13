// src/invitations/invitation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // timestamps 옵션 추가
export class Invitation extends Document {
  @Prop({ required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  invitedEmail: string;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'accepted' | 'declined';

  @Prop()
  createdDate: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
