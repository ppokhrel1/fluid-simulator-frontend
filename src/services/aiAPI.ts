// services/api.ts - ADD THESE NEW SECTIONS
import axios from 'axios';
import type { CartItem } from '~/components/Store/CartModal';
import config from '~/config/constants';
import { modelsAPI } from './api';

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
  const token = localStorage.getItem('access_token');
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
      localStorage.removeItem('access_token');
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ====== 3D OBJECT STUDIO & AI GENERATION API ======
export const objectStudioAPI = {
  // Primitive Shape Creation
  createPrimitive: async (shapeData: {
    shape_type: string; // 'cube', 'sphere', 'cylinder', 'cone', 'torus'
    parameters: any;
    position?: [number, number, number];
    rotation?: [number, number, number];
  }) => {
    const response = await api.post('/developer/object-studio/primitives/create', shapeData);
    return response.data;
  },

  // Boolean Operations
  booleanOperation: async (operationData: {
    operation: string; // 'union', 'difference', 'intersection'
    mesh_a_id: string;
    mesh_b_id: string;
  }) => {
    const response = await api.post('/developer/object-studio/boolean/operation', operationData);
    return response.data;
  },

  // AI Shape Generation
  generateAIShape: async (generationData: {
    prompt: string;
    base_mesh_id?: string;
    operation?: string;
  }) => {
    const response = await api.post('/developer/object-studio/ai/generate-shape', generationData);
    return response.data;
  },

  // Transform Operations
  updateTransform: async (transformData: {
    mesh_id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }) => {
    const response = await api.post('/developer/object-studio/transform/update', transformData);
    return response.data;
  },

  // Export to Supabase Storage
  exportMesh: async (meshId: string, format: string = 'stl') => {
    const response = await api.post(`/developer/object-studio/export/${meshId}`, {
      format,
      user_id: localStorage.getItem('user_id') // or get from your auth context
    });
    return response.data;
  },

  // Get all user meshes
  getUserMeshes: async () => {
    const response = await api.get('/developer/object-studio/meshes');
    return response.data;
  },

  // Delete mesh
  deleteMesh: async (meshId: string) => {
    const response = await api.delete(`/developer/object-studio/meshes/${meshId}`);
    return response.data;
  }
};

// ====== ENHANCED MODELS API FOR 3D OBJECTS ======
// Extend your existing modelsAPI for 3D object features
export const enhancedModelsAPI = {
  ...modelsAPI,
  
  // Upload 3D model and automatically process for studio
  uploadForStudio: async (formData: FormData) => {
    const response = await api.post('/developer/models/upload-for-studio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Convert existing model to studio format
  convertToStudio: async (modelId: number) => {
    const response = await api.post(`/developer/models/${modelId}/convert-to-studio`);
    return response.data;
  }
};

// ====== TYPES FOR 3D OBJECT STUDIO ======
export interface MeshData {
  id: string;
  type: string;
  vertices: number[][];
  faces: number[][];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters?: any;
  user_id?: string;
  created_at?: string;
}

export interface AIGenerationRequest {
  prompt: string;
  base_mesh_id?: string;
  operation?: 'add' | 'extrude' | 'modify';
}

export interface PrimitiveShape {
  shape_type: string;
  parameters: {
    size?: number;
    radius?: number;
    height?: number;
    major_radius?: number;
    minor_radius?: number;
    subdivisions?: number;
  };
}

export interface BooleanOperation {
  operation: 'union' | 'difference' | 'intersection';
  mesh_a_id: string;
  mesh_b_id: string;
}