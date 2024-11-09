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
  exports: [UsersRepository, UserService], 
})
export class UsersModule {}
