// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './google-oauth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamModule } from './teams/teams.module';
import { InvitationModule } from './invitations/invitations.module';
import { BoardModule } from './boards/board.module'; 

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule, 
    UsersModule,
    TeamModule, 
    InvitationModule, 
    BoardModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
