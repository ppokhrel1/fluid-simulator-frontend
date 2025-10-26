// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/auth';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userData = await authAPI.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    localStorage.setItem('authToken', response.access_token);
    
    // Fetch user profile after successful login
    const userData = await authAPI.getProfile();
    setUser(userData);
  };

  const register = async (username: string, email: string, password: string, fullName: string) => {
    const response = await authAPI.register({ 
      username,
      email, 
      password, 
      full_name: fullName 
    });
    localStorage.setItem('authToken', response.access_token);
    
    // Fetch user profile after successful registration
    const userData = await authAPI.getProfile();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    authAPI.logout().catch(console.error);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};