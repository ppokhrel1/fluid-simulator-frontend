import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { objectStudioAPI } from '~/services/aiAPI';
import type { MeshData, AIGenerationRequest, PrimitiveShape } from '~/services/aiAPI';

// Define the shape of the context values
interface ObjectStudioContextType {
  objects: MeshData[];
  selectedObject: string | null;
  isLoading: boolean;
  setSelectedObject: (id: string | null) => void;
  createPrimitive: (shapeData: PrimitiveShape) => Promise<string | undefined>;
  generateAIShape: (prompt: string, baseMeshId?: string) => Promise<string | undefined>;
  // ... include all other functions like performBoolean, exportToSupabase, etc.
  performBoolean: (operation: string, meshAId: string, meshBId: string) => Promise<string | undefined>;
  exportToSupabase: (meshId: string, format: string) => Promise<string | undefined>;
  updateTransform: (meshId: string, transform: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; }) => Promise<void>;
  deleteObject: (meshId: string) => Promise<void>;
}

// 1. Create the Context
const ObjectStudioContext = createContext<ObjectStudioContextType | undefined>(undefined);

// 2. Create the Provider Component
export const ObjectStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [objects, setObjects] = useState<MeshData[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NOTE: All the logic from your original useObjectStudio.ts goes here
  
  // The original 'createPrimitive' implementation (with proper logging)
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
        parameters: shapeData.parameters
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

  // Placeholder for other functions (You should move all other functions from useObjectStudio.ts here)
  const generateAIShape = () => { /* ... move logic from useObjectStudio.ts here ... */ return Promise.resolve(undefined as any)};
  const performBoolean = () => { /* ... move logic from useObjectStudio.ts here ... */ return Promise.resolve(undefined as any)};
  const exportToSupabase = () => { /* ... move logic from useObjectStudio.ts here ... */ return Promise.resolve(undefined as any)};
  const updateTransform = () => { /* ... move logic from useObjectStudio.ts here ... */ return Promise.resolve()};
  const deleteObject = () => { /* ... move logic from useObjectStudio.ts here ... */ return Promise.resolve()};
  
  // Memoize the context value to prevent unnecessary re-renders
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
    deleteObject
  }), [objects, selectedObject, isLoading, createPrimitive]);

  return (
    <ObjectStudioContext.Provider value={contextValue}>
      {children}
    </ObjectStudioContext.Provider>
  );
};

// 3. Create the Custom Hook (This will replace the contents of your original useObjectStudio.ts)
export const useObjectStudio = () => {
  const context = useContext(ObjectStudioContext);
  if (context === undefined) {
    throw new Error('useObjectStudio must be used within an ObjectStudioProvider');
  }
  return context;
};