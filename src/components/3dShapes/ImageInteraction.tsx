import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three'; // Import all of three to use Group and Object3D
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

// Define a type for selectable 3D objects (Mesh, Group, or base Object3D)
type SelectableObject = THREE.Mesh | THREE.Group | THREE.Object3D;


const ObjectInteractionApp: React.FC = () => {
  const { 
    selectedObject, 
    setSelectedObject, 
  } = useObjectStudio();
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [fitTrigger, setFitTrigger] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('Ready');
  const { objects, exportToSupabase } = useObjectStudio();
  
  // FIX: Change selectedMesh state to accept the broader SelectableObject type
  const [selectedMesh, setSelectedMesh] = useState<SelectableObject | null>(null);
  
  // Panel visibility states
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);

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

  // FIX: Update the mesh parameter type to match the SceneObject's onSelect signature.
  const handleObjectSelect = useCallback((objectId: string, mesh: SelectableObject | null) => {
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

  const togglePanel = (panelName: string) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  console.log(`✨ RENDER LOOP CHECK: Objects array length = ${objects.length}`);

  return (
    <div className="app">
      {/* Header Bar */}
      <div className="studio-header">
        <div className="studio-header-left">
          <img src="/curfdlogo.png" alt="CURFD" style={{ height: '32px', filter: 'brightness(1.2) contrast(1.1)' }} />
          <h1>CURFD AI Studio</h1>
        </div>
        <div className="studio-header-right">
          <button className="header-btn"><i className="fas fa-user"></i></button>
          <button className="header-btn"><i className="fas fa-times"></i></button>
        </div>
      </div>

      {/* Floating Dock Buttons */}
      <div className="dock-buttons">
        <div className="dock-buttons-left">
          <button 
            className={`dock-button ${openPanel === 'shapes' ? 'active' : ''}`}
            onClick={() => togglePanel('shapes')}
          >
            <i className="fas fa-cube"></i> Shapes
          </button>
          <button 
            className={`dock-button ${openPanel === 'ai' ? 'active' : ''}`}
            onClick={() => togglePanel('ai')}
          >
            <i className="fas fa-brain"></i> AI
          </button>
          <button 
            className={`dock-button ${openPanel === 'materials' ? 'active' : ''}`}
            onClick={() => togglePanel('materials')}
          >
            <i className="fas fa-palette"></i> Materials
          </button>
        </div>
        <div className="dock-buttons-right">
          <button 
            className={`dock-button ${openPanel === 'remediation' ? 'active' : ''}`}
            onClick={() => togglePanel('remediation')}
          >
            <i className="fas fa-tools"></i> Tools
          </button>
          <button 
            className={`dock-button ${openPanel === 'export' ? 'active' : ''}`}
            onClick={() => togglePanel('export')}
          >
            <i className="fas fa-download"></i> Export
          </button>
        </div>
      </div>

      {/* Collapsible Panels */}
      {openPanel === 'shapes' && (
        <div className="collapsible-panel left">
          <ShapeLibrary />
        </div>
      )}

      {openPanel === 'ai' && (
        <div className="collapsible-panel left">
          <AIShapeGenerator selectedObjectId={selectedObject} />
        </div>
      )}

      {openPanel === 'materials' && (
        <div className="collapsible-panel left">
          <MaterialLibrary />
          <AdvancedMaterialEditor />
        </div>
      )}

      {openPanel === 'remediation' && (
        <div className="collapsible-panel right">
          <ObjectRemediationPanel selectedObjectId={selectedObject} />
        </div>
      )}

      {openPanel === 'export' && (
        <div className="collapsible-panel right">
          <ExportPanel 
            selectedObject={selectedObject} 
            onExport={exportToSupabase}
          />
        </div>
      )}

      {/* 3D Viewport */}
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
          
          <color attach="background" args={['#0A0F29']} />
          
          <ambientLight intensity={1.0} /> 
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.5} 
            castShadow
          />
          <pointLight position={[0, 10, 0]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {gridVisible && <gridHelper args={[20, 20, '#666', '#333']} />}
          <axesHelper args={[3]} />
          
          {/* Scene Objects */}
          {objectsToRender.map((obj: MeshData, index) => {
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

      {/* Bottom Controls */}
      <div className="bottom-controls">
        <button 
          className={`bottom-control-btn ${transformMode === 'translate' ? 'active' : ''}`}
          onClick={() => setTransformMode('translate')}
        >
          Move
        </button>
        <button 
          className={`bottom-control-btn ${transformMode === 'rotate' ? 'active' : ''}`}
          onClick={() => setTransformMode('rotate')}
        >
          Rotate
        </button>
        <button 
          className={`bottom-control-btn ${transformMode === 'scale' ? 'active' : ''}`}
          onClick={() => setTransformMode('scale')}
        >
          Scale
        </button>
        <button 
          className={`bottom-control-btn ${gridVisible ? 'active' : ''}`}
          onClick={() => setGridVisible(!gridVisible)}
        >
          Grid: {gridVisible ? 'On' : 'Off'}
        </button>
        <button 
          className={`bottom-control-btn ${snapEnabled ? 'active' : ''}`}
          onClick={() => setSnapEnabled(!snapEnabled)}
        >
          Snap: {snapEnabled ? 'On' : 'Off'}
        </button>
        <button 
          className="bottom-control-btn"
          onClick={handleFitToFrame}
        >
          Frame
        </button>
      </div>
    </div>
  );
};

export default ObjectInteractionApp;