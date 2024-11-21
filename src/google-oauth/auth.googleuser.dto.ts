import { Request } from 'express';

export interface GoogleUser {
    email: string;
    firstName: string; 
    lastName: string; 
    avatar?: string; 
  }
  
  export interface GoogleRequest extends Request {
    cookies: { [key: string]: string }; 
    user: GoogleUser; 
  }