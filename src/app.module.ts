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
import { StepsModule } from './steps/steps.module'; // StepsModule 추가
import { HealthCheckController } from './global/healthcheck.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 환경 변수 사용 가능
    }), // .env 파일 및 환경 변수 로드
    MongooseModule.forRoot(process.env.MONGODB_URI), // MongoDB 연결
    AuthModule,
    UsersModule,
    TeamModule,
    InvitationModule,
    BoardModule,
    StepsModule, // StepsModule 등록
  ],
  controllers: [AppController,HealthCheckController],
  providers: [AppService],
})
export class AppModule {}
