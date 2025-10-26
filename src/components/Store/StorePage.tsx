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
    <div className="store-page position-fixed inset-0 bg-dark" style={{ zIndex: 1030, paddingTop: '60px' }}>
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Main content area - takes up 75% of the width */}
          <div className="col-9 py-4">
            <div className="row g-4">
              {storeItems.map((item, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div 
                    className="card bg-dark text-white h-100 border border-secondary" 
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          className="rounded-circle p-3 me-3" 
                          style={{ background: `${item.color}22` }}
                        >
                          <i className={item.icon} style={{ color: item.color, fontSize: '24px' }}></i>
                        </div>
                        <div>
                          <h5 className="card-title mb-1">{item.name}</h5>
                          <small className="text-muted">Size: {item.size}</small>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-primary px-3 py-2">$29.99</span>
                        <button className="btn btn-outline-light">
                          Purchase
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