// frontend/src/components/3dShapes/AutoFit.tsx
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3, Box3 } from 'three';

interface AutoFitProps {
  objects: any[];
  triggerFit: number;
}

const AutoFit: React.FC<AutoFitProps> = ({ objects, triggerFit }) => {
  const { camera, controls } = useThree();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (objects.length === 0) return;

    const timer = setTimeout(() => {
      try {
        console.log('🔍 AutoFit triggered, objects count:', objects.length);
        
        // Calculate bounds of all objects with proper scaling
        const box = new Box3();
        
        objects.forEach(obj => {
          // Scale up positions to match our 4x scaling
          const scaledPos = new Vector3(
            obj.position[0] * 4,
            obj.position[1] * 4,
            obj.position[2] * 4
          );
          
          // Estimate size based on object type and scaling
          let size = 4; // Default size for our 4x scaled objects
          if (obj.type === 'sphere') size = 8; // Spheres are larger
          if (obj.type === 'cube') size = 8;
          
          const min = new Vector3(
            scaledPos.x - size,
            scaledPos.y - size,
            scaledPos.z - size
          );
          const max = new Vector3(
            scaledPos.x + size,
            scaledPos.y + size,
            scaledPos.z + size
          );
          
          const objBox = new Box3(min, max);
          box.union(objBox);
        });

        // Also include the debug object in calculations
        const debugBox = new Box3(
          new Vector3(-1, 1, -1),
          new Vector3(1, 3, 1)
        );
        box.union(debugBox);

        if (box.isEmpty()) return;

        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        console.log('🎯 AutoFit calculations:', { 
          center, 
          size, 
          maxDim,
          bounds: box
        });

        // Set camera position with padding - closer for better visibility
        const cameraDistance = Math.max(maxDim * 1.2, 10);
        camera.position.set(
          center.x + cameraDistance,
          center.y + cameraDistance * 0.7, // Lower angle for better view
          center.z + cameraDistance
        );
        camera.lookAt(center);

        // Update controls
        if (controls && (controls as any).target && (controls as any).update) {
          (controls as any).target.copy(center);
          (controls as any).update();
          console.log('✅ Camera and controls updated');
        }

        hasFitted.current = true;
      } catch (error) {
        console.error('❌ AutoFit error:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [objects.length, triggerFit, camera, controls]);

  return null;
};

export default AutoFit;