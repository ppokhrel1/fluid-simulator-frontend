// frontend/src/components/3dShapes/DebugObject.tsx
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const DebugObject: React.FC = () => {
  const meshRef = React.useRef<Mesh>(null);

  useFrame((state) => {
    // Rotate the debug object to show the scene is live
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 2, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#00ff00" /> {/* Bright green */}
    </mesh>
  );
};

export default DebugObject;