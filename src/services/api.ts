// services/api.ts
import axios from 'axios';
import config from '~/config/constants';

// Use environment variables with REACT_APP_ prefix
const API_BASE_URL = config.apiUrl;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const modelsAPI = {
  // Upload model
  upload: async (formData: FormData) => {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get all models
  getAll: async (limit: number = 100, offset: number = 0) => {
    const response = await api.get(`/models/?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get single model
  get: async (modelId: number) => {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  },

  // Download model file
  download: async (modelId: number) => {
    const response = await api.get(`/models/${modelId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // Update model status (admin only)
  updateStatus: async (modelId: number, status: string) => {
    const response = await api.put(`/models/${modelId}/status`, { status });
    return response.data;
  },

  // Delete model (admin only)
  delete: async (modelId: number) => {
    const response = await api.delete(`/models/${modelId}`);
    return response.data;
  },
};

export const componentsAPI = {
  create: async (modelId: number, component: any) => {
    const response = await api.post(`/models/${modelId}/components`, component);
    return response.data;
  },

  getByModel: async (modelId: number) => {
    const response = await api.get(`/models/${modelId}/components`);
    return response.data;
  },

  update: async (componentId: number, updateData: any) => {
    const response = await api.put(`/components/${componentId}`, updateData);
    return response.data;
  },
};

export const analysisAPI = {
  create: async (result: any) => {
    const response = await api.post('/analysis/results', result);
    return response.data;
  },

  getByComponent: async (componentId: number) => {
    const response = await api.get(`/components/${componentId}/analysis`);
    return response.data;
  },
};

export default api;