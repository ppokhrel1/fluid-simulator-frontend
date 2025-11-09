import React, { useMemo } from 'react';
import * as THREE from 'three';

interface GeometryViewerProps {
  geometry: {
    vertices: number[];
    faces: number[];
    normals?: number[];
  };
  color?: string;
  opacity?: number;
}

const GeometryViewer: React.FC<GeometryViewerProps> = ({ 
  geometry, 
  color = "#4F8DFF",
  opacity = 0.85
}) => {
  const { bufferGeometry, hasValidData } = useMemo(() => {
    if (!geometry?.vertices || !geometry.faces) {
      return { bufferGeometry: null, hasValidData: false };
    }

    const geom = new THREE.BufferGeometry();
    
    try {
      // Set vertices
      const vertices = new Float32Array(geometry.vertices);
      geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      // Set indices
      const indices = new Uint32Array(geometry.faces);
      geom.setIndex(new THREE.BufferAttribute(indices, 1));
      
      // Set normals
      if (geometry.normals && geometry.normals.length === geometry.vertices.length) {
        const normals = new Float32Array(geometry.normals);
        geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      } else {
        // Compute normals if not provided
        geom.computeVertexNormals();
      }
      
      return { bufferGeometry: geom, hasValidData: true };
    } catch (error) {
      console.error('Error creating buffer geometry:', error);
      return { bufferGeometry: null, hasValidData: false };
    }
  }, [geometry]);

  if (!hasValidData || !bufferGeometry) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#666" wireframe />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow geometry={bufferGeometry}>
      <meshPhysicalMaterial 
        color={color}
        roughness={0.15}
        metalness={0.1}
        transparent
        opacity={opacity}
        clearcoat={0.2}
        clearcoatRoughness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default GeometryViewer;