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
    // ✅ Backend expects FormData for login
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    // ✅ Use enhanced backend registration endpoint with full_name mapping
    const response = await api.post('/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name  // ✅ Maps to backend's enhanced schema
    });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    // ✅ Enhanced backend endpoint
    const response = await api.get('/user/me/');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post('/refresh');
    return response.data;
  },
};