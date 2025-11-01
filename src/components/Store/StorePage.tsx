import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { commerceAPI, modelsAPI } from '../../services/api';
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
  sellerId?: string; // Add seller ID for filtering
  rating?: number;
  downloads?: number;
}

const StorePage: React.FC<StorePageProps> = ({ onBack, cartItems, onAddToCart, onShowCart, onViewItem }) => {
  const { user } = useAuth();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter out current user's listings when browsing store
  useEffect(() => {
    const loadStoreItems = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from commerce API first
        const designs = await commerceAPI.designs.getAll();
        console.log('📦 Fetched designs from commerce API:', designs);
        
        // Map API response to StoreItem format
        const mappedDesigns: StoreItem[] = designs.map((design: any) => ({
          id: design.id || design._id,
          name: design.name || design.title || 'Untitled Design',
          color: design.color || '#4CAF50',
          icon: design.icon || 'fas fa-cube',
          size: design.size || '2.5 MB',
          price: design.price || 19.99,
          originalPrice: design.originalPrice || design.price || 29.99,
          description: design.description || 'A premium 3D design model',
          category: design.category || '3D Models',
          seller: design.seller || design.sellerName || 'Unknown Seller',
          sellerId: design.sellerId || design.seller_id || design.userId,
          rating: design.rating || 4.5,
          downloads: design.downloads || design.downloadCount || 100,
          preview: design.preview || design.image || design.thumbnail
        }));
        
        // Filter out current user's own listings
        const filteredDesigns = mappedDesigns.filter((design: StoreItem) => 
          design.sellerId !== user?.id && design.sellerId !== String(user?.id)
        );
        
        console.log(`🔍 Filtered ${mappedDesigns.length} items to ${filteredDesigns.length} (excluding user's own listings)`);
        setStoreItems(filteredDesigns);
        
      } catch (error) {
        console.log('⚠️ Commerce API failed, trying models API. Error:', error);
        
        try {
          // Fallback to models API
          const models = await modelsAPI.getAll();
          console.log('📦 Fetched models from models API:', models);
          
          // Map models API response to StoreItem format
          const mappedModels: StoreItem[] = models.map((model: any) => ({
            id: model.id || model._id,
            name: model.name || model.title || 'Untitled Model',
            color: model.color || '#2196F3',
            icon: model.icon || 'fas fa-cube',
            size: model.size || '3.1 MB',
            price: model.price || 24.99,
            originalPrice: model.originalPrice || model.price || 34.99,
            description: model.description || 'A detailed 3D model',
            category: model.category || '3D Models',
            seller: model.seller || model.creator || 'Unknown Creator',
            sellerId: model.sellerId || model.creatorId || model.userId,
            rating: model.rating || 4.7,
            downloads: model.downloads || model.downloadCount || 150,
            preview: model.preview || model.image || model.thumbnail
          }));
          
          // Filter out current user's own listings
          const filteredModels = mappedModels.filter((model: StoreItem) => 
            model.sellerId !== user?.id && model.sellerId !== String(user?.id)
          );
          
          console.log(`🔍 Filtered ${mappedModels.length} models to ${filteredModels.length} (excluding user's own listings)`);
          setStoreItems(filteredModels);
          
        } catch (modelsError) {
          console.log('❌ Both APIs failed, using empty store. Error:', modelsError);
          
          // Final fallback - empty array
          setStoreItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStoreItems();
  }, [user]);

  if (loading) {
    return (
      <div 
        className="store-page position-fixed inset-0 d-flex justify-content-center align-items-center" 
        style={{ 
          zIndex: 1030, 
          paddingTop: '60px',
          background: 'var(--curfd-dark, #0A0F29)'
        }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-white">Loading Store...</h5>
        </div>
      </div>
    );
  }

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
        paddingBottom: '80px',
        background: 'var(--curfd-dark, #0A0F29)',
        overflow: 'hidden'
      }}
    >
      {/* Bottom gradient overlay */}
      <div
        className="position-absolute bottom-0 start-0 end-0"
        style={{
          height: '120px',
          background: 'linear-gradient(to top, rgba(10, 15, 41, 0.95) 0%, rgba(10, 15, 41, 0.8) 40%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div 
        className="container-fluid h-100" 
        style={{ 
          paddingTop: '20px', 
          paddingLeft: '24px', 
          paddingRight: '24px',
          overflowY: 'auto',
          height: '100%'
        }}
      >
        {/* Full width layout optimized for store */}
        <div className="row">
          <div className="col-12 py-4">
            {storeItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-store fa-4x text-muted mb-3"></i>
                <h4 className="text-white mb-3">No items available</h4>
                <p className="text-white-50 mb-4">
                  {user 
                    ? "There are no other sellers' items in the store right now. Check back later for new listings!"
                    : "The store is empty right now. Check back later for new listings!"
                  }
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {storeItems.map((item, index) => (
                <div key={item.id || index} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                  <div 
                    className="card h-100 shadow-lg border-0" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                      minHeight: '280px'
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
                    <div className="card-body d-flex flex-column" style={{ padding: '1.5rem 1.5rem 1.5rem 1.5rem' }}>
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
                      
                      <p className="text-white-50 mb-2" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {item.description}
                      </p>
                      
                      <div className="d-flex align-items-center justify-content-between mb-2">
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
                            {item.originalPrice && item.originalPrice > item.price && (
                              <small className="text-white-50 text-decoration-line-through">
                                ${item.originalPrice}
                              </small>
                            )}
                          </div>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <small className="text-success fw-semibold">
                              {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF Limited Time!
                            </small>
                          )}
                        </div>
                        
                        <div className="d-flex gap-1 flex-wrap justify-content-center">
                          {/* View Button */}
                          {onViewItem && (
                            <button 
                              className="btn px-2 fw-bold"
                              onClick={() => onViewItem(item)}
                              style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                transition: 'all 0.2s ease',
                                minWidth: '65px',
                                height: '32px',
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
                          )}

                          {/* Add to Cart Button */}
                          <button 
                            className="btn px-2 fw-bold"
                            onClick={() => onAddToCart(item)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '0.7rem',
                              transition: 'all 0.2s ease',
                              minWidth: '35px',
                              height: '32px'
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;