import React from 'react';
import type { FileData } from '../../types';

interface StorePageProps {
  onBack: () => void;
}

const StorePage: React.FC<StorePageProps> = ({ onBack }) => {
  const storeItems: FileData[] = [
    {
      name: 'ARCTIC Liquid Freezer III Pro A-RGB',
      color: '#4CAF50',
      icon: 'fas fa-cube',
      size: '2.5 MB'
    },
    {
      name: 'Corsair NAUTILUS Water 360mm',
      color: '#2196F3',
      icon: 'fas fa-cube',
      size: '3.1 MB'
    },
    {
      name: 'Thermalright Peerless Assassin',
      color: '#9C27B0',
      icon: 'fas fa-cube',
      size: '1.8 MB'
    },
    {
      name: 'AMD Wraith Stealth Socket',
      color: '#FF5722',
      icon: 'fas fa-cube',
      size: '2.2 MB'
    },
    {
      name: 'NZXT Kraken Elite 360mm',
      color: '#607D8B',
      icon: 'fas fa-cube',
      size: '2.7 MB'
    }
  ];

  return (
    <div 
      className="store-page position-fixed inset-0" 
      style={{ 
        zIndex: 1030, 
        paddingTop: '60px',
        background: 'var(--curfd-dark, #0A0F29)'
      }}
    >
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Main content area - takes up 75% of the width */}
          <div className="col-9 py-4">
            <div className="row g-4">
              {storeItems.map((item, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div 
                    className="card h-100 shadow-lg border-0" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-4">
                        <div 
                          className="rounded-circle p-3 me-3" 
                          style={{ 
                            background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                            border: `2px solid ${item.color}30`
                          }}
                        >
                          <i className={item.icon} style={{ color: item.color, fontSize: '28px' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-2 fw-bold text-white" style={{ fontSize: '1.1rem' }}>
                            {item.name}
                          </h5>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark me-2" style={{ fontSize: '0.75rem' }}>
                              {item.size}
                            </span>
                            <small className="text-success fw-semibold">
                              <i className="fas fa-check-circle me-1"></i>
                              Ready to Ship
                            </small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="price-section">
                          <div className="d-flex align-items-baseline">
                            <span 
                              className="fw-bold text-success me-2" 
                              style={{ fontSize: '1.8rem' }}
                            >
                              $29.99
                            </span>
                            <small className="text-white-50 text-decoration-line-through">$39.99</small>
                          </div>
                          <small className="text-success fw-semibold">25% OFF Limited Time!</small>
                        </div>
                        
                        <button 
                          className="btn btn-lg px-4 fw-bold"
                          style={{
                            background: 'linear-gradient(135deg, #28a745, #20c997)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50px',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                          }}
                        >
                          <i className="fas fa-shopping-cart me-2"></i>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty space for chat - takes up 25% of the width */}
          <div className="col-3">
            {/* This space is intentionally left empty for the chat overlay */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;