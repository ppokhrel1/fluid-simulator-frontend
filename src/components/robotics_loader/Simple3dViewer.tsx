// frontend/src/components/3dShapes/Simple3DViewer.tsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FileUploader from './FileUploader';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import * as THREE from 'three';

// Define the type for the model object (matches the one in FileUploader)
type ModelObject = THREE.Mesh | THREE.Object3D;

// Component to render the loaded models inside the Canvas
const SceneManager: React.FC<{ models: ModelObject[] }> = ({ models }) => {
  return (
    <>
      {/* Lights and Helpers */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <gridHelper args={[10, 10]} />
      <axesHelper args={[3]} />

      {/* Render the loaded models using <primitive> */}
      {models.map((model, index) => (
        <primitive 
          key={index} 
          object={model} 
        />
      ))}
    </>
  );
};

const Simple3DViewer: React.FC = () => {
  // State to store the loaded models
  const [loadedModels, setLoadedModels] = useState<ModelObject[]>([]);

  console.log('Rendering Simple3DViewer with models:', loadedModels);
  // Callback passed to FileUploader
  const handleModelLoaded = (model: ModelObject) => {
    setLoadedModels([model]);
  };


  return (
    <Container fluid className="simple-viewer py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-white">
            <Card.Body className="text-center">
              <Card.Title as="h1">3D Model Viewer</Card.Title>
              <Card.Text>Upload and view STL/XACRO files and robot specifications</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main content */}
      <Row>
        {/* Control panels */}
        <Col md={4} lg={3}>
          <Tabs defaultActiveKey="models" className="mb-3">
            <Tab eventKey="models" title="3D Models">
              <FileUploader onModelLoaded={handleModelLoaded} />
            </Tab>
          </Tabs>
        </Col>

        {/* 3D Viewport */}
        <Col md={8} lg={9}>
          <Card>
            <Card.Body className="p-0">
              <div className="viewport" style={{ height: '600px' }}>
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                  <color attach="background" args={['#0A0F29']} />
                  
                  {/* SceneManager is inside Canvas and receives the model data */}
                  <SceneManager models={loadedModels} />
                  
                  <OrbitControls enableDamping dampingFactor={0.05} />
                </Canvas>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Simple3DViewer;