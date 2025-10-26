// services/auth.ts
import api from './api';
import type { User } from '../types/auth';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    // Use FormData for OAuth2PasswordRequestForm
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    // Note: grant_type is optional for OAuth2PasswordRequestForm but can be added:
    // params.append('grant_type', 'password');

    const response = await api.post('/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    // Register might still use JSON or form data - check your backend
    const response = await api.post('/auth/user', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/me/');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};