import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { OrbitControls, Grid, Html } from '@react-three/drei';
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

// 3D Pressure Marker Component
const PressureMarker: React.FC<{ 
  position: [number, number, number]; 
  pressure: number; 
  onRemove: () => void 
}> = ({ position, pressure, onRemove }) => {
  return (
    <group position={position}>
      {/* Small sphere at the point */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#9F7AEA" emissive="#6366F1" emissiveIntensity={0.5} />
      </mesh>
      
      {/* HTML label that follows the 3D position */}
      <Html
        position={[0, 0.15, 0]}
        center
        distanceFactor={2}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(159, 122, 234, 0.95), rgba(99, 102, 241, 0.95))',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            minWidth: 80,
            textAlign: 'center',
            position: 'relative',
            userSelect: 'none'
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>{pressure.toFixed(1)} kPa</div>
          <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>Pressure</div>
          <button
            onClick={onRemove}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.9)',
              border: '1px solid white',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>
      </Html>
    </group>
  );
};

// Main Scene Component (enhanced with hover/select + isolation)
const Scene: React.FC<{
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  currentFile: File | null;
  onModelLoaded: (info: { controlsRef: React.MutableRefObject<any>; isolatePart: (id: string) => void; clearIsolation: () => void; }) => void;
  onPartHover?: (info: { name: string; metadata: any; screen: { x: number; y: number } } | null) => void;
  onPartSelect?: (info: { name: string; metadata: any } | null) => void;
  onPressureClick?: (info: { pressure: number; worldPosition: [number, number, number] }) => void;
  pressureMarkers: Array<{ id: string; pressure: number; worldPosition: [number, number, number] }>;
  onRemoveMarker: (id: string) => void;
}> = ({ gridVisible, autoRotateEnabled, currentFile, onModelLoaded, onPartHover, onPartSelect, onPressureClick, pressureMarkers, onRemoveMarker }) => {
  const controlsRef = useRef<any>(null);
  const modelRef = useRef<THREE.Group>(new THREE.Group());
  const { invalidate, camera, gl, size } = useThree(); // Use invalidate for explicit update

  const prevHoverRef = useRef<THREE.Object3D | null>(null);
  const selectedRootRef = useRef<THREE.Object3D | null>(null);
  const modelBoundsRef = useRef<{ minY: number; maxY: number } | null>(null);

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
            
            // Compute bounding box for pressure distribution calculation
            stlGeometry.computeBoundingBox();
            
            // Store bounds for pressure calculation on click
            if (stlGeometry.boundingBox) {
              modelBoundsRef.current = {
                minY: stlGeometry.boundingBox.min.y,
                maxY: stlGeometry.boundingBox.max.y
              };
            }
            
            // Apply pressure distribution vertex colors
            const positions = stlGeometry.attributes.position;
            const colors = new Float32Array(positions.count * 3);
            
            // Calculate pressure based on Y-position (height) for demonstration
            // In a real scenario, this would come from CFD simulation data
            for (let i = 0; i < positions.count; i++) {
              const y = positions.getY(i);
              
              // Normalize Y position to 0-1 range
              const minY = stlGeometry.boundingBox?.min.y ?? -1;
              const maxY = stlGeometry.boundingBox?.max.y ?? 1;
              const normalizedY = (y - minY) / (maxY - minY);
              
              // Create gradient from green (low) to yellow (mid) to red (high)
              const color = new THREE.Color();
              if (normalizedY < 0.5) {
                // Green to Yellow
                color.setRGB(
                  normalizedY * 2,  // R: 0 to 1
                  1,                 // G: 1
                  0                  // B: 0
                );
              } else {
                // Yellow to Red
                color.setRGB(
                  1,                        // R: 1
                  1 - (normalizedY - 0.5) * 2,  // G: 1 to 0
                  0                         // B: 0
                );
              }
              
              colors[i * 3] = color.r;
              colors[i * 3 + 1] = color.g;
              colors[i * 3 + 2] = color.b;
            }
            
            stlGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            loadedModel = new THREE.Mesh(
              stlGeometry,
              new THREE.MeshStandardMaterial({ 
                vertexColors: true,
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
            // Apply pressure distribution to all meshes in OBJ group
            loadedModel.traverse((child) => {
              if (child instanceof THREE.Mesh && child.geometry) {
                const geometry = child.geometry;
                
                // Compute bounding box if not already computed
                if (!geometry.boundingBox) {
                  geometry.computeBoundingBox();
                }
                
                // Store bounds for pressure calculation on click (use first mesh bounds)
                if (!modelBoundsRef.current && geometry.boundingBox) {
                  modelBoundsRef.current = {
                    minY: geometry.boundingBox.min.y,
                    maxY: geometry.boundingBox.max.y
                  };
                }
                
                const positions = geometry.attributes.position;
                const colors = new Float32Array(positions.count * 3);
                
                // Calculate pressure based on Y-position
                for (let i = 0; i < positions.count; i++) {
                  const y = positions.getY(i);
                  
                  const minY = geometry.boundingBox?.min.y ?? -1;
                  const maxY = geometry.boundingBox?.max.y ?? 1;
                  const normalizedY = (y - minY) / (maxY - minY);
                  
                  // Create gradient from green (low) to yellow (mid) to red (high)
                  const color = new THREE.Color();
                  if (normalizedY < 0.5) {
                    color.setRGB(normalizedY * 2, 1, 0);
                  } else {
                    color.setRGB(1, 1 - (normalizedY - 0.5) * 2, 0);
                  }
                  
                  colors[i * 3] = color.r;
                  colors[i * 3 + 1] = color.g;
                  colors[i * 3 + 2] = color.b;
                }
                
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                
                child.material = new THREE.MeshStandardMaterial({ 
                  vertexColors: true,
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
        
        // Add model to scene first
        modelRef.current.add(loadedModel);
        
        // Calculate bounding box from the entire model group
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Center the entire model group at the origin
        modelRef.current.position.set(-center.x, -center.y, -center.z);
        
        // Scale to fit within viewport (3 units)
        const targetSize = 3;
        const scale = targetSize / (maxDim || 1);
        modelRef.current.scale.setScalar(scale);

        // Position camera to view the centered and scaled model
        if (controlsRef.current && controlsRef.current.object) {
          const cam = controlsRef.current.object;
          const distance = targetSize * 2.5;
          
          // Set camera position
          cam.position.set(distance, distance * 0.6, distance);
          cam.lookAt(0, 0, 0);
          
          // Reset orbit controls target to origin
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        } else if (controlsRef.current) {
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

    // Disabled hover functionality - removed metadata tooltip
    /*
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
    */

    const handleClick = (e: PointerEvent) => {
      if (!modelRef.current) return;
      const rect = dom.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(modelRef.current.children, true);
      if (intersects.length) {
        const intersection = intersects[0];
        const obj = intersection.object;
        
        // Calculate pressure value at clicked point
        if (modelBoundsRef.current && intersection.point) {
          const y = intersection.point.y;
          const { minY, maxY } = modelBoundsRef.current;
          const normalizedY = (y - minY) / (maxY - minY);
          
          // Convert normalized value (0-1) to pressure (0-100 kPa)
          const pressure = normalizedY * 100;
          
          // Use the 3D world position of the intersection point
          const worldPos: [number, number, number] = [
            intersection.point.x,
            intersection.point.y,
            intersection.point.z
          ];
          
          // Call parent handler to add pressure marker
          if (onPressureClick) {
            onPressureClick({
              pressure: pressure,
              worldPosition: worldPos
            });
          }
        }
        
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

    // Only listen for click events, not hover
    dom.addEventListener('pointerdown', handleClick);
    return () => {
      dom.removeEventListener('pointerdown', handleClick);
    };
  }, [gl, camera, onPartSelect, onPressureClick]);

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
      
      {/* Pressure Markers in 3D space */}
      {pressureMarkers.map((marker) => (
        <PressureMarker
          key={marker.id}
          position={marker.worldPosition}
          pressure={marker.pressure}
          onRemove={() => onRemoveMarker(marker.id)}
        />
      ))}
      
      {/* Orbit Controls - Improved for better UX */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={50}
        maxPolarAngle={Math.PI}
        zoomSpeed={1.2}
        rotateSpeed={0.8}
        panSpeed={0.8}
        screenSpacePanning={false}
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
  const [pressureMarkers, setPressureMarkers] = useState<Array<{ id: string; pressure: number; worldPosition: [number, number, number] }>>([]);

  // Handle pressure click to add marker
  const handlePressureClick = (info: { pressure: number; worldPosition: [number, number, number] }) => {
    const newMarker = {
      id: `marker-${Date.now()}`,
      pressure: info.pressure,
      worldPosition: info.worldPosition
    };
    setPressureMarkers(prev => [...prev, newMarker]);
  };

  // Function to remove a specific marker
  const removeMarker = (id: string) => {
    setPressureMarkers(prev => prev.filter(m => m.id !== id));
  };

  // Function to clear all markers
  const clearAllMarkers = () => {
    setPressureMarkers([]);
  };

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
          onPressureClick={handlePressureClick}
          pressureMarkers={pressureMarkers}
          onRemoveMarker={removeMarker}
        />
      </Canvas>

      {/* Hover tooltip disabled - metadata removed */}

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

      {/* Clear all markers button - only show when markers exist */}
      {pressureMarkers.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          top: 12, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 2000 
        }}>
          <button
            className="btn btn-sm"
            onClick={clearAllMarkers}
            style={{
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: 600,
              fontSize: 12,
              padding: '6px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              borderRadius: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            Clear All Markers ({pressureMarkers.length})
          </button>
        </div>
      )}
    </div>
  );
});

ThreeJSCanvas.displayName = 'ThreeJSCanvas';
export default ThreeJSCanvas;