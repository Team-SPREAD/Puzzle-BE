// src/invitations/invitation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Invitation extends Document {
  @Prop({ required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  invitedEmail: string;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'accepted' | 'declined';

  @Prop({ default: Date.now })
  createdDate: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
