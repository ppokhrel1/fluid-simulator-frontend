// frontend/src/components/3dShapes/ImageInteraction.tsx (Final Version with Material Components)
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import type { Mesh } from 'three';
import ShapeLibrary from './ShapeLibrary';
import AIShapeGenerator from './AIShapeGenerator';
import ExportPanel from './ExportPanel';
import { useObjectStudio } from '~/hooks/useObjectStudio';
import SceneObject from './SceneObject';
import './ObjectStudio.css';
import AutoFit from './AutoFit';
import DebugObject from './DebugObject';
import type { MeshData } from '~/types/3dshapes';
import MaterialLibrary from './MaterialLibrary'; // Add this import
import AdvancedMaterialEditor from './AdvancedMaterialEditor'; // Add this import
import ObjectRemediationPanel from './ObjectRemediationPanel';

const ObjectInteractionApp: React.FC = () => {
  const { 
    selectedObject, 
    setSelectedObject, 
  } = useObjectStudio();
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [fitTrigger, setFitTrigger] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('Ready');
  const { objects, exportToSupabase } = useObjectStudio();
  
  const [selectedMesh, setSelectedMesh] = useState<Mesh | null>(null);

  // --- TEMPORARY MOCK LOGIC START ---
  const mockObjects: MeshData[] = objects.length > 0 ? objects : [{
      id: 'mock-cube',
      type: 'cube',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      parameters: { size: 4.0 },
      material: { // Add default material for mock object
        color: '#ff6b6b',
        metalness: 0.2,
        roughness: 0.6
      }
  }] as any;

  const objectsToRender = objects.length > 0 ? objects : mockObjects;
  // --- TEMPORARY MOCK LOGIC END ---

  const handleObjectSelect = useCallback((objectId: string, mesh: Mesh | null) => {
    console.log(`🎯 Object selected: ${objectId}`, { meshExists: !!mesh });
    setSelectedObject(objectId);
    setSelectedMesh(mesh);
    setDebugInfo(`Selected: ${objectId}`);
  }, []);

  useEffect(() => {
    if (objects.length > 0) { 
      console.log(`🔄 Objects changed, triggering fit. Count: ${objects.length}`);
      console.log("objects array:", objects);
      setFitTrigger(prev => prev + 1);
      setDebugInfo(`Objects: ${objects.length}`);
    }
  }, [objects.length]);

  const handleFitToFrame = () => {
    console.log('🎯 Manual fit to frame triggered');
    setFitTrigger(prev => prev + 1);
    setDebugInfo('Manual fit triggered');
  };

  console.log(`✨ RENDER LOOP CHECK: Objects array length = ${objects.length}`);

  return (
    <div className="app">
      <div className="sidebar">
        <ShapeLibrary />
        <AIShapeGenerator selectedObjectId={selectedObject} />
        
        {/* ADD MATERIAL COMPONENTS HERE */}
        <MaterialLibrary />
        <AdvancedMaterialEditor />
        
        <div className="tool-panel">
          <h3>View Controls</h3>
          <button onClick={handleFitToFrame} className="fit-button">
            Fit to Frame
          </button>
          
          <div className="debug-info" style={{ 
            background: '#2d3748', 
            padding: '10px', 
            borderRadius: '4px', 
            margin: '10px 0',
            fontSize: '0.8em',
            color: '#90cdf4'
          }}>
            <strong>Debug Info:</strong>
            <div>{debugInfo}</div>
            <div>Objects: {objects.length}</div>
            <div>Selected: {selectedObject || 'None'}</div>
          </div>

          <h4>Transform Tools</h4>
          <div className="tool-buttons">
            <button 
              className={transformMode === 'translate' ? 'active' : ''}
              onClick={() => setTransformMode('translate')}
            >
              Move
            </button>
            <button 
              className={transformMode === 'rotate' ? 'active' : ''}
              onClick={() => setTransformMode('rotate')}
            >
              Rotate
            </button>
            <button 
              className={transformMode === 'scale' ? 'active' : ''}
              onClick={() => setTransformMode('scale')}
            >
              Scale
            </button>
          </div>
        </div>
      </div>

      <div className="viewport">
        <Canvas 
          camera={{ 
            position: [5, 5, 5], 
            fov: 50,
            near: 0.1,
            far: 1000 
          }}
          onCreated={({ gl, scene, camera }) => {
            console.log('🎨 Canvas created:', { scene, camera });
            setDebugInfo('Canvas ready');
          }}
        >
          <AutoFit objects={objects} triggerFit={fitTrigger} /> 
          
          <DebugObject />
          
          <color attach="background" args={['#1a1a1a']} />
          
          <ambientLight intensity={1.0} /> 
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.5} 
            castShadow
          />
          <pointLight position={[0, 10, 0]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <gridHelper args={[20, 20, '#666', '#333']} />
          <axesHelper args={[3]} />
          
          {/* Scene Objects */}
          {objectsToRender.map((obj: MeshData, index) => {
            console.log(`⚠️ Mapping object ${index}: type=${obj.type}, id=${obj.id}`);
            return (
              <SceneObject
                key={obj.id}
                object={obj}
                isSelected={selectedObject === obj.id}
                onSelect={handleObjectSelect}
                showTransformControls={selectedObject === obj.id && transformMode !== 'translate'}
                transformMode={transformMode} 
              />
            );
          })}
          
          <OrbitControls 
            makeDefault 
            enableDamping
            dampingFactor={0.05}
            onChange={() => setDebugInfo('Camera moving')}
          />
        </Canvas>
      </div>
      <div className="sidebar">
      <ObjectRemediationPanel selectedObjectId={selectedObject} />
      <ExportPanel 
        selectedObject={selectedObject} 
        onExport={exportToSupabase}
      />
      </div>
    </div>
  );
};

export default ObjectInteractionApp;