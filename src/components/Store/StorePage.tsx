import React from 'react';
import type { FileData } from '../../types';
import { type CartItem } from './CartModal';

interface StorePageProps {
  onBack: () => void;
  cartItems: CartItem[];
  onAddToCart: (item: StoreItem) => void;
  onShowCart: () => void;
  onViewItem?: (item: StoreItem) => void;
}

export interface StoreItem extends FileData {
  id: string;
  price: number;
  originalPrice?: number;
  description?: string;
  preview?: string;
  category?: string;
  seller?: string;
  rating?: number;
  downloads?: number;
}

const StorePage: React.FC<StorePageProps> = ({ onBack, cartItems, onAddToCart, onShowCart, onViewItem }) => {

  const storeItems: StoreItem[] = [
    {
      id: 'item-1',
      name: 'ARCTIC Liquid Freezer III Pro A-RGB',
      color: '#4CAF50',
      icon: 'fas fa-cube',
      size: '2.5 MB',
      price: 29.99,
      originalPrice: 39.99,
      description: 'High-performance liquid cooling system with RGB lighting',
      category: 'Cooling Systems',
      seller: 'TechDesigns Pro',
      rating: 4.8,
      downloads: 247
    },
    {
      id: 'item-2',
      name: 'Corsair NAUTILUS Water 360mm',
      color: '#2196F3',
      icon: 'fas fa-cube',
      size: '3.1 MB',
      price: 34.99,
      originalPrice: 44.99,
      description: 'Premium all-in-one liquid cooler with advanced pump design',
      category: 'Cooling Systems',
      seller: 'CoolTech Studio',
      rating: 4.9,
      downloads: 189
    },
    {
      id: 'item-3',
      name: 'Thermalright Peerless Assassin',
      color: '#9C27B0',
      icon: 'fas fa-cube',
      size: '1.8 MB',
      price: 24.99,
      originalPrice: 29.99,
      description: 'Dual-tower air cooler with exceptional heat dissipation',
      category: 'Air Coolers',
      seller: 'AeroDesign Labs',
      rating: 4.7,
      downloads: 312
    },
    {
      id: 'item-4',
      name: 'AMD Wraith Stealth Socket',
      color: '#FF5722',
      icon: 'fas fa-cube',
      size: '2.2 MB',
      price: 19.99,
      originalPrice: 24.99,
      description: 'Compact and efficient stock cooler design',
      category: 'CPU Coolers',
      seller: 'ProcessorParts Inc',
      rating: 4.5,
      downloads: 456
    },
    {
      id: 'item-5',
      name: 'NZXT Kraken Elite 360mm',
      color: '#607D8B',
      icon: 'fas fa-cube',
      size: '2.7 MB',
      price: 39.99,
      originalPrice: 49.99,
      description: 'Elite-class AIO cooler with customizable LCD display',
      category: 'Premium Cooling',
      seller: 'EliteDesigns Co',
      rating: 4.9,
      downloads: 198
    }
  ];

  const handleBuyNow = (item: StoreItem) => {
    // Add to cart and immediately show cart
    onAddToCart(item);
    setTimeout(() => {
      onShowCart();
    }, 100);
  };

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
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          className="rounded-circle p-3 me-3" 
                          style={{ 
                            background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                            border: `2px solid ${item.color}30`
                          }}
                        >
                          <i className={item.icon} style={{ color: item.color, fontSize: '24px' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1 fw-bold text-white" style={{ fontSize: '1rem', lineHeight: '1.3' }}>
                            {item.name}
                          </h5>
                          <small className="text-white-50 d-block mb-1">by {item.seller}</small>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark me-2" style={{ fontSize: '0.7rem' }}>
                              {item.size}
                            </span>
                            <span className="badge me-2" style={{ 
                              background: `${item.color}20`, 
                              color: item.color, 
                              fontSize: '0.7rem' 
                            }}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-white-50 mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {item.description}
                      </p>
                      
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center me-3">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i}
                                className={`fas fa-star ${i < Math.floor(item.rating || 0) ? 'text-warning' : 'text-white-50'}`}
                                style={{ fontSize: '0.7rem' }}
                              ></i>
                            ))}
                            <span className="text-white-50 ms-1" style={{ fontSize: '0.8rem' }}>
                              {item.rating}
                            </span>
                          </div>
                          <small className="text-white-50">
                            <i className="fas fa-download me-1"></i>
                            {item.downloads} downloads
                          </small>
                        </div>
                        <small className="text-success fw-semibold">
                          <i className="fas fa-check-circle me-1"></i>
                          Verified Design
                        </small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="price-section">
                          <div className="d-flex align-items-baseline">
                            <span 
                              className="fw-bold text-success me-2" 
                              style={{ fontSize: '1.8rem' }}
                            >
                              ${item.price}
                            </span>
                            {item.originalPrice && (
                              <small className="text-white-50 text-decoration-line-through">
                                ${item.originalPrice}
                              </small>
                            )}
                          </div>
                          <small className="text-success fw-semibold">25% OFF Limited Time!</small>
                        </div>
                        
                        <div className="d-flex gap-2 flex-wrap">
                          {/* View Button */}
                          <button 
                            className="btn px-3 fw-bold"
                            onClick={() => onViewItem && onViewItem(item)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '25px',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s ease',
                              minWidth: '75px',
                              height: '36px',
                              boxShadow: '0 3px 10px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0px)';
                              e.currentTarget.style.boxShadow = '0 3px 10px rgba(102, 126, 234, 0.3)';
                            }}
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </button>

                          {/* Add to Cart Button */}
                          <button 
                            className="btn px-3 fw-bold"
                            onClick={() => onAddToCart(item)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              borderRadius: '25px',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s ease',
                              minWidth: '40px',
                              height: '36px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0px)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            title="Add to Cart"
                          >
                            <i className="fas fa-cart-plus"></i>
                          </button>
                          
                          {/* Buy Now Button */}
                          <button 
                            className="btn px-3 fw-bold flex-grow-1"
                            onClick={() => handleBuyNow(item)}
                            style={{
                              background: 'linear-gradient(135deg, #28a745, #20c997)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '25px',
                              fontSize: '0.85rem',
                              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                              transition: 'all 0.2s ease',
                              minWidth: '100px',
                              height: '36px'
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