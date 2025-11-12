import { type RefObject } from 'react';
import { type Mesh } from 'three';

// ====== TYPES FOR 3D OBJECT STUDIO ======
export interface MeshData {
  id: string;
  type: string;
  vertices?: number[][];
  faces?: number[][];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters?: any;
  // Add the material property
  material?: {
    color?: string;
    metalness?: number;
    roughness?: number;
    emissive?: string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
  };
}

export interface AIGenerationRequest {
  prompt: string;
  baseMeshId?: string;
  operation?: 'add' | 'extrude' | 'modify';
  targetFace?: number;
}

export interface SupabaseFileResponse {
  id: string;
  url: string;
  format: string;
  mesh_id: string;
}