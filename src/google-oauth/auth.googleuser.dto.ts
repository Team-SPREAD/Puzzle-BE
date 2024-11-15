export interface GoogleUser {
    email: string;
    firstName: string; 
    lastName: string; 
    avatar?: string; 
  }
  
  export interface GoogleRequest {
    user: GoogleUser;
  }
  