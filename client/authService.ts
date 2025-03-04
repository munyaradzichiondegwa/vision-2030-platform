import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

class AuthService {
  private static BASE_URL = '/api/auth';
  private static TOKEN_KEY = 'auth_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await axios.post<AuthTokens>(`${this.BASE_URL}/login`, credentials);
      this.setTokens(response.data);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async register(credentials: RegisterCredentials): Promise<void> {
    try {
      await axios.post(`${this.BASE_URL}/register`, credentials);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    
    try {
      const response = await axios.post<AuthTokens>(`${this.BASE_URL}/refresh`, { refreshToken });
      this.setTokens(response.data);
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getCurrentUser(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  static hasRole(requiredRole: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      [UserRole.GUEST]: 1,
      [UserRole.USER]: 2,
      [UserRole.ADMIN]: 3,
      [UserRole.SUPER_ADMIN]: 4
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  private static handleAuthError(error: any): Error {
    if (axios.isAxiosError(error)) {
      return new Error(
        error.response?.data?.message || 
        'Authentication failed. Please try again.'
      );
    }
    return new Error('An unexpected error occurred');
  }
}

export { AuthService, UserRole };
