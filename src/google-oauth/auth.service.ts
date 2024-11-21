import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from './../users/users.repository';
import { User } from '../users/users.schema';
import { GoogleRequest } from './auth.googleuser.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(req: GoogleRequest, res: Response) {
    try {
      const { user: { email, firstName, lastName, avatar } } = req;

      let findUser = await this.usersRepository.findOneGetByEmail(email);

      if (!findUser) {
        findUser = await this.usersRepository.createUser(
          email, 
          firstName,
          lastName,
          avatar
        );
      }

      const googlePayload = { email, firstName, lastName, avatar, userId: findUser._id };
      const googleJwt = {
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES,
        }),
      };
      return res.redirect(`http://localhost:3000/dashboard/?token=${googleJwt.token}`);

    } catch (error) {
      console.error(error);
      throw new UnauthorizedException("로그인 실패");
    }
  }

  async findById(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }
  
}