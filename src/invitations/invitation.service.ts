import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from './../users/users.repository';
import { User } from '../users/users.schema';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(req: Request, res: Response, redirectUrl?: string) {
    try {
      const { email, firstName, lastName, avatar } = req.user as any;

      // 사용자 조회 또는 생성
      let findUser = await this.usersRepository.findOneGetByEmail(email);
      if (!findUser) {
        findUser = await this.usersRepository.createUser(email, firstName, lastName, avatar);
      }

      // JWT 생성
      const googlePayload = { email, firstName, lastName, avatar, userId: findUser._id };
      const googleJwt = this.jwtService.sign(googlePayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES,
      });

      // 쿠키에서 redirectUrl 읽기
      const cookieRedirectUrl = req.cookies?.redirectUrl;
      console.log('Cookies:', req.cookies); // 디버깅 로그
      console.log('Cookie redirectUrl:', cookieRedirectUrl); // 디버깅 로그

      // 리다이렉션 URL 설정
      redirectUrl = cookieRedirectUrl || redirectUrl || `http://localhost:3000/dashboard`;
      console.log('Final redirectUrl:', redirectUrl); // 디버깅 로그

      // 쿠키 삭제 (필요 없는 경우)
      res.clearCookie('redirectUrl');

      // 최종 리다이렉션
      const finalRedirectUrl = `${redirectUrl}?token=${googleJwt}`;
      return res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error('Error during Google login:', error);
      throw new UnauthorizedException('로그인 실패');
    }
  }
  
  async findById(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }
}
