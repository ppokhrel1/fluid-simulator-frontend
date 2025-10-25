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

// Main Scene Component (enhanced with hover/select + isolation)
const Scene: React.FC<{
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  currentFile: File | null;
  onModelLoaded: (info: { controlsRef: React.MutableRefObject<any>; isolatePart: (id: string) => void; clearIsolation: () => void; }) => void;
  onPartHover?: (info: { name: string; metadata: any; screen: { x: number; y: number } } | null) => void;
  onPartSelect?: (info: { name: string; metadata: any } | null) => void;
}> = ({ gridVisible, autoRotateEnabled, currentFile, onModelLoaded, onPartHover, onPartSelect }) => {
  const controlsRef = useRef<any>(null);
  const modelRef = useRef<THREE.Group>(new THREE.Group());
  const { invalidate, camera, gl, size } = useThree(); // Use invalidate for explicit update

  const prevHoverRef = useRef<THREE.Object3D | null>(null);
  const selectedRootRef = useRef<THREE.Object3D | null>(null);

  // Helper to find ancestor mesh
  const findAncestorMesh = (obj: THREE.Object3D | null) => {
    let cur = obj;
    while (cur && cur.type !== 'Mesh') cur = cur.parent as THREE.Object3D | null;
    return cur as THREE.Mesh | null;
  };

  // Notify parent of controlsRef and provide isolate helpers
  React.useEffect(() => {
    const isolatePart = (id: string) => {
      if (!modelRef.current) return;
      // find node by name or uuid
      let target: THREE.Object3D | undefined;
      modelRef.current.traverse((c) => {
        if ((c.name && c.name === id) || c.uuid === id) target = c;
      });

      if (target) {
        // find top-level child that contains target
        let root: THREE.Object3D | null = target;
        while (root && root.parent !== modelRef.current) root = root.parent as THREE.Object3D | null;
        modelRef.current.children.forEach((c) => {
          c.visible = c === root;
        });
      }
    };

    const clearIsolation = () => {
      if (!modelRef.current) return;
      modelRef.current.traverse((c) => (c.visible = true));
    };

    onModelLoaded({ controlsRef, isolatePart, clearIsolation });
  }, [onModelLoaded]);

  // Auto-rotate effect
  React.useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotateEnabled;
      // Invalidate to make sure the change is picked up
      invalidate();
    }
  }, [autoRotateEnabled, invalidate]);

  // File loading effect (same as before)
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
        
        // Reset camera view to frame the new model.
        // Compute bounding sphere and place camera so the model is centered and fits nicely.
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        const radius = (sphere.radius || maxDim / 2) * scale;

        if (controlsRef.current && controlsRef.current.object) {
          const cam = controlsRef.current.object; // camera
          const offset = Math.max(3, radius * 2.2);
          // Position the camera at an offset along x/z and slightly above the model
          cam.position.set(offset, Math.max(radius * 0.8, 1) + offset * 0.05, offset);
          cam.lookAt(0, 0, 0);
          // Ensure OrbitControls target is centered on the model
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        } else if (controlsRef.current) {
          // Fallback to default reset when controls exist but no camera reference
          controlsRef.current.reset();
        }

        // Call the prop to update the status
        onModelLoaded({ controlsRef, isolatePart: (id: string) => {}, clearIsolation: () => {} });
        
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

  // Hover & click interactivity (raycast)
  React.useEffect(() => {
    const dom = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleMove = (e: PointerEvent) => {
      if (!modelRef.current) return;
      const rect = dom.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(modelRef.current.children, true);
      if (intersects.length) {
        const obj = intersects[0].object;
        const mesh = findAncestorMesh(obj);
        if (mesh) {
          // compute screen position of mesh centroid
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          const ndc = worldPos.clone().project(camera);
          const x = (ndc.x + 1) / 2 * rect.width + rect.left;
          const y = (-ndc.y + 1) / 2 * rect.height + rect.top;

          // highlight
          if (prevHoverRef.current !== mesh) {
            // restore previous
            if (prevHoverRef.current && (prevHoverRef.current as any).material) {
              const m = (prevHoverRef.current as any).material;
              if ((prevHoverRef.current as any).userData && (prevHoverRef.current as any).userData._origEmissive) {
                m.emissive = (prevHoverRef.current as any).userData._origEmissive;
              }
            }

            // store orig emissive and set highlight
            if ((mesh as any).material) {
              const mm = (mesh as any).material;
              (mesh as any).userData._origEmissive = mm.emissive ? mm.emissive.clone() : new THREE.Color(0x000000);
              try { mm.emissive = new THREE.Color(0x9F7AEA); } catch (err) {}
            }
            prevHoverRef.current = mesh;
          }

          onPartHover && onPartHover({ name: mesh.name || mesh.uuid, metadata: mesh.userData || {}, screen: { x, y } });
          return;
        }
      }

      // no hit
      if (prevHoverRef.current && (prevHoverRef.current as any).material) {
        const m = (prevHoverRef.current as any).material;
        if ((prevHoverRef.current as any).userData && (prevHoverRef.current as any).userData._origEmissive) {
          m.emissive = (prevHoverRef.current as any).userData._origEmissive;
        }
      }
      prevHoverRef.current = null;
      onPartHover && onPartHover(null);
    };

    const handleClick = (e: PointerEvent) => {
      if (!modelRef.current) return;
      const rect = dom.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(modelRef.current.children, true);
      if (intersects.length) {
        const obj = intersects[0].object;
        const mesh = findAncestorMesh(obj);
        if (mesh) {
          // find top-level child containing this mesh
          let root: THREE.Object3D | null = mesh;
          while (root && root.parent !== modelRef.current) root = root.parent as THREE.Object3D | null;
          if (root) {
            // hide other children
            modelRef.current.children.forEach((c) => (c.visible = c === root));
            selectedRootRef.current = root;
            onPartSelect && onPartSelect({ name: mesh.name || mesh.uuid, metadata: mesh.userData || {} });
            return;
          }
        }
      }

      // clicked empty space -> clear selection
      modelRef.current.children.forEach((c) => (c.visible = true));
      selectedRootRef.current = null;
      onPartSelect && onPartSelect(null);
    };

    dom.addEventListener('pointermove', handleMove);
    dom.addEventListener('pointerdown', handleClick);
    return () => {
      dom.removeEventListener('pointermove', handleMove);
      dom.removeEventListener('pointerdown', handleClick);
    };
  }, [gl, camera, onPartHover, onPartSelect]);

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
  const isolateFnRef = useRef<((id: string) => void) | null>(null);
  const clearIsoRef = useRef<(() => void) | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ name: string; metadata: any; screen: { x: number; y: number } } | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<{ name: string; metadata: any } | null>(null);

  // Function to save the OrbitControls ref and helper functions from the Scene component
  const handleModelLoaded = (info: any) => {
    if (info?.controlsRef) controlsRef.current = info.controlsRef.current;
    if (info?.isolatePart) isolateFnRef.current = info.isolatePart;
    if (info?.clearIsolation) clearIsoRef.current = info.clearIsolation;

    if (currentFile) {
      onStateUpdate({ status: `${currentFile.name} loaded - Analysis ready` });
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
    // isolate a part by name or uuid
    isolatePart: (id: string) => {
      if (isolateFnRef.current) isolateFnRef.current(id);
    },

    clearIsolation: () => {
      if (clearIsoRef.current) clearIsoRef.current();
    },
  }));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x0f172a);
        }}
      >
        <Scene
          gridVisible={appState.gridVisible}
          autoRotateEnabled={appState.autoRotateEnabled}
          currentFile={currentFile}
          onModelLoaded={handleModelLoaded}
          onPartHover={(info) => setHoverInfo(info)}
          onPartSelect={(info) => setSelectedInfo(info)}
        />
      </Canvas>

      {/* Hover tooltip (HTML overlay) */}
      {hoverInfo && (
        <div
          className="three-tooltip"
          style={{
            position: 'absolute',
            left: Math.max(8, hoverInfo.screen.x) + 'px',
            top: Math.max(8, hoverInfo.screen.y) + 'px',
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none',
            zIndex: 2000
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: 12, maxWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{hoverInfo.name}</div>
            {hoverInfo.metadata && Object.keys(hoverInfo.metadata).length > 0 && (
              <div style={{ fontSize: 11, opacity: 0.9 }}>{JSON.stringify(hoverInfo.metadata)}</div>
            )}
          </div>
        </div>
      )}

      {/* Selected part panel */}
      {selectedInfo && (
        <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 2000 }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px 12px', borderRadius: 8, minWidth: 200 }}>
            <div style={{ fontWeight: 700 }}>{selectedInfo.name}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>{Object.keys(selectedInfo.metadata || {}).length ? JSON.stringify(selectedInfo.metadata) : 'No metadata'}</div>
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm btn-light" onClick={() => { if (clearIsoRef.current) { clearIsoRef.current(); setSelectedInfo(null); } }}>
                Clear Isolation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ThreeJSCanvas.displayName = 'ThreeJSCanvas';
export default ThreeJSCanvas;