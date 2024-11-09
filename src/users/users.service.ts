import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { User } from '../users/users.schema';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async getUserInfo(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }
}
