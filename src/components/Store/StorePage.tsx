import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { commerceAPI } from '../../services/api';
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

  // Mock store items with seller IDs
  const allStoreItems: StoreItem[] = [
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
      sellerId: 'user_123', // Mock seller ID
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
      sellerId: 'user_456', // Mock seller ID
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
      sellerId: String(user?.id) || 'current_user', // This will be filtered out if user is logged in
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
      sellerId: 'user_789', // Mock seller ID
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
      sellerId: 'user_101', // Mock seller ID
      rating: 4.9,
      downloads: 198
    },
    {
      id: 'item-6',
      name: 'RTX 4080 Gaming GPU',
      color: '#00C851',
      icon: 'fas fa-microchip',
      size: '4.2 MB',
      price: 89.99,
      originalPrice: 119.99,
      description: 'High-performance graphics card model with detailed cooling shroud',
      category: 'Graphics Cards',
      seller: 'GraphicsGuru',
      sellerId: 'user_102',
      rating: 4.8,
      downloads: 542
    },
    {
      id: 'item-7',
      name: 'Intel Core i9-13900K',
      color: '#0033A0',
      icon: 'fas fa-microchip',
      size: '1.9 MB',
      price: 24.99,
      originalPrice: 34.99,
      description: 'Precision-modeled flagship processor with authentic pin layout',
      category: 'Processors',
      seller: 'CPUCrafters',
      sellerId: 'user_103',
      rating: 4.9,
      downloads: 678
    },
    {
      id: 'item-8',
      name: 'Corsair DDR5-6000 RAM Kit',
      color: '#FFB300',
      icon: 'fas fa-memory',
      size: '2.8 MB',
      price: 32.99,
      originalPrice: 42.99,
      description: 'Professional-grade memory module with RGB heat spreaders',
      category: 'Memory',
      seller: 'MemoryMasters',
      sellerId: 'user_104',
      rating: 4.7,
      downloads: 389
    },
    {
      id: 'item-9',
      name: 'ASUS ROG Strix Motherboard',
      color: '#E91E63',
      icon: 'fas fa-microchip',
      size: '5.1 MB',
      price: 49.99,
      originalPrice: 69.99,
      description: 'Feature-rich gaming motherboard with detailed component layout',
      category: 'Motherboards',
      seller: 'BoardBuilders Pro',
      sellerId: 'user_105',
      rating: 4.8,
      downloads: 234
    },
    {
      id: 'item-10',
      name: 'Samsung 980 PRO NVMe SSD',
      color: '#6C5CE7',
      icon: 'fas fa-hdd',
      size: '1.6 MB',
      price: 19.99,
      originalPrice: 29.99,
      description: 'Ultra-fast NVMe storage solution with heat spreader design',
      category: 'Storage',
      seller: 'StorageSolutions',
      sellerId: 'user_106',
      rating: 4.6,
      downloads: 445
    },
    {
      id: 'item-11',
      name: 'Seasonic 850W Modular PSU',
      color: '#FD7C6E',
      icon: 'fas fa-plug',
      size: '3.4 MB',
      price: 54.99,
      originalPrice: 74.99,
      description: '80+ Gold certified power supply with fully modular cables',
      category: 'Power Supplies',
      seller: 'PowerTech Studios',
      sellerId: 'user_107',
      rating: 4.9,
      downloads: 167
    },
    {
      id: 'item-12',
      name: 'Fractal Design Define 7',
      color: '#2ECC71',
      icon: 'fas fa-cube',
      size: '6.8 MB',
      price: 79.99,
      originalPrice: 99.99,
      description: 'Premium PC case with soundproofing and airflow optimization',
      category: 'PC Cases',
      seller: 'CaseDesign Elite',
      sellerId: 'user_108',
      rating: 4.8,
      downloads: 298
    },
    {
      id: 'item-13',
      name: 'Logitech G Pro X Keyboard',
      color: '#A569BD',
      icon: 'fas fa-keyboard',
      size: '2.3 MB',
      price: 27.99,
      originalPrice: 37.99,
      description: 'Professional gaming mechanical keyboard with tactile switches',
      category: 'Peripherals',
      seller: 'PeripheralPro',
      sellerId: 'user_109',
      rating: 4.7,
      downloads: 523
    },
    {
      id: 'item-14',
      name: 'Razer DeathAdder V3 Pro',
      color: '#00F5FF',
      icon: 'fas fa-mouse',
      size: '1.7 MB',
      price: 22.99,
      originalPrice: 32.99,
      description: 'Wireless gaming mouse with Focus Pro sensor and ergonomic design',
      category: 'Peripherals',
      seller: 'GamingGear Co',
      sellerId: 'user_110',
      rating: 4.8,
      downloads: 634
    },
    {
      id: 'item-15',
      name: 'SteelSeries Arctis 7P',
      color: '#FF6B35',
      icon: 'fas fa-headphones',
      size: '3.2 MB',
      price: 34.99,
      originalPrice: 49.99,
      description: 'Wireless gaming headset with lossless 2.4GHz connection',
      category: 'Audio',
      seller: 'AudioTech Masters',
      sellerId: 'user_111',
      rating: 4.6,
      downloads: 378
    },
    {
      id: 'item-16',
      name: 'EVGA GeForce RTX 3070',
      color: '#76FF03',
      icon: 'fas fa-microchip',
      size: '5.4 MB',
      price: 74.99,
      originalPrice: 94.99,
      description: 'High-performance graphics card with ray tracing capabilities',
      category: 'Graphics Cards',
      seller: 'GraphicsPro Elite',
      sellerId: 'user_112',
      rating: 4.9,
      downloads: 445
    },
    {
      id: 'item-17',
      name: 'Cooler Master MasterLiquid',
      color: '#E040FB',
      icon: 'fas fa-tint',
      size: '2.9 MB',
      price: 42.99,
      originalPrice: 59.99,
      description: 'All-in-one liquid cooler with dual chamber pump design',
      category: 'Cooling Systems',
      seller: 'CoolingSolutions',
      sellerId: 'user_113',
      rating: 4.7,
      downloads: 267
    },
    {
      id: 'item-18',
      name: 'G.Skill Trident Z Neo',
      color: '#FF9800',
      icon: 'fas fa-memory',
      size: '2.1 MB',
      price: 38.99,
      originalPrice: 49.99,
      description: 'DDR4 RGB memory kit optimized for AMD Ryzen processors',
      category: 'Memory',
      seller: 'MemoryExperts',
      sellerId: 'user_114',
      rating: 4.8,
      downloads: 512
    },
    {
      id: 'item-19',
      name: 'MSI MAG B550 Tomahawk',
      color: '#3F51B5',
      icon: 'fas fa-microchip',
      size: '4.7 MB',
      price: 45.99,
      originalPrice: 64.99,
      description: 'ATX gaming motherboard with PCIe 4.0 and WiFi 6',
      category: 'Motherboards',
      seller: 'MoboTech Pro',
      sellerId: 'user_115',
      rating: 4.6,
      downloads: 298
    },
    {
      id: 'item-20',
      name: 'WD Black SN850X NVMe',
      color: '#607D8B',
      icon: 'fas fa-hdd',
      size: '1.9 MB',
      price: 28.99,
      originalPrice: 39.99,
      description: 'Ultra-fast PCIe Gen4 NVMe SSD for gaming and content creation',
      category: 'Storage',
      seller: 'StorageTech',
      sellerId: 'user_116',
      rating: 4.7,
      downloads: 421
    },
    {
      id: 'item-21',
      name: 'Corsair RM850x Gold',
      color: '#FF5722',
      icon: 'fas fa-plug',
      size: '3.6 MB',
      price: 62.99,
      originalPrice: 79.99,
      description: 'Fully modular 80+ Gold certified power supply with zero RPM mode',
      category: 'Power Supplies',
      seller: 'PowerSolutions Pro',
      sellerId: 'user_117',
      rating: 4.9,
      downloads: 334
    },
    {
      id: 'item-22',
      name: 'NZXT H5 Elite',
      color: '#9C27B0',
      icon: 'fas fa-cube',
      size: '7.2 MB',
      price: 69.99,
      originalPrice: 89.99,
      description: 'Premium mid-tower case with tempered glass and RGB lighting',
      category: 'PC Cases',
      seller: 'CaseDesign Studio',
      sellerId: 'user_118',
      rating: 4.8,
      downloads: 267
    },
    {
      id: 'item-23',
      name: 'HyperX Cloud Alpha',
      color: '#E91E63',
      icon: 'fas fa-headphones',
      size: '2.8 MB',
      price: 31.99,
      originalPrice: 44.99,
      description: 'Wired gaming headset with dual chamber drivers',
      category: 'Audio',
      seller: 'AudioGaming Pro',
      sellerId: 'user_119',
      rating: 4.5,
      downloads: 456
    },
    {
      id: 'item-24',
      name: 'Elgato Stream Deck',
      color: '#00BCD4',
      icon: 'fas fa-keyboard',
      size: '2.4 MB',
      price: 44.99,
      originalPrice: 59.99,
      description: 'Customizable control surface with LCD keys for content creators',
      category: 'Streaming',
      seller: 'StreamTech Elite',
      sellerId: 'user_120',
      rating: 4.8,
      downloads: 289
    },
    {
      id: 'item-25',
      name: 'Blue Yeti USB Microphone',
      color: '#4CAF50',
      icon: 'fas fa-microphone',
      size: '3.1 MB',
      price: 39.99,
      originalPrice: 54.99,
      description: 'Professional USB condenser microphone for streaming and podcasting',
      category: 'Audio',
      seller: 'AudioRecording Co',
      sellerId: 'user_121',
      rating: 4.7,
      downloads: 378
    }
  ];

  // Filter out current user's listings when browsing store
  useEffect(() => {
    const loadStoreItems = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from API first
        const designs = await commerceAPI.designs.getAll();
        console.log('📦 Fetched designs from API:', designs);
        
        // Filter out current user's own listings
        const filteredDesigns = designs.filter((design: any) => 
          design.seller_id !== user?.id && design.seller_id !== String(user?.id)
        );
        
        setStoreItems(filteredDesigns);
      } catch (error) {
        console.log('⚠️ API failed, using mock data. Error:', error);
        
        // Fallback to mock data, filter out current user's listings
        const filteredItems = allStoreItems.filter(item => {
          if (!user) return true; // Show all items if not logged in
          
          // Filter out items where sellerId matches current user's ID
          return item.sellerId !== String(user.id) && 
                 item.sellerId !== 'current_user';
        });
        
        console.log(`🔍 Filtered ${allStoreItems.length} items to ${filteredItems.length} (excluding user's own listings)`);
        setStoreItems(filteredItems);
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
                <div key={index} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
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
                            {item.originalPrice && (
                              <small className="text-white-50 text-decoration-line-through">
                                ${item.originalPrice}
                              </small>
                            )}
                          </div>
                          <small className="text-success fw-semibold">25% OFF Limited Time!</small>
                        </div>
                        
                        <div className="d-flex gap-1 flex-wrap justify-content-center">
                          {/* View Button */}
                          <button 
                            className="btn px-2 fw-bold"
                            onClick={() => onViewItem && onViewItem(item)}
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