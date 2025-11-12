import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';

interface SellDesignModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (formData: SellDesignFormData) => void;
  uploadedFile?: {
    name: string;
    size?: string;
    [key: string]: any;
  };
}

export interface SellDesignFormData {
  designName: string;
  description: string;
  price: string;
  category: string;
  fileOrigin: string;
  licenseType: string;
  originDeclaration: boolean;
  qualityAssurance: boolean;
  technicalSpecs: string;
  tags: string;
  instructions: string;
}

const SellDesignModal: React.FC<SellDesignModalProps> = ({ show, onClose, onSubmit, uploadedFile }) => {
  const [formData, setFormData] = useState<SellDesignFormData>({
    designName: '',
    description: '',
    price: '',
    category: '',
    fileOrigin: '',
    licenseType: 'commercial',
    originDeclaration: false,
    qualityAssurance: false,
    technicalSpecs: '',
    tags: '',
    instructions: ''
  });

  // Update form data when uploadedFile changes
  useEffect(() => {
    if (uploadedFile && uploadedFile.name) {
      // Remove file extension and clean up the name for design title
      const nameWithoutExtension = uploadedFile.name.replace(/\.[^/.]+$/, '');
      const cleanName = nameWithoutExtension
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
      
      setFormData(prev => ({
        ...prev,
        designName: cleanName
      }));
    }
  }, [uploadedFile]);

  // Common input styles
  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '8px'
  };

  const selectStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '8px'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      designName: '',
      description: '',
      price: '',
      category: '',
      fileOrigin: '',
      licenseType: 'commercial',
      originDeclaration: false,
      qualityAssurance: false,
      technicalSpecs: '',
      tags: '',
      instructions: ''
    });
  };

  return (
    <>
      <style>
        {`
          .sell-design-modal input::placeholder,
          .sell-design-modal textarea::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
            opacity: 1;
          }
          .sell-design-modal select option {
            background-color: #1a1a2e !important;
            color: white !important;
          }
          .sell-design-modal select {
            color: white !important;
          }
        `}
      </style>
      <Modal show={show} onHide={onClose} size="lg" centered backdrop="static" className="sell-design-modal">
      <Modal.Header 
        closeButton 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      >
        <Modal.Title className="d-flex align-items-center w-100">
          <img 
            src="/curfdlogo.png" 
            alt="CURFD" 
            style={{ 
              height: '40px', 
              marginRight: '1rem',
              filter: 'brightness(1.2) contrast(1.1)' 
            }} 
          />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              <i className="fas fa-dollar-sign" style={{ color: '#FFD700', marginRight: '0.5rem' }}></i>
              Sell Your Design
            </div>
            <small style={{ opacity: 0.9, fontSize: '0.85rem' }}>Join our marketplace and earn from your creativity</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body 
        style={{ 
          background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
          maxHeight: '70vh', 
          overflowY: 'auto',
          padding: '2rem'
        }}
      >
        <Form onSubmit={handleSubmit}>
          {/* Info Banner */}
          <div 
            className="alert mb-4" 
            style={{ 
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              color: '#a8b3ff'
            }}
          >
            <i className="fas fa-info-circle me-2"></i>
            Fill out the details below to list your design on our marketplace. All fields marked with * are required.
          </div>

          {/* Uploaded File Info */}
          {uploadedFile && (
            <div 
              className="mb-4 p-3" 
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              <div className="d-flex align-items-center">
                <div 
                  className="me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-cube" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 style={{ margin: 0, color: '#10B981', fontWeight: 'bold' }}>
                    <i className="fas fa-check-circle me-2"></i>
                    Design File Ready
                  </h6>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginTop: '0.25rem' }}>
                    {uploadedFile.name}
                  </div>
                  {uploadedFile.size && (
                    <small style={{ color: '#9CA3AF' }}>
                      File size: {uploadedFile.size}
                    </small>
                  )}
                </div>
                <div className="text-end">
                  <span 
                    className="badge"
                    style={{ 
                      background: '#10B981', 
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem'
                    }}
                  >
                    Uploaded & Analyzed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Design Name */}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
              Design Name <span style={{ color: '#ff6b6b' }}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="designName"
              value={formData.designName}
              onChange={handleChange}
              required
              placeholder="e.g., Premium Aerodynamic Wing Design"
              style={inputStyle}
              className="form-control-lg"
            />
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
              Description <span style={{ color: '#ff6b6b' }}>*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your design in detail. What makes it unique? What problems does it solve?"
              style={inputStyle}
            />
          </Form.Group>

          {/* Price */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
              Price (USD) <span style={{ color: '#ff6b6b' }}>*</span>
            </Form.Label>
            <div className="input-group">
              <span 
                className="input-group-text" 
                style={{ 
                  background: 'rgba(102, 126, 234, 0.2)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  fontWeight: 'bold'
                }}
              >
                <i className="fas fa-dollar-sign"></i>
              </span>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="29.99"
                style={inputStyle}
                className="form-control-lg"
              />
            </div>
            <small style={{ color: '#888', marginTop: '0.25rem', display: 'block' }}>
              Suggested price range: $19.99 - $199.99
            </small>
          </Form.Group>

          {/* Two Column Layout */}
          <div className="row">
            <div className="col-md-6">
              {/* Category */}
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                  Category <span style={{ color: '#ff6b6b' }}>*</span>
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                >
                  <option value="" style={{ color: 'rgba(255,255,255,0.5)' }}>Select a category</option>
                  <option value="aerospace">Aerospace</option>
                  <option value="automotive">Automotive</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="architecture">Architecture</option>
                  <option value="industrial">Industrial</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              {/* License Type */}
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                  License Type <span style={{ color: '#ff6b6b' }}>*</span>
                </Form.Label>
                <Form.Select
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                >
                  <option value="commercial">Commercial - Full Rights</option>
                  <option value="personal">Personal Use Only</option>
                  <option value="attribution">Attribution Required</option>
                  <option value="non-commercial">Non-Commercial</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          {/* File Origin */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
              File Origin <span style={{ color: '#ff6b6b' }}>*</span>
            </Form.Label>
            <Form.Select
              name="fileOrigin"
              value={formData.fileOrigin}
              onChange={handleChange}
              required
              style={selectStyle}
            >
              <option value="" style={{ color: 'rgba(255,255,255,0.5)' }}>Select file origin</option>
              <option value="original">Original Work - Created by Me</option>
              <option value="modified">Modified from Open Source</option>
              <option value="commissioned">Commissioned Work (I own rights)</option>
            </Form.Select>
          </Form.Group>

          {/* Collapsible Advanced Section */}
          <div 
            style={{ 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              marginBottom: '1.5rem'
            }}
          >
            <h6 style={{ color: '#a8b3ff', marginBottom: '1rem' }}>
              <i className="fas fa-cog me-2"></i>Additional Details (Optional)
            </h6>

            {/* Technical Specifications */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#e0e0e0', fontWeight: '400', fontSize: '0.9rem' }}>
                Technical Specifications
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="technicalSpecs"
                value={formData.technicalSpecs}
                onChange={handleChange}
                placeholder="File format, polygon count, dimensions, etc."
                style={{
                  ...inputStyle,
                  fontSize: '0.9rem'
                }}
              />
            </Form.Group>

            {/* Instructions */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#e0e0e0', fontWeight: '400', fontSize: '0.9rem' }}>
                Usage Instructions
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="How to use this design, any special requirements..."
                style={{
                  ...inputStyle,
                  fontSize: '0.9rem'
                }}
              />
            </Form.Group>

            {/* Tags */}
            <Form.Group className="mb-0">
              <Form.Label style={{ color: '#e0e0e0', fontWeight: '400', fontSize: '0.9rem' }}>
                Tags (comma-separated)
              </Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., aerodynamic, vehicle, high-detail"
                style={{
                  ...inputStyle,
                  fontSize: '0.9rem'
                }}
              />
            </Form.Group>
          </div>

          {/* Declarations */}
          <div 
            style={{ 
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <h6 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
              <i className="fas fa-shield-alt me-2"></i>Legal Declarations
            </h6>
            
            {/* Origin Declaration Checkbox */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="originDeclaration"
                checked={formData.originDeclaration}
                onChange={handleChange}
                required
                label="I declare that I am the original creator or have the legal rights to sell this design"
                style={{ color: '#e0e0e0' }}
              />
            </Form.Group>

            {/* Quality Assurance Checkbox */}
            <Form.Group className="mb-0">
              <Form.Check
                type="checkbox"
                name="qualityAssurance"
                checked={formData.qualityAssurance}
                onChange={handleChange}
                required
                label="I confirm that this design is of high quality and suitable for its intended use"
                style={{ color: '#e0e0e0' }}
              />
            </Form.Group>
          </div>

          <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
            <button 
              type="button"
              className="btn btn-outline-light" 
              onClick={onClose}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '500',
                flex: 1
              }}
            >
              <i className="fas fa-times me-2"></i>
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                flex: 2,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              className="btn"
            >
              <i className="fas fa-rocket me-2"></i>
              List Design for Sale
            </button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
    </>
  );
};

export default SellDesignModal;