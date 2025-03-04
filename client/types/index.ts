export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface LoginResponse {
    user: User;
    token: string;
  }
  