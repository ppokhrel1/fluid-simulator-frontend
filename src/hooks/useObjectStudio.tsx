// hooks/useObjectStudio.ts (FULLY UPDATED WITH MATERIAL SUPPORT)
import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { objectStudioAPI } from '~/services/aiAPI';
import type {AIGenerationRequest, PrimitiveShape } from '~/services/aiAPI';
import type { MeshData } from '~/types/3dshapes';

// Define the shape of the context values
interface ObjectStudioContextType {
  objects: MeshData[];
  selectedObject: string | null;
  isLoading: boolean;
  setSelectedObject: (id: string | null) => void;
  createPrimitive: (shapeData: PrimitiveShape) => Promise<string | undefined>;
  generateAIShape: (prompt: string, baseMeshId?: string) => Promise<string | undefined>;
  performBoolean: (operation: string, meshAId: string, meshBId: string) => Promise<string | undefined>;
  exportToSupabase: (meshId: string, format: string) => Promise<string | undefined>;
  updateTransform: (meshId: string, transform: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; }) => Promise<void>;
  deleteObject: (meshId: string) => Promise<void>;
  updateObjectMaterial: (objectId: string, material: any) => void;
}

// Create the Context
const ObjectStudioContext = createContext<ObjectStudioContextType | undefined>(undefined);

// Create the Provider Component
export const ObjectStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [objects, setObjects] = useState<MeshData[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create primitive shapes
  const createPrimitive = useCallback(async (shapeData: PrimitiveShape) => {
    setIsLoading(true);
    try {
      const response = await objectStudioAPI.createPrimitive(shapeData);
      console.log('Primitive creation response:', response, shapeData);
      
      const newObject: MeshData = {
        id: response.mesh_id,
        type: shapeData.shape_type, 
        vertices: response.vertices,
        faces: response.faces,
        position: response.position || [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        parameters: shapeData.parameters,
        material: {
          color: '#ff6b6b',
          metalness: 0.2,
          roughness: 0.6,
          emissive: '#000000',
          emissiveIntensity: 0,
          transparent: false,
          opacity: 1,
          wireframe: false
        }
      };
      
      setObjects(prev => {
        const newArray = [...prev, newObject];
        console.log('🔄 Objects array updated (Context), new length:', newArray.length);
        return newArray;
      });
      
      return newObject.id;
    } catch (error) {
      console.error('❌ API FAILED. Failed to create primitive:', error); 
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // AI Shape Generation
  const generateAIShape = useCallback(async (prompt: string, baseMeshId?: string) => {
    setIsLoading(true);
    try {
      console.log('🔄 1. Starting AI generation with prompt:', prompt);
      const response = await objectStudioAPI.generateAIShape({
        prompt,
        base_mesh_id: baseMeshId
      });
      
      console.log('✅ 2. AI generation response:', response);
      
      const newObject: MeshData = {
        id: response.mesh_id,
        type: response.type,
        vertices: response.vertices,
        faces: response.faces,
        position: response.position || [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        parameters: { prompt },
        material: {
          color: '#ff6b6b',
          metalness: 0.2,
          roughness: 0.6,
          emissive: '#000000',
          emissiveIntensity: 0,
          transparent: false,
          opacity: 1,
          wireframe: false
        }
      };
      
      console.log('🆕 3. New object created:', newObject);
      
      setObjects(prev => {
        const updated = [...prev, newObject];
        console.log('📦 4. Objects array updated:', {
          previousCount: prev.length,
          newCount: updated.length,
          allObjects: updated.map(obj => ({ id: obj.id, type: obj.type, position: obj.position }))
        });
        return updated;
      });
      
      return newObject.id;
    } catch (error: any) {
      console.error('❌ AI generation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Boolean Operations
  const performBoolean = useCallback(async (operation: string, meshAId: string, meshBId: string) => {
    setIsLoading(true);
    try {
      const response = await objectStudioAPI.booleanOperation({
        operation,
        mesh_a_id: meshAId,
        mesh_b_id: meshBId
      });
      
      const newObject: MeshData = {
        id: response.mesh_id,
        type: 'boolean',
        vertices: response.vertices,
        faces: response.faces,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        parameters: { operation },
        material: {
          color: '#ff6b6b',
          metalness: 0.2,
          roughness: 0.6,
          emissive: '#000000',
          emissiveIntensity: 0,
          transparent: false,
          opacity: 1,
          wireframe: false
        }
      };
      
      setObjects(prev => [...prev, newObject]);
      return newObject.id;
    } catch (error) {
      console.error('Boolean operation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export to Supabase
  const exportToSupabase = useCallback(async (meshId: string, format: string = 'stl') => {
    try {
      const response = await objectStudioAPI.exportMesh(meshId, format);
      
      alert(`Model exported successfully! File saved to Supabase.`);
      
      return response.download_url;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, []);

  // Update object transform
  const updateTransform = useCallback(async (meshId: string, transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }) => {
    try {
      await objectStudioAPI.updateTransform({
        mesh_id: meshId,
        ...transform
      });
      
      // Update local state
      setObjects(prev => 
        prev.map(obj => 
          obj.id === meshId ? { ...obj, ...transform } : obj
        )
      );
    } catch (error) {
      console.error('Transform update failed:', error);
    }
  }, []);

  // Delete object
  const deleteObject = useCallback(async (meshId: string) => {
    try {
      await objectStudioAPI.deleteMesh(meshId);
      setObjects(prev => prev.filter(obj => obj.id !== meshId));
      
      if (selectedObject === meshId) {
        setSelectedObject(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }, [selectedObject]);

  // Update object material
  const updateObjectMaterial = useCallback((objectId: string, material: any) => {
    console.log('🎨 Updating material for:', objectId, material);
    setObjects(prev => prev.map(obj => 
      obj.id === objectId 
        ? { 
            ...obj, 
            material: { 
              ...obj.material, 
              ...material 
            } 
          }
        : obj
    ));
  }, []);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    objects,
    selectedObject,
    isLoading,
    setSelectedObject,
    createPrimitive,
    generateAIShape,
    performBoolean,
    exportToSupabase,
    updateTransform,
    deleteObject,
    updateObjectMaterial
  }), [
    objects, 
    selectedObject, 
    isLoading, 
    createPrimitive, 
    generateAIShape, 
    performBoolean, 
    exportToSupabase, 
    updateTransform, 
    deleteObject,
    updateObjectMaterial
  ]);

  return (
    <ObjectStudioContext.Provider value={contextValue}>
      {children}
    </ObjectStudioContext.Provider>
  );
};

// Create the Custom Hook
export const useObjectStudio = () => {
  const context = useContext(ObjectStudioContext);
  if (context === undefined) {
    throw new Error('useObjectStudio must be used within an ObjectStudioProvider');
  }
  return context;
};