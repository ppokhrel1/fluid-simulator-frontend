import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { ThreeJSActions, AppState } from '../../types';
import { Canvas, useThree } from '@react-three/fiber';

interface ThreeJSCanvasProps {
  onStateUpdate: (updates: Partial<AppState>) => void;
  appState: AppState;
}

// Main Scene Component
const Scene: React.FC<{
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  currentFile: File | null;
  onModelLoaded: (controlsRef: React.MutableRefObject<any>) => void; // Update prop type
}> = ({ gridVisible, autoRotateEnabled, currentFile, onModelLoaded }) => {
  const controlsRef = useRef<any>(null);
  const modelRef = useRef<THREE.Group>(new THREE.Group());
  const { invalidate } = useThree(); // Use invalidate for explicit update

  // Notify parent of controlsRef on initial render
  React.useEffect(() => {
    onModelLoaded(controlsRef);
  }, [onModelLoaded]);

  // Auto-rotate effect
  React.useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotateEnabled;
      // Invalidate to make sure the change is picked up
      invalidate();
    }
  }, [autoRotateEnabled, invalidate]);

  // File loading effect
  React.useEffect(() => {
    if (!currentFile) return;

    let objectUrl: string | null = null;
    
    const loadModel = async () => {
      try {
        const fileExtension = currentFile.name.toLowerCase().split('.').pop();
        objectUrl = URL.createObjectURL(currentFile);
        
        let loadedModel: THREE.Object3D;

        switch (fileExtension) {
          case 'stl':
            const stlLoader = new STLLoader();
            const stlGeometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
              stlLoader.load(objectUrl!, resolve, undefined, reject);
            });
            loadedModel = new THREE.Mesh(
              stlGeometry,
              new THREE.MeshStandardMaterial({ 
                color: '#3b82f6',
                roughness: 0.3,
                metalness: 0.1 
              })
            );
            break;

          case 'obj':
            const objLoader = new OBJLoader();
            loadedModel = await new Promise<THREE.Group>((resolve, reject) => {
              objLoader.load(objectUrl!, resolve, undefined, reject);
            });
            // Ensure material is applied to all meshes in OBJ group
            loadedModel.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                // Ensure the material is a standard one for lighting
                child.material = new THREE.MeshStandardMaterial({ 
                  color: '#3b82f6',
                  roughness: 0.3,
                  metalness: 0.1 
                });
              }
            });
            break;

          case 'glb':
          case 'gltf':
            const gltfLoader = new GLTFLoader();
            const gltf = await new Promise<any>((resolve, reject) => {
              gltfLoader.load(objectUrl!, resolve, undefined, reject);
            });
            loadedModel = gltf.scene;
            break;

          default:
            throw new Error(`Unsupported file format: ${fileExtension}`);
        }

        // --- Model Replacement Logic ---
        modelRef.current.clear(); // 👈 Clears the previous model
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        loadedModel.position.sub(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        // Scale to fit within a fixed radius (e.g., 3 units) for consistent viewing
        const scale = 3 / (maxDim || 1); // Use || 1 to avoid division by zero
        loadedModel.scale.setScalar(scale);

        modelRef.current.add(loadedModel);
        
        // Reset camera view to frame the new model
        if (controlsRef.current) {
            controlsRef.current.reset(); // Initial reset for new model
        }

        // Call the prop to update the status
        onModelLoaded(controlsRef);
        
      } catch (error) {
        console.error('Error loading model:', error);
        alert(`Error loading model: ${error}`);
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      }
    };

    loadModel();
  }, [currentFile]); // Removed onModelLoaded from dependencies as it's a stable ref in the parent

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <hemisphereLight color={0x8888ff} groundColor={0x444444} intensity={0.6} />
      
      {/* Grid */}
      {gridVisible && (
        <Grid
          position={[0, -1, 0]}
          args={[20, 20]}
          cellSize={1}
          cellColor={0x444444}
          sectionSize={5}
          sectionColor={0x222222}
          fadeDistance={30}
        />
      )}
      
      {/* Model Group */}
      <group ref={modelRef} />
      
      {/* Orbit Controls - Full user control */}
      <OrbitControls
        ref={controlsRef} // 👈 controlsRef is used here
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={100}
        maxPolarAngle={Math.PI}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />
    </>
  );
};

const ThreeJSCanvas = forwardRef<ThreeJSActions, ThreeJSCanvasProps>(({ onStateUpdate, appState }, ref) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  // controlsRef is now managed here to ensure resetCamera works
  const controlsRef = useRef<any>(null); 

  // Function to save the OrbitControls ref from the Scene component
  const handleModelLoaded = (controlsRefFromScene: React.MutableRefObject<any>) => {
    controlsRef.current = controlsRefFromScene.current; // Save the ref for imperative handle
    if (currentFile) {
      onStateUpdate({ 
        status: `${currentFile.name} loaded - Analysis ready`
      });
    }
  };

  // Define loadFile function first so it can be used in processMessage
  const loadFile = (file: File) => {
    const validExtensions = ['.stl', '.obj', '.glb', '.gltf'];
    const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidFile) {
      alert('Please upload STL, OBJ, GLB, or GLTF files only.');
      return;
    }

    onStateUpdate({ status: `Loading ${file.name}...` });
    setCurrentFile(file); // 👈 Trigger Scene to load new model
  };

  useImperativeHandle(ref, () => ({
    loadFile,
    
    processMessage: (data: { message: string; file?: File }) => {
      if (data.file) {
        loadFile(data.file);
      }
      
      setTimeout(() => {
        const newChatMessage = {
          type: 'ai' as const,
          content: `Processed: "${data.message}"`,
          time: new Date().toLocaleTimeString()
        };

        onStateUpdate({
          chatMessages: [...appState.chatMessages, newChatMessage]
        });
      }, 1000);
    },
    
    resetCamera: () => { // 👈 Reset function
      if (controlsRef.current) {
        controlsRef.current.reset();
        // Optional: Provide visual feedback for a moment
        onStateUpdate({ status: 'Camera reset to initial view.' });
        setTimeout(() => {
            onStateUpdate({ status: currentFile ? `${currentFile.name} loaded - Analysis ready` : 'Ready for upload' });
        }, 1500);
      }
    },
    
    toggleGrid: () => {
      onStateUpdate({ gridVisible: !appState.gridVisible });
    },
    
    toggleAutoRotate: () => {
      onStateUpdate({ autoRotateEnabled: !appState.autoRotateEnabled });
    },
    
    takeScreenshot: () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `curfd_screenshot_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    },
  }));

  return (
    <Canvas
      shadows
      camera={{ 
        position: [5, 3, 5], 
        fov: 50,
        near: 0.1,
        far: 1000 
      }}
      gl={{ 
        antialias: true,
        alpha: true
      }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x0f172a);
      }}
    >
      <Scene
        gridVisible={appState.gridVisible}
        autoRotateEnabled={appState.autoRotateEnabled}
        currentFile={currentFile}
        onModelLoaded={handleModelLoaded}
      />
    </Canvas>
  );
});

ThreeJSCanvas.displayName = 'ThreeJSCanvas';
export default ThreeJSCanvas;