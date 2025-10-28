import React, { useState, useEffect } from 'react';
import { Modal, Form, Alert, Badge } from 'react-bootstrap';
import { commerceAPI, modelsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface BundleCreationModalProps {
  show: boolean;
  onClose: () => void;
  onBundleCreated?: (bundle: any) => void;
}

interface DesignItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  selected?: boolean;
}

interface BundleFormData {
  name: string;
  description: string;
  category: string;
  bundlePrice: number;
  discountPercentage: number;
  designIds: string[];
}

const BundleCreationModal: React.FC<BundleCreationModalProps> = ({ show, onClose, onBundleCreated }) => {
  const { user } = useAuth();
  const [userDesigns, setUserDesigns] = useState<DesignItem[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<BundleFormData>({
    name: '',
    description: '',
    category: 'Bundle Pack',
    bundlePrice: 0,
    discountPercentage: 10,
    designIds: []
  });

  const categories = [
    'Bundle Pack',
    'Cooling Systems Bundle',
    'Complete System Bundle',
    'Premium Collection',
    'Starter Pack',
    'Professional Bundle'
  ];

  // Load user's designs when modal opens
  useEffect(() => {
    if (show && user) {
      loadUserDesigns();
    }
  }, [show, user]);

  // Calculate bundle pricing when selections change
  useEffect(() => {
    if (selectedDesigns.length > 0) {
      const totalPrice = selectedDesigns.reduce((sum, design) => sum + design.price, 0);
      const discountedPrice = totalPrice * (1 - formData.discountPercentage / 100);
      
      setFormData(prev => ({
        ...prev,
        bundlePrice: parseFloat(discountedPrice.toFixed(2)),
        designIds: selectedDesigns.map(d => d.id)
      }));
    }
  }, [selectedDesigns, formData.discountPercentage]);

  const loadUserDesigns = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to fetch user's designs from API
      const designs = await commerceAPI.designs.getAll();
      const userOwnedDesigns = designs.filter((design: any) => 
        design.seller_id === user?.id || design.seller_id === String(user?.id)
      );
      
      setUserDesigns(userOwnedDesigns.map((design: any) => ({
        id: design.id,
        name: design.name || design.design_name,
        price: parseFloat(design.price),
        description: design.description,
        category: design.category
      })));
    } catch (error) {
      console.log('⚠️ API failed, using mock user designs');
      
      // Mock user designs for testing
      const mockDesigns: DesignItem[] = [
        {
          id: 'design_1',
          name: 'Custom CPU Cooler',
          price: 24.99,
          description: 'High-performance CPU cooling solution',
          category: 'Cooling'
        },
        {
          id: 'design_2',
          name: 'Gaming Case Fan Set',
          price: 19.99,
          description: 'RGB gaming case fans',
          category: 'Cooling'
        },
        {
          id: 'design_3',
          name: 'Liquid Cooling Mount',
          price: 15.99,
          description: 'Universal liquid cooling mounting system',
          category: 'Cooling'
        },
        {
          id: 'design_4',
          name: 'Performance Heatsink',
          price: 12.99,
          description: 'Aluminum performance heatsink',
          category: 'Cooling'
        }
      ];
      
      setUserDesigns(mockDesigns);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignToggle = (design: DesignItem) => {
    setSelectedDesigns(prev => {
      const isSelected = prev.find(d => d.id === design.id);
      
      if (isSelected) {
        return prev.filter(d => d.id !== design.id);
      } else {
        return [...prev, design];
      }
    });
  };

  const handleFormChange = (field: keyof BundleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalPrice = () => {
    return selectedDesigns.reduce((sum, design) => sum + design.price, 0);
  };

  const calculateSavings = () => {
    const totalPrice = calculateTotalPrice();
    return totalPrice - formData.bundlePrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDesigns.length < 2) {
      setError('Please select at least 2 designs for a bundle');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Please enter a bundle name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const bundleData = {
        ...formData,
        totalValue: calculateTotalPrice(),
        savings: calculateSavings(),
        designCount: selectedDesigns.length,
        designs: selectedDesigns
      };
      
      // Try to create bundle via API
      const result = await commerceAPI.designs.create({
        design_name: formData.name,
        description: formData.description,
        price: formData.bundlePrice,
        category: formData.category,
        bundle_data: JSON.stringify(bundleData),
        is_bundle: true
      });
      
      console.log('✅ Bundle created successfully:', result);
      
      if (onBundleCreated) {
        onBundleCreated(result);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Bundle Pack',
        bundlePrice: 0,
        discountPercentage: 10,
        designIds: []
      });
      setSelectedDesigns([]);
      
      onClose();
    } catch (error) {
      console.error('❌ Bundle creation failed:', error);
      setError('Failed to create bundle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDesigns([]);
    setFormData({
      name: '',
      description: '',
      category: 'Bundle Pack',
      bundlePrice: 0,
      discountPercentage: 10,
      designIds: []
    });
    setError('');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered className="bundle-modal">
      <style>{`
        .bundle-modal .modal-content {
          background: linear-gradient(135deg, #1a365d 0%, #2d3748 50%, #1a202c 100%);
          border: 1px solid rgba(79, 209, 197, 0.3);
          color: #e2e8f0;
        }
        
        .bundle-modal .modal-header {
          border-bottom: 2px solid rgba(79, 209, 197, 0.3);
          background: linear-gradient(90deg, rgba(79, 209, 197, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%);
        }
        
        .bundle-modal .design-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(79, 209, 197, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .bundle-modal .design-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(79, 209, 197, 0.4);
        }
        
        .bundle-modal .design-card.selected {
          background: rgba(79, 209, 197, 0.15);
          border-color: #4fd1c5;
          box-shadow: 0 0 15px rgba(79, 209, 197, 0.3);
        }
        
        .bundle-modal .pricing-summary {
          background: rgba(79, 209, 197, 0.1);
          border: 1px solid rgba(79, 209, 197, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .bundle-modal .form-control, .bundle-modal .form-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(79, 209, 197, 0.3);
          color: #e2e8f0;
        }
        
        .bundle-modal .form-control:focus, .bundle-modal .form-select:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #4fd1c5;
          box-shadow: 0 0 10px rgba(79, 209, 197, 0.3);
          color: #e2e8f0;
        }
        
        .bundle-modal .btn-primary {
          background: linear-gradient(135deg, #4fd1c5, #38b2ac);
          border: none;
          color: white;
          font-weight: 600;
        }
        
        .bundle-modal .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #e2e8f0;
        }
      `}</style>
      
      <Modal.Header closeButton>
        <Modal.Title style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #4fd1c5, #38b2ac)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fas fa-box"></i>
          Create Design Bundle
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="row">
          {/* Left Column - Design Selection */}
          <div className="col-md-7">
            <h5 className="mb-3">
              <i className="fas fa-layer-group me-2"></i>
              Select Designs for Bundle
            </h5>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading designs...</span>
                </div>
              </div>
            ) : userDesigns.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-cube fa-3x text-muted mb-3"></i>
                <h6 className="text-muted">No designs available</h6>
                <p className="text-muted">Upload some designs first to create bundles.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {userDesigns.map((design) => (
                  <div 
                    key={design.id}
                    className={`design-card ${selectedDesigns.find(d => d.id === design.id) ? 'selected' : ''}`}
                    onClick={() => handleDesignToggle(design)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 text-white">{design.name}</h6>
                        <p className="mb-1 text-white-50 small">{design.description}</p>
                        <Badge bg="secondary">{design.category}</Badge>
                      </div>
                      <div className="text-end">
                        <div className="h6 mb-0 text-success">${design.price.toFixed(2)}</div>
                        {selectedDesigns.find(d => d.id === design.id) && (
                          <i className="fas fa-check-circle text-success mt-1"></i>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column - Bundle Configuration */}
          <div className="col-md-5">
            <h5 className="mb-3">
              <i className="fas fa-cog me-2"></i>
              Bundle Configuration
            </h5>
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Bundle Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Complete Cooling System Bundle"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe what's included in this bundle..."
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Discount Percentage</Form.Label>
                <Form.Control
                  type="number"
                  min="5"
                  max="50"
                  value={formData.discountPercentage}
                  onChange={(e) => handleFormChange('discountPercentage', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
              
              {/* Pricing Summary */}
              {selectedDesigns.length > 0 && (
                <div className="pricing-summary">
                  <h6 className="mb-3">
                    <i className="fas fa-calculator me-2"></i>
                    Pricing Summary
                  </h6>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Selected Items ({selectedDesigns.length}):</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount ({formData.discountPercentage}%):</span>
                    <span className="text-warning">-${calculateSavings().toFixed(2)}</span>
                  </div>
                  
                  <hr style={{ borderColor: 'rgba(79, 209, 197, 0.3)' }} />
                  
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Bundle Price:</strong>
                    <strong className="text-success">${formData.bundlePrice.toFixed(2)}</strong>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading || selectedDesigns.length < 2}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Creating Bundle...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Create Bundle
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {selectedDesigns.length === 0 && (
                <div className="text-center py-3">
                  <i className="fas fa-info-circle text-info me-2"></i>
                  <span className="text-white-50">Select at least 2 designs to create a bundle</span>
                </div>
              )}
            </Form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BundleCreationModal;