import { Request } from 'express';

export interface GoogleUser {
    email: string;
    firstName: string; 
    lastName: string; 
    avatar?: string; 
  }
  
  export interface GoogleRequest extends Request {
    cookies: { [key: string]: string }; // 쿠키 정보를 포함
    user: GoogleUser; // 구글 사용자 정보
  }