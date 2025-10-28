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
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
          console.log('✅ Auth restored from localStorage:', userData);
        } catch (error) {
          console.warn('⚠️ Auth check failed, clearing invalid token:', error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        console.log('ℹ️ No auth token found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error during auth check:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('authToken', response.access_token);
      console.log('✅ Login successful, token stored');
      
      // Fetch user profile after successful login
      const userData = await authAPI.getProfile();
      setUser(userData);
      console.log('✅ User profile loaded:', userData);
    } catch (error) {
      console.error('❌ Login failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, fullName: string) => {
    try {
      // Enhanced backend creates user but doesn't return token, so we need to login afterwards
      const userData = await authAPI.register({ 
        username,
        email, 
        password, 
        full_name: fullName 
      });
      console.log('✅ Registration successful:', userData);
      
      // Now login with the created user
      await login(username, password);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      setUser(null);
      console.log('✅ Logout successful');
      authAPI.logout().catch(console.error);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
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