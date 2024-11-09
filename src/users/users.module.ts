// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { User, UserSchema } from './users.schema';
import { UsersRepository } from './users.repository';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UsersRepository, UserService],
  exports: [MongooseModule, UsersRepository, UserService], // MongooseModule 추가하여 UserModel 내보내기
})
export class UsersModule {}
