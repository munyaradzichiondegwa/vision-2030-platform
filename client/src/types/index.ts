// Example type definitions
export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'in-progress' | 'completed';
  }