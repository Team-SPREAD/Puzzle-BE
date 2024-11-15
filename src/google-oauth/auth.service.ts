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

  async googleLogin(req: GoogleRequest, res: Response, redirectUrl?: string) {
    const { user: { email, firstName, lastName, avatar } } = req;

    let findUser = await this.usersRepository.findOneGetByEmail(email);

    if (!findUser) {
      findUser = await this.usersRepository.createUser(
        email,
        firstName,
        lastName,
        avatar,
      );
    }

    const googlePayload = { 
      email, 
      firstName, 
      lastName, 
      avatar, 
      userId: findUser._id,
    };

    const googleJwt = this.jwtService.sign(googlePayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES,
    });

    // redirectUrl이 있으면 해당 URL로 리다이렉트, 없으면 대시보드로 리다이렉트
    const targetUrl = redirectUrl 
      ? `${redirectUrl}?token=${googleJwt}`
      : `http://localhost:3000/dashboard?token=${googleJwt}`;

    // 리다이렉트 및 쿠키 삭제
    res.clearCookie('redirectUrl'); // 사용 후 쿠키 삭제
    return res.redirect(targetUrl);
  }

  async findById(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }
}
