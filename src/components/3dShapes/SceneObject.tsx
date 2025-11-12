// frontend/src/components/3dShapes/SceneObject.tsx
import React, { useRef, useMemo, useEffect } from 'react';
import { Mesh, BufferGeometry, BufferAttribute } from 'three';
import { TransformControls } from '@react-three/drei';
import type { MeshData } from '~/types/3dshapes';

interface SceneObjectProps {
  object: MeshData;
  isSelected: boolean;
  onSelect: (objectId: string, mesh: Mesh | null) => void;
  showTransformControls?: boolean;
  transformMode: 'translate' | 'rotate' | 'scale';
}

const SceneObject: React.FC<SceneObjectProps> = ({ 
  object, 
  isSelected, 
  onSelect, 
  showTransformControls = false,
  transformMode 
}) => {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    console.log(`🎯 SceneObject MOUNTED: ${object.id}`, {
      type: object.type,
      position: object.position,
      vertices: object.vertices?.length,
      faces: object.faces?.length,
      material: object.material,
      meshRef: meshRef.current ? 'SET' : 'NULL'
    });
  }, [object.id]);

  // Geometry Creation Logic
  const MeshComponent = useMemo(() => {
    // Default size for primitives if parameters are missing
    const DEFAULT_UNIT = 1.0; 
    
    // 💡 FIX 1: Determine the base geometry type by stripping 'ai_' or mapping 'boolean'
    const typeKey = object.type.toLowerCase();
    let baseType = typeKey;
    if (typeKey.startsWith('ai_')) {
        baseType = typeKey.substring(3); // e.g., 'ai_cylinder' -> 'cylinder'
    } else if (typeKey === 'boolean') {
        baseType = 'mesh'; // Treat boolean results as raw meshes
    }
    
    switch (baseType) {
      case 'cube':
        const size = object.parameters?.size || 4.0;
        return <boxGeometry args={[size, size, size]} />;
        
      case 'sphere':
        const radius = object.parameters?.radius || 2.0;
        return <sphereGeometry args={[radius, 32, 32]} />;
        
      case 'cylinder':
        const cylRadius = object.parameters?.radius || DEFAULT_UNIT;
        const cylHeight = object.parameters?.height || 4.0;
        // 32 segments is a good default for smooth appearance
        return <cylinderGeometry args={[cylRadius, cylRadius, cylHeight, 32]} />;
        
      case 'cone':
        const coneRadius = object.parameters?.radius || DEFAULT_UNIT;
        const coneHeight = object.parameters?.height || 4.0;
        return <coneGeometry args={[coneRadius, coneHeight, 32]} />;

      case 'torus':
        const majorRadius = object.parameters?.major_radius || 4.0;
        const minorRadius = object.parameters?.minor_radius || 1.0;
        return <torusGeometry args={[majorRadius, minorRadius, 16, 100]} />;

      // Custom/AI-generated Mesh using BufferGeometry (for raw 'mesh' or 'boolean' results)
      case 'mesh':
        if (object.vertices && object.faces) {
          const geometry = new BufferGeometry();
          
          // Vertices and Faces from backend are already flattened arrays of numbers
          const flatVertices = object.vertices.flat();
          const flatIndices = object.faces.flat();
          
          geometry.setAttribute('position', new BufferAttribute(new Float32Array(flatVertices), 3));
          geometry.setIndex(new BufferAttribute(new Uint32Array(flatIndices), 1));
          
          geometry.computeVertexNormals();
          return <primitive object={geometry} />;
        }
        // Fallthrough if mesh data is missing
        
      default:
        console.warn(`Unknown object type or missing parameters for ${object.id}: ${object.type}. Falling back to a visible box.`);
        // Fallback to a visible size box (e.g., 4x4x4) to signal an issue
        return <boxGeometry args={[4, 4, 4]} />;
    }
  }, [object]); 

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(object.id, meshRef.current);
  };
  
  const [x, y, z] = object.position || [0, 0, 0];
  
  // 💡 FIX 2: REMOVE the SCALING_FACTOR multiplier. 
  // The position received from the backend is already scaled (e.g., 4x).
  const scaledPosition = [x, y, z] as [number, number, number];
  
  console.log(`RENDER ${object.type}: Pos=${scaledPosition}`);
  
  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      position={scaledPosition} // Use un-scaled position
      rotation={object.rotation}
      scale={object.scale}
      castShadow
      receiveShadow
    >
      {MeshComponent} 
      <meshStandardMaterial 
        color={object.material?.color || (isSelected ? '#4f8cff' : '#ff6b6b')}
        metalness={object.material?.metalness ?? 0.2}
        roughness={object.material?.roughness ?? 0.6}
        emissive={object.material?.emissive || '#000000'}
        emissiveIntensity={object.material?.emissiveIntensity ?? 0}
        transparent={object.material?.transparent || false}
        opacity={object.material?.opacity || 1}
        wireframe={object.material?.wireframe || false}
        // Add these to ensure updates are applied
        needsUpdate={true}
      />
      
      {showTransformControls && meshRef.current && (
        <TransformControls 
          mode={transformMode} 
          object={meshRef.current} 
          onMouseUp={() => onSelect(object.id, meshRef.current)} // This correctly updates transform
        />
      )}
    </mesh>
  );
};

export default SceneObject;