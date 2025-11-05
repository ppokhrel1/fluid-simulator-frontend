import React, { useRef, useMemo, useEffect } from 'react';
import { Mesh, BufferGeometry, BufferAttribute } from 'three';
import { TransformControls } from '@react-three/drei';
import type { MeshData } from '../../services/aiAPI';

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
      meshRef: meshRef.current ? 'SET' : 'NULL'
    });
  }, [object.id]);

  // --- 1. Geometry Creation Logic (Fixed: Added Torus and correct parameter usage) ---
  const MeshComponent = useMemo(() => {
    // Default size for primitives if parameters are missing
    const DEFAULT_UNIT = 1.0; 
    
    switch (object.type) {
      case 'cube':
        // Use object.parameters.size or a reasonable default
        const size = object.parameters?.size || 4.0;
        return <boxGeometry args={[size, size, size]} />;
        
      case 'sphere':
        // Use object.parameters.radius
        const radius = object.parameters?.radius || 2.0;
        return <sphereGeometry args={[radius, 32, 32]} />;
        
      case 'cylinder':
        // Use object.parameters.radius and object.parameters.height
        const cylRadius = object.parameters?.radius || DEFAULT_UNIT;
        const cylHeight = object.parameters?.height || 4.0;
        return <cylinderGeometry args={[cylRadius, cylRadius, cylHeight, 32]} />;
        
      case 'cone':
        // Use object.parameters.radius and object.parameters.height
        const coneRadius = object.parameters?.radius || DEFAULT_UNIT;
        const coneHeight = object.parameters?.height || 4.0;
        return <coneGeometry args={[coneRadius, coneHeight, 32]} />;

      case 'torus': // 👈 ADDED MISSING TORUS GEOMETRY
        const majorRadius = object.parameters?.major_radius || 4.0;
        const minorRadius = object.parameters?.minor_radius || 1.0;
        return <torusGeometry args={[majorRadius, minorRadius, 16, 100]} />;

      // --- Custom/AI-generated Mesh using BufferGeometry ---
      case 'mesh':
      case 'boolean':
        // Only run BufferGeometry creation for explicit custom/generated meshes
        if (object.vertices && object.faces) {
          const geometry = new BufferGeometry();
          
          // FIX 1 & 2: Flatten the vertices and indices arrays
          const flatVertices = object.vertices.flat();
          const flatIndices = object.faces.flat();
          
          geometry.setAttribute('position', new BufferAttribute(new Float32Array(flatVertices), 3));
          geometry.setIndex(new BufferAttribute(new Uint32Array(flatIndices), 1));
          
          geometry.computeVertexNormals();
          return <primitive object={geometry} />;
        }
        // Fallthrough if mesh data is missing
        
      default:
        // Final Fallback for unknown types or error states
        console.warn(`Unknown object type or missing parameters for ${object.id}: ${object.type}`);
        // Default to a small visible box if params fail
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [object]); 

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(object.id, meshRef.current);
  };
  
  const [x, y, z] = object.position || [0, 0, 0];
  const SCALING_FACTOR = 4; // Use the same factor as in AutoFit

  // FIX 3: Apply SCALING_FACTOR and cast as a tuple of 3 numbers
  const scaledPosition = [x * SCALING_FACTOR, y * SCALING_FACTOR, z * SCALING_FACTOR] as [number, number, number];
  
  console.log(`RENDER ${object.type}: Pos=${scaledPosition}`);
  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      position={scaledPosition} 
      rotation={object.rotation}
      scale={object.scale}
      castShadow
      receiveShadow
    >
      {MeshComponent} 
      <meshStandardMaterial 
        color={isSelected ? '#4f8cff' : '#ff0000'}
        metalness={0.1}
        roughness={0.5}
      />
      
      {showTransformControls && meshRef.current && (
        <TransformControls 
          mode={transformMode} 
          object={meshRef.current} 
          onMouseUp={() => onSelect(object.id, meshRef.current)}
        />
      )}
    </mesh>
  );
};

export default SceneObject;