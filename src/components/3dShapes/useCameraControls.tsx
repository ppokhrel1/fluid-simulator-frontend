// frontend/src/components/3dShapes/CameraController.tsx
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3, Box3, PerspectiveCamera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControllerProps {
  objects: any[];
  triggerFit: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({ objects, triggerFit }) => {
  const { camera, controls } = useThree();
  const fitToFrameExecuted = useRef(false);

  const fitCameraToScene = () => {
    if (objects.length === 0) return;

    const box = new Box3();
    
    // Calculate bounding box of all objects
    objects.forEach(obj => {
      const tempBox = new Box3();
      
      // Estimate object size based on position and typical primitive sizes
      const size = obj.parameters?.size || obj.parameters?.radius || 1;
      const min = new Vector3(
        obj.position[0] - size,
        obj.position[1] - size, 
        obj.position[2] - size
      );
      const max = new Vector3(
        obj.position[0] + size,
        obj.position[1] + size,
        obj.position[2] + size
      );
      
      tempBox.set(min, max);
      box.union(tempBox);
    });

    if (box.isEmpty()) return;

    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Handle both Perspective and Orthographic cameras
    let distance = 5; // fallback distance
    
    if (camera instanceof PerspectiveCamera) {
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      distance = cameraDistance * 1.5; // Add padding
    } else {
      // For orthographic cameras, use a fixed distance based on object size
      distance = maxDim * 2;
    }

    // Position camera
    const direction = new Vector3(1, 1, 1).normalize();
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    camera.lookAt(center);

    // Update orbit controls with proper typing
    if (controls && 'target' in controls) {
      const orbitControls = controls as OrbitControlsImpl;
      orbitControls.target.copy(center);
      orbitControls.update();
    }

    fitToFrameExecuted.current = true;
  };

  useEffect(() => {
    if (objects.length > 0 && !fitToFrameExecuted.current) {
      // Small delay to ensure objects are rendered
      setTimeout(() => {
        fitCameraToScene();
      }, 100);
    }
  }, [objects.length]);

  useEffect(() => {
    if (triggerFit) {
      fitCameraToScene();
    }
  }, [triggerFit]);

  return null; // This component doesn't render anything
};

export default CameraController;