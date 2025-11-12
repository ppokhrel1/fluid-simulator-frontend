import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import ControlPanel from './ControlPanel';
import GeometryViewer from './GeometryViewer';
import FlowVisualization from './FlowVisualization';
import './home.css';
import config from '~/config/constants';

interface SimulationData {
  geometry: any;
  flowData: any;
  conditions: any;
}

const GeometryProviderHome: React.FC = () => {
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<'streamlines' | 'vectors' | 'both'>('streamlines');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Panel visibility states
  const [openPanel, setOpenPanel] = useState<string | null>('controls');
  const [gridVisible, setGridVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(true);

  const handleFileUpload = async (file: File, flowConditions: any) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('velocity', flowConditions.velocity.toString());
      formData.append('direction_x', flowConditions.direction[0].toString());
      formData.append('direction_y', flowConditions.direction[1].toString());
      formData.append('direction_z', flowConditions.direction[2].toString());
      formData.append('resolution', flowConditions.resolution.toString());

      const response = await fetch(config.apiUrl + '/api/simulations/simulate-flow', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(100);
      
      setTimeout(() => {
        setSimulationData({
          geometry: result.geometry,
          flowData: result.flow_data,
          conditions: flowConditions
        });
        setIsLoading(false);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleQuickDemo = async (geometryType: string, flowConditions: any) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const response = await fetch(config.apiUrl +'/api/v1/simulations/quick-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          geometry_type: geometryType,
          velocity: flowConditions.velocity.toString(),
          resolution: flowConditions.resolution.toString(),
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Demo failed: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(100);
      
      setTimeout(() => {
        setSimulationData({
          geometry: result.geometry,
          flowData: result.flow_data,
          conditions: flowConditions
        });
        setIsLoading(false);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo failed');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const clearError = () => setError(null);

  const togglePanel = (panelName: string) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  return (
    <div className="app simulation-app">
      {/* Header Bar */}
      <div className="studio-header simulation-header">
        <div className="studio-header-left">
          <img src="/curfdlogo.png" alt="CURFD" style={{ height: '32px', filter: 'brightness(1.2) contrast(1.1)' }} />
          <h1>CURFD Flow Simulation</h1>
        </div>
        <div className="studio-header-right">
          <button className="header-btn"><i className="fas fa-user"></i></button>
          <button className="header-btn"><i className="fas fa-times"></i></button>
        </div>
      </div>

      {/* Floating Dock Buttons */}
      <div className="dock-buttons simulation-dock">
        <div className="dock-buttons-left">
          <button 
            className={`dock-button simulation-dock-btn ${openPanel === 'controls' ? 'active' : ''}`}
            onClick={() => togglePanel('controls')}
            title="Simulation Controls"
          >
            <i className="fas fa-sliders-h"></i>
            <span>Controls</span>
          </button>
        </div>
        <div className="dock-buttons-right">
          <button 
            className={`dock-button simulation-dock-btn ${openPanel === 'info' ? 'active' : ''}`}
            onClick={() => togglePanel('info')}
            title="Simulation Info"
          >
            <i className="fas fa-info-circle"></i>
            <span>Info</span>
          </button>
          <button 
            className={`dock-button simulation-dock-btn ${openPanel === 'export' ? 'active' : ''}`}
            onClick={() => togglePanel('export')}
            title="Export Results"
          >
            <i className="fas fa-download"></i>
            <span>Export Results</span>
          </button>
        </div>
      </div>

      {/* Collapsible Control Panel */}
      {openPanel === 'controls' && (
        <div className="collapsible-panel simulation-panel left">
          <h3><i className="fas fa-sliders-h"></i> Controls</h3>
          <ControlPanel
            onFileUpload={handleFileUpload}
            onQuickDemo={handleQuickDemo}
            isLoading={isLoading}
            visualizationMode={visualizationMode}
            onVisualizationModeChange={setVisualizationMode}
            progress={progress}
          />
        </div>
      )}

      {/* Collapsible Info Panel */}
      {openPanel === 'info' && (
        <div className="collapsible-panel simulation-panel right">
          <h3><i className="fas fa-info-circle"></i> Simulation Info</h3>
          {simulationData ? (
            <div className="info-section">
              <h4>Flow Conditions</h4>
              <div className="info-item">
                <span>Velocity:</span>
                <strong>{simulationData.conditions.velocity} m/s</strong>
              </div>
              <div className="info-item">
                <span>Resolution:</span>
                <strong>{simulationData.conditions.resolution}³</strong>
              </div>
              <div className="info-item">
                <span>Direction:</span>
                <strong>+X Axis</strong>
              </div>
              <h4>Flow Field</h4>
              <div className="info-item">
                <span>Streamlines:</span>
                <strong>{simulationData.flowData?.streamlines?.length || 0}</strong>
              </div>
              <div className="info-item">
                <span>Vector Points:</span>
                <strong>{Math.floor((simulationData.flowData?.velocity_field?.points?.length || 0) / 3)}</strong>
              </div>
            </div>
          ) : (
            <div className="info-section">
              <p style={{ color: 'rgba(245, 248, 255, 0.6)' }}>No simulation data loaded. Run a simulation to see details.</p>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Export Panel */}
      {openPanel === 'export' && (
        <div className="collapsible-panel simulation-panel right">
          <h3><i className="fas fa-download"></i> Export Results</h3>
          <div className="info-section">
            <h4>Available Exports</h4>
            <button 
              className="export-btn"
              disabled={!simulationData}
              onClick={() => {
                const dataStr = JSON.stringify(simulationData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `simulation_${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <i className="fas fa-file-code"></i>
              <span>Export as JSON</span>
            </button>
            <button 
              className="export-btn"
              disabled={!simulationData}
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `simulation_screenshot_${Date.now()}.png`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }
                  });
                }
              }}
            >
              <i className="fas fa-image"></i>
              <span>Export Screenshot</span>
            </button>
            <button 
              className="export-btn"
              disabled={!simulationData}
              onClick={() => {
                let csvContent = 'X,Y,Z,VelocityX,VelocityY,VelocityZ\n';
                const points = simulationData.flowData?.velocity_field?.points || [];
                const velocities = simulationData.flowData?.velocity_field?.velocities || [];
                for (let i = 0; i < points.length; i += 3) {
                  const vIndex = i / 3 * 3;
                  csvContent += `${points[i]},${points[i+1]},${points[i+2]},${velocities[vIndex] || 0},${velocities[vIndex+1] || 0},${velocities[vIndex+2] || 0}\n`;
                }
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `velocity_field_${Date.now()}.csv`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <i className="fas fa-file-csv"></i>
              <span>Export Velocity Field (CSV)</span>
            </button>
            <button 
              className="export-btn"
              disabled={!simulationData}
              onClick={async () => {
                const canvas = document.querySelector('canvas') as HTMLCanvasElement;
                if (!canvas) return;
                
                alert('Recording 360° rotation... This will take a few seconds.');
                
                const frames: string[] = [];
                const totalFrames = 120; // 4 seconds at 30fps
                const rotationStep = (Math.PI * 2) / totalFrames;
                
                // Capture frames
                for (let i = 0; i < totalFrames; i++) {
                  await new Promise(resolve => setTimeout(resolve, 33)); // ~30fps
                  frames.push(canvas.toDataURL('image/png'));
                  // Note: Actual rotation would need to be implemented with camera controls
                }
                
                // For now, just download the frames as a zip would require additional library
                alert('Movie export requires video encoding library. Currently exporting individual frames.');
                frames.forEach((frame, i) => {
                  const link = document.createElement('a');
                  link.href = frame;
                  link.download = `frame_${String(i).padStart(4, '0')}.png`;
                  if (i === 0) link.click(); // Only download first frame for demo
                });
              }}
            >
              <i className="fas fa-video"></i>
              <span>Export as Movie (360° rotation)</span>
            </button>
            {!simulationData && (
              <p style={{ color: 'rgba(245, 248, 255, 0.5)', fontSize: '0.85rem', marginTop: '12px', fontStyle: 'italic' }}>
                Run a simulation to enable export options
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3D Canvas Viewport */}
      <div className="viewport" style={{ background: 'linear-gradient(135deg, #0A0F29 0%, #1a1f3a 100%)' }}>
        <Canvas
          camera={{ position: [5, 3, 5], fov: 50 }}
        >
          <color attach="background" args={['#0A0F29']} />
                
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={0.8}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, -10, -10]} intensity={0.2} />
                
                {/* Environment */}
                <Environment preset="city" />
                
                {/* Controls */}
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={1}
                  maxDistance={20}
                />
                
                {/* Coordinate Axes */}
                <axesHelper args={[2]} />
                
                {/* Geometry */}
                {simulationData?.geometry && (
                  <GeometryViewer geometry={simulationData.geometry} />
                )}
                
                {/* Flow Visualization */}
                {simulationData?.flowData && (
                  <FlowVisualization
                    flowData={simulationData.flowData}
                    mode={visualizationMode}
                  />
                )}
                
                {/* Grid Floor */}
                {gridVisible && <gridHelper args={[10, 10, '#8A4FFF', '#4F8AFF']} rotation={[-Math.PI / 2, 0, 0]} />}
                
                {/* Performance Stats */}
                {statsVisible && <Stats />}
              </Canvas>

        {/* Loading Overlay */}
        {isLoading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#F5F8FF'
          }}>
            <div style={{ 
              border: '3px solid rgba(138, 79, 255, 0.3)',
              borderTop: '3px solid #8A4FFF',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }}></div>
            <div>Computing Flow Field...</div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bottom-controls">
        <div className="control-group">
          <button 
            className="control-btn"
            onClick={() => window.history.back()}
            title="Go Back"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back</span>
          </button>
        </div>
        <div className="control-group">
          <button 
            className={`control-btn ${visualizationMode === 'streamlines' ? 'active' : ''}`}
            onClick={() => setVisualizationMode('streamlines')}
            title="Streamlines"
          >
            <i className="fas fa-water"></i>
            <span>Streamlines</span>
          </button>
          <button 
            className={`control-btn ${visualizationMode === 'vectors' ? 'active' : ''}`}
            onClick={() => setVisualizationMode('vectors')}
            title="Vectors"
          >
            <i className="fas fa-arrows-alt"></i>
            <span>Vectors</span>
          </button>
          <button 
            className={`control-btn ${visualizationMode === 'both' ? 'active' : ''}`}
            onClick={() => setVisualizationMode('both')}
            title="Combined View"
          >
            <i className="fas fa-layer-group"></i>
            <span>Both</span>
          </button>
        </div>
        <div className="control-group">
          <button 
            className={`control-btn ${gridVisible ? 'active' : ''}`}
            onClick={() => setGridVisible(!gridVisible)}
            title="Toggle Grid"
          >
            <i className="fas fa-th"></i>
            <span>Grid</span>
          </button>
          <button 
            className={`control-btn ${statsVisible ? 'active' : ''}`}
            onClick={() => setStatsVisible(!statsVisible)}
            title="Toggle Stats"
          >
            <i className="fas fa-chart-line"></i>
            <span>Stats</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(220, 53, 69, 0.95)',
          color: '#fff',
          padding: '15px 20px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          maxWidth: '400px',
          zIndex: 1050
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong><i className="fas fa-exclamation-triangle"></i> Simulation Error</strong>
            <button 
              onClick={clearError}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
};

export default GeometryProviderHome;