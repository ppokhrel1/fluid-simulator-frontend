import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import ControlPanel from './ControlPanel';
import GeometryViewer from './GeometryViewer';
import FlowVisualization from './FlowVisualization';
import './home.css';

interface SimulationData {
  geometry: any;
  flowData: any;
  conditions: any;
}

const GeometryProviderHome: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<'streamlines' | 'vectors' | 'both'>('streamlines');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

      const response = await fetch('/api/simulations/simulate-flow', {
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

      const response = await fetch('/api/v1/simulations/quick-demo', {
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

  return (
    <Container fluid className="home-container vh-100 bg-dark">
      <Row className="h-100 g-0">
        {/* Control Panel */}
        <Col xs={12} lg={3} className="h-100">
          <ControlPanel
            onFileUpload={handleFileUpload}
            onQuickDemo={handleQuickDemo}
            isLoading={isLoading}
            visualizationMode={visualizationMode}
            onVisualizationModeChange={setVisualizationMode}
            progress={progress}
          />
        </Col>

        {/* 3D Visualization */}
        <Col xs={12} lg={9} className="h-100 position-relative">
          <Card className="h-100 border-0 rounded-0">
            <Card.Header className="bg-dark text-white border-secondary py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Badge bg="primary" className="me-2">CFD</Badge>
                  <small>
                    {simulationData ? 'Flow Visualization' : 'Ready for Simulation'}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  {simulationData && (
                    <Badge bg="outline-light" text="light">
                      V: {simulationData.conditions.velocity}m/s
                    </Badge>
                  )}
                  <Badge bg="outline-light" text="light">
                    {visualizationMode}
                  </Badge>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body className="p-0 bg-gradient-dark position-relative">
              <Canvas
                camera={{ position: [5, 3, 5], fov: 50 }}
                className="w-100 h-100"
              >
                <color attach="background" args={['#1a1a1a']} />
                
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
                <gridHelper args={[10, 10, '#444', '#222']} rotation={[-Math.PI / 2, 0, 0]} />
                
                {/* Performance Stats */}
                <Stats />
              </Canvas>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="position-absolute top-50 start-50 translate-middle">
                  <div className="text-center text-white">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Computing Flow Field...</div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={clearError}
          className="position-fixed bottom-0 end-0 m-3"
          style={{ zIndex: 1050, maxWidth: '400px' }}
        >
          <Alert.Heading className="h6">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Simulation Error
          </Alert.Heading>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default GeometryProviderHome;