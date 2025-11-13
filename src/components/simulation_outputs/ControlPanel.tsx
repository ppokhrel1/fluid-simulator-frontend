import React, { useState, useRef } from 'react';
import { Card, Form, Button, ProgressBar, Alert, Tab, Nav, Row, Col } from 'react-bootstrap';

interface ControlPanelProps {
  onFileUpload: (file: File, flowConditions: any) => void;
  onQuickDemo: (geometryType: string, flowConditions: any) => void;
  isLoading: boolean;
  visualizationMode: string;
  onVisualizationModeChange: (mode: 'streamlines' | 'vectors' | 'both') => void;
  progress?: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onFileUpload, 
  onQuickDemo, 
  isLoading,
  visualizationMode,
  onVisualizationModeChange,
  progress = 0
}) => {
  const [velocity, setVelocity] = useState(1.0);
  const [resolution, setResolution] = useState(30);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'demo' | 'upload'>('demo');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (['stl', 'glb', 'obj'].includes(extension || '')) {
        setSelectedFile(file);
      } else {
        alert('Please select STL, GLB, or OBJ file');
      }
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onFileUpload(selectedFile, {
        velocity,
        direction: [1, 0, 0],
        resolution
      });
    }
  };

  const handleQuickDemo = (geometryType: string) => {
    onQuickDemo(geometryType, {
      velocity,
      resolution
    });
  };

  const demoGeometries = [
    { 
      id: 'airfoil', 
      name: 'Airfoil', 
      description: 'NACA 0012 airfoil',
      icon: 'fa-plane'
    },
    { 
      id: 'sphere', 
      name: 'Sphere', 
      description: 'Simple sphere',
      icon: 'fa-circle'
    },
    { 
      id: 'cylinder', 
      name: 'Cylinder', 
      description: 'Circular cylinder',
      icon: 'fa-cube'
    },
    { 
      id: 'cube', 
      name: 'Cube', 
      description: 'Rectangular box',
      icon: 'fa-square'
    }
  ];

  // Extract button content to simplify JSX
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Running Simulation...
        </>
      );
    }
    return (
      <>
        <i className="fas fa-play-circle me-2"></i>
        Run Flow Simulation
      </>
    );
  };

  return (
    <Card className="control-panel h-100 border-0 shadow-lg">
      <Card.Header className="bg-gradient-primary text-white border-0">
        <div className="d-flex align-items-center">
          <i className="fas fa-wind fs-3 me-2"></i>
          <div>
            <h4 className="mb-0 fw-bold">FlowViz CFD</h4>
            <small className="opacity-75">Real-time Computational Fluid Dynamics</small>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-3">
        {/* Progress Bar */}
        {isLoading && (
          <Alert variant="info" className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="fw-bold">Computing Flow Field...</small>
              <small>{progress}%</small>
            </div>
            <ProgressBar 
              now={progress} 
              variant="primary" 
              animated 
              style={{ height: '6px' }}
            />
          </Alert>
        )}

        {/* Tab Navigation */}
        <Nav variant="pills" className="mb-3">
          <Nav.Item className="flex-fill">
            <Nav.Link 
              active={activeTab === 'demo'}
              onClick={() => setActiveTab('demo')}
              className="text-center"
            >
              <i className="fas fa-bolt me-1"></i>
              Quick Demo
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link 
              active={activeTab === 'upload'}
              onClick={() => setActiveTab('upload')}
              className="text-center"
            >
              <i className="fas fa-cloud-upload-alt me-1"></i>
              Upload
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Flow Conditions */}
        <Card className="mb-3 border-light shadow-sm">
          <Card.Header className="bg-light py-2">
            <h6 className="mb-0 fw-semibold">
              <i className="fas fa-sliders-h me-2"></i>
              Flow Conditions
            </h6>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex justify-content-between">
                <span>Velocity</span>
                <span className="text-primary fw-bold">{velocity.toFixed(1)} m/s</span>
              </Form.Label>
              <Form.Range
                min="0.1"
                max="5.0"
                step="0.1"
                value={velocity}
                onChange={(e) => setVelocity(parseFloat(e.target.value))}
                disabled={isLoading}
              />
              <Form.Text className="text-muted">
                Freestream velocity magnitude
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label className="d-flex justify-content-between">
                <span>Grid Resolution</span>
                <span className="text-primary fw-bold">{resolution}³</span>
              </Form.Label>
              <Form.Range
                min="10"
                max="50"
                step="5"
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value))}
                disabled={isLoading}
              />
              <Form.Text className="text-muted">
                Higher resolution = more detail, slower computation
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Content based on active tab */}
        {activeTab === 'upload' ? (
          <Card className="border-light shadow-sm">
            <Card.Body className="text-center">
              <div 
                className={`file-drop-zone border-2 border-dashed rounded-3 p-4 ${
                  selectedFile ? 'border-success bg-success bg-opacity-10' : 'border-secondary'
                }`}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".stl,.glb,.obj"
                  style={{ display: 'none' }}
                />
                
                {selectedFile ? (
                  <div className="text-success">
                    <i className="fas fa-file-check fs-1"></i>
                    <div className="mt-2">
                      <div className="fw-bold">{selectedFile.name}</div>
                      <small className="text-muted">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-cloud-upload-alt fs-1 text-muted"></i>
                    <p className="mb-1 fw-semibold">Click to upload geometry</p>
                    <small className="text-muted">
                      STL, GLB, OBJ • Max 50MB
                    </small>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={isLoading || !selectedFile}
                className="btn btn-primary w-100 mt-3"
              >
                {getButtonContent()}
              </button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-light shadow-sm">
            <Card.Header className="bg-light py-2">
              <h6 className="mb-0 fw-semibold">
                <i className="fas fa-th-large me-2"></i>
                Demo Geometries
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-2">
                {demoGeometries.map(geom => (
                  <Col key={geom.id} xs={6}>
                    <button
                      onClick={() => handleQuickDemo(geom.id)}
                      disabled={isLoading}
                      className="btn btn-outline-primary w-100 h-100 py-3"
                    >
                      <div className="fs-4 mb-1">
                        <i className={`fas ${geom.icon}`}></i>
                      </div>
                      <div className="fw-semibold">{geom.name}</div>
                      <small className="text-muted d-block">{geom.description}</small>
                    </button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Visualization Controls */}
        <Card className="mt-3 border-light shadow-sm">
          <Card.Header className="bg-light py-2">
            <h6 className="mb-0 fw-semibold">
              <i className="fas fa-eye me-2"></i>
              Visualization
            </h6>
          </Card.Header>
          <Card.Body>
            <Form.Select 
              value={visualizationMode} 
              onChange={(e) => onVisualizationModeChange(e.target.value as any)}
              disabled={isLoading}
            >
              <option value="streamlines">Streamlines</option>
              <option value="vectors">Velocity Vectors</option>
              <option value="both">Combined View</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Choose how to visualize the flow field
            </Form.Text>
          </Card.Body>
        </Card>

        {/* Status Info */}
        <Card className="mt-3 border-info bg-info bg-opacity-10">
          <Card.Body className="py-2">
            <div className="d-flex align-items-center">
              <i className="fas fa-info-circle text-info me-2"></i>
              <small className="text-muted">
                Flow direction: +X • Turbulence model: Laminar
              </small>
            </div>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default ControlPanel;