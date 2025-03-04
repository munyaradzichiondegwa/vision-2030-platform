import axios from 'axios';
import { User } from '../types';

const API_URL = '/api/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const register = async (userData: RegisterCredentials): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}/logout`);
  } catch (error) {
    throw new Error('Logout failed');
  }
};

export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    return null;
  }
};