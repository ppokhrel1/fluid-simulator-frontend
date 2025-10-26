// components/listings/ModelsListing.tsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Row, Col, Container, Spinner } from 'react-bootstrap';
import { modelsAPI } from '../../services/api';
import { backendToFrontendModel } from '../../utils/transform';
import type { UploadedModel, UploadedModelCamelCase } from '../../types';

interface ModelsListPageProps {
  onModelSelect: (model: UploadedModelCamelCase) => void;
  onBackToMain: () => void;
}

export const ModelsListPage: React.FC<ModelsListPageProps> = ({ onModelSelect, onBackToMain }) => {
  const [uploadedModels, setUploadedModels] = useState<UploadedModelCamelCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const models: UploadedModel[] = await modelsAPI.getAll();
      // Convert backend snake_case to frontend camelCase
      const camelCaseModels = models.map(model => backendToFrontendModel(model));
      setUploadedModels(camelCaseModels);
    } catch (err: any) {
      setError('Failed to load models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Fix: Update formatDate to accept string | null | undefined
  const formatDate = (dateString: string | null | undefined) => {
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
      <div className="bg-light min-vh-100 text-white">
        <Container className="py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="text-center">
              <Spinner animation="border" role="status" className="mb-3">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading your models...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light min-vh-100 text-white">
        <Container className="py-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 text-white">
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
              <Card className="h-100 bg-light border-secondary hover-shadow">
                <div className="position-relative">
                  {model.thumbnail ? (
                    <Card.Img 
                      variant="top" 
                      src={model.thumbnail} 
                      alt={`Thumbnail for ${model.name}`}
                      style={{ 
                        height: '200px', 
                        objectFit: 'cover',
                        borderTopLeftRadius: '0.375rem', 
                        borderTopRightRadius: '0.375rem' 
                      }}
                    />
                  ) : (
                    <div 
                      className="bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center"
                      style={{ height: '200px', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
                    >
                      {/* Use fileType (camelCase) */}
                      <i className={`${getFileIcon(model.fileType)} text-primary`} style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  
                  {/* Status Badge - use analysisStatus (camelCase) */}
                  <div className="position-absolute top-0 end-0 m-2">
                    {getStatusBadge(model.analysisStatus)}
                  </div>
                </div>

                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <h6 className="card-title text-white mb-1">{model.name}</h6>
                    <small className="text-muted">
                      {/* Use fileType and fileSize (camelCase) */}
                      <i className={`${getFileIcon(model.fileType)} me-1`}></i>
                      {model.fileType.toUpperCase()} • {model.fileSize}
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
                        {/* Use createdAt (camelCase) */}
                        {formatDate(model.createdAt)}
                      </div>
                      <div>
                        <i className="fas fa-clock me-1"></i>
                        {/* Use lastOpened (camelCase) */}
                        {formatDate(model.lastOpened)}
                      </div>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="bg-light border-secondary">
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

        {/* Empty State */}
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