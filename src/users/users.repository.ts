import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findOneGetByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(
    email: string, 
    firstName: string, 
    lastName: string, 
    avatar: string
  ): Promise<User> {
    const user = new this.userModel({
      email,
      firstName,
      lastName,
      avatar,
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    return user.save();
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }
}
