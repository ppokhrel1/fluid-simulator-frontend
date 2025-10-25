import React, { useState, useEffect } from 'react';
import { Card, Badge, Row, Col, Container } from 'react-bootstrap';
import type { FileData, UploadedModel } from '../../types';

interface ModelsListPageProps {
  onModelSelect: (model: UploadedModel) => void;
  onBackToMain: () => void;
}

export const ModelsListPage: React.FC<ModelsListPageProps> = ({ onModelSelect, onBackToMain }) => {
  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Test data (retained)
  const testModels: UploadedModel[] = [
    {
      id: '1',
      name: 'Car Design v2.stl',
      fileName: 'Car Design v2.stl',
      uploadDate: '2024-01-15T10:30:00Z',
      fileSize: '2.4 MB',
      type: 'stl',
      analysisStatus: 'completed',
      lastOpened: '2024-01-16T14:20:00Z',
      // This is a valid external URL
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU2_3Bc48L58cNSMvnWkHQMCh2Ue9jNIC6kw&s',
      tags: ['vehicle', 'aerodynamics']
    },
    {
      id: '2',
      name: 'Airplane Wing.stl',
      fileName: 'Airplane Wing.stl',
      uploadDate: '2024-01-14T16:45:00Z',
      fileSize: '1.8 MB',
      type: 'stl',
      analysisStatus: 'completed',
      lastOpened: '2024-01-15T09:15:00Z',
      // This is a placeholder URL, so the fallback icon will display
      thumbnail: 'https://media.printables.com/media/prints/768011/images/5979348_a352c031-c3ea-4c4a-9265-edc84a2e2fe8_d49f1449-a16b-452b-8894-2d3c9acbeb53/thumbs/inside/1280x960/png/screen-shot-2024-02-16-at-51843-pm.webp', 
      tags: ['aerospace', 'wing']
    },
    {
      id: '3',
      name: 'Turbine Blade.stl',
      fileName: 'Turbine Blade.stl',
      uploadDate: '2024-01-13T11:20:00Z',
      fileSize: '3.1 MB',
      type: 'stl',
      analysisStatus: 'in-progress',
      lastOpened: '2024-01-14T10:30:00Z',
      // Use a different valid URL for demonstration
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmiO1QxCldQwWTMRMYEH5mN84-UHqLSg03CQ&s',
      tags: ['energy', 'blade']
    },
    {
      id: '4',
      name: 'Building Structure.obj',
      fileName: 'Building Structure.obj',
      uploadDate: '2024-01-12T08:15:00Z',
      fileSize: '5.2 MB',
      type: 'obj',
      analysisStatus: 'completed',
      lastOpened: '2024-01-13T16:45:00Z',
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy8Lfol3dmMkE5nv_LcUWL6LmZkuwGfkBmFQ&s',
      tags: ['architecture', 'structural']
    },
    {
      id: '5',
      name: 'Drone Frame.glb',
      fileName: 'Drone Frame.glb',
      uploadDate: '2024-01-11T14:30:00Z',
      fileSize: '4.7 MB',
      type: 'glb',
      analysisStatus: 'pending',
      lastOpened: null,
      thumbnail: 'https://content.instructables.com/FK2/TEUK/I3THY4DM/FK2TEUKI3THY4DM.jpg?auto=webp&frame=1&width=2100',
      tags: ['uav', 'frame']
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch models
    setTimeout(() => {
      setUploadedModels(testModels);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'in-progress':
        return <Badge bg="warning">In Progress</Badge>;
      case 'pending':
        return <Badge bg="secondary">Pending</Badge>;
      case 'error':
        return <Badge bg="danger">Error</Badge>;
      default:
        return <Badge bg="secondary">Pending</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'stl': 'fas fa-cube',
      'obj': 'fas fa-shapes',
      'glb': 'fas fa-cube',
      'gltf': 'fas fa-cube',
      'step': 'fas fa-project-diagram',
      'stp': 'fas fa-project-diagram'
    };
    return iconMap[type] || 'fas fa-file';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-dark min-vh-100 text-white">
        <Container className="py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading your models...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-dark min-vh-100 text-white">
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">
              <i className="fas fa-folder-open text-primary me-2"></i>
              My Models
            </h1>
            <p className="text-muted mb-0">
              {uploadedModels.length} model{uploadedModels.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={onBackToMain}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Analysis
          </button>
        </div>

        {/* Models Grid */}
        <Row>
          {uploadedModels.map((model) => (
            <Col key={model.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 bg-dark border-secondary hover-shadow">
                <div className="position-relative">
                  {/* --- MODIFICATION START --- */}
                  {/* Check if the thumbnail is a valid, non-placeholder URL */}
                  {model.thumbnail && !model.thumbnail.includes('/api/placeholder') ? (
                    <Card.Img 
                      variant="top" 
                      src={model.thumbnail} 
                      alt={`Thumbnail for ${model.name}`}
                      style={{ 
                        height: '200px', 
                        objectFit: 'cover', // Ensures image covers the area
                        borderTopLeftRadius: '0.375rem', 
                        borderTopRightRadius: '0.375rem' 
                      }}
                    />
                  ) : (
                    // Fallback to the icon placeholder if no valid thumbnail is present
                    <div 
                      className="bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center"
                      style={{ height: '200px', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
                    >
                      <i className={`${getFileIcon(model.type)} text-primary`} style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  {/* --- MODIFICATION END --- */}
                  
                  {/* Status Badge */}
                  <div className="position-absolute top-0 end-0 m-2">
                    {getStatusBadge(model.analysisStatus)}
                  </div>
                </div>

                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <h6 className="card-title text-white mb-1">{model.name}</h6>
                    <small className="text-muted">
                      <i className={`${getFileIcon(model.type)} me-1`}></i>
                      {model.type.toUpperCase()} • {model.fileSize}
                    </small>
                  </div>

                  {/* Tags */}
                  <div className="mb-3">
                    {model.tags.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        bg="outline-secondary" 
                        text="muted" 
                        className="me-1 mb-1 border border-secondary"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {model.tags.length > 3 && (
                      <Badge 
                        bg="outline-secondary" 
                        text="muted"
                        className="border border-secondary"
                        style={{ fontSize: '0.7rem' }}
                      >
                        +{model.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between text-muted small">
                      <div>
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(model.uploadDate)}
                      </div>
                      <div>
                        <i className="fas fa-clock me-1"></i>
                        {formatDate(model.lastOpened)}
                      </div>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="bg-dark border-secondary">
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onModelSelect(model)}
                    >
                      <i className="fas fa-wind me-2"></i>
                      Analyze Model
                    </button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Empty State (retained) */}
        {uploadedModels.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-folder-open text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="text-muted mb-3">No models uploaded yet</h4>
            <p className="text-muted mb-4">
              Upload your first 3D model to get started with CFD analysis.
            </p>
            <button 
              className="btn btn-primary"
              onClick={onBackToMain}
            >
              <i className="fas fa-upload me-2"></i>
              Upload First Model
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ModelsListPage;