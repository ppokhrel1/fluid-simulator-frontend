import { type RefObject } from 'react';
import { type Mesh } from 'three';

export interface MeshData {
  id: string;
  type: string;
  vertices: number[][];
  faces: number[][];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters?: any;
  ref?: RefObject<Mesh>; // Make ref optional and use proper type
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