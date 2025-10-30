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
    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('username', username); 
    body.append('password', password);
    body.append('scope', '');
    
    // Optional: Only include client_id/secret if required by your OAuth setup
    // body.append('client_id', 'your_client_id');
    // body.append('client_secret', 'your_client_secret');
    
    // 2. Send the POST request
    const response = await api.post('/login', body, {
      headers: {
        // 3. Set the correct Content-Type for form-urlencoded data
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const authData: AuthResponse = response.data;

    // 1. Store the token securely (e.g., in localStorage)
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('token_type', authData.token_type);

    // 2. Set the Authorization header for all future requests using your Axios instance
    api.defaults.headers.common['Authorization'] = `${authData.token_type} ${authData.access_token}`;
    
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {

    const response = await api.post('/register', {
      username: userData?.username,
      email: userData?.email,
      password: userData.password,
      full_name: userData?.full_name,  // ✅ Maps to backend's enhanced schema
      name: userData?.full_name,  // ✅ Added to match backend expectation
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