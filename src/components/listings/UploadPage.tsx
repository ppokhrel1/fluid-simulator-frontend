import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadModelForm from './UploadModelForm';
import type { UploadedModel } from '../../types';
import { Container, Row, Col } from 'react-bootstrap';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleModelUpload = (model: UploadedModel, file: File) => {
    console.log('✅ Model uploaded successfully:', model);
    // The UploadModelForm will handle navigation automatically
  };

  const handleCancel = () => {
    console.log('❌ Upload cancelled, returning to main page');
    navigate('/');
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div 
              className="bg-white rounded shadow-lg p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="text-center mb-4">
                <h2 className="text-primary mb-3">
                  <i className="fas fa-cloud-upload-alt me-2"></i>
                  Upload 3D Model
                </h2>
                <p className="text-muted">
                  Upload your 3D design files to analyze with CFD simulation or list in the marketplace
                </p>
              </div>

              <UploadModelForm 
                onUpload={handleModelUpload}
                onCancel={handleCancel}
              />

              <div className="text-center mt-4">
                <small className="text-muted">
                  Supported formats: STL, OBJ, GLB, GLTF, STEP, STP
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UploadPage;