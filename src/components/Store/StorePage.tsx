import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { commerceAPI, modelsAPI, paymentAPI } from '../../services/api';
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
  sellerId?: string;
  rating?: number;
  downloads?: number;
  isOwner?: boolean;
  isPurchased?: boolean;
  purchaseDate?: string;
  downloadCount?: number;
  maxDownloads?: number;
}

const StorePage: React.FC<StorePageProps> = ({ onBack, cartItems, onAddToCart, onShowCart, onViewItem }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'uploaded' | 'purchased'>('all');
  const [allItems, setAllItems] = useState<StoreItem[]>([]);
  const [uploadedItems, setUploadedItems] = useState<StoreItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: ''
  });

  // Load all items based on active tab
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      
      try {
        if (activeTab === 'all') {
          await loadAllItems();
        } else if (activeTab === 'uploaded') {
          await loadUploadedItems();
        } else if (activeTab === 'purchased') {
          await loadPurchasedItems();
        }
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [user, activeTab]);

  const loadAllItems = async () => {
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
      
      // Filter out current user's own listings (keep the original store behavior)
      const filteredDesigns = mappedDesigns.filter((design: StoreItem) => 
        design.sellerId !== user?.id && design.sellerId !== String(user?.id)
      );
      
      console.log(`🔍 Filtered ${mappedDesigns.length} items to ${filteredDesigns.length} (excluding user's own listings)`);
      setAllItems(filteredDesigns);
      
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
        
        // Filter out current user's own listings (keep the original store behavior)
        const filteredModels = mappedModels.filter((model: StoreItem) => 
          model.sellerId !== user?.id && model.sellerId !== String(user?.id)
        );
        
        console.log(`🔍 Filtered ${mappedModels.length} models to ${filteredModels.length} (excluding user's own listings)`);
        setAllItems(filteredModels);
        
      } catch (modelsError) {
        console.log('❌ Both APIs failed, using empty store. Error:', modelsError);
        setAllItems([]);
      }
    }
  };

  const loadUploadedItems = async () => {
    try {
      // Try commerce API first
      const designs = await commerceAPI.designs.getAll();
      
      const mappedDesigns: StoreItem[] = designs
        .filter((design: any) => 
          design.sellerId === user?.id || 
          design.seller_id === user?.id || 
          design.userId === user?.id
        )
        .map((design: any) => ({
          id: design.id || design._id,
          name: design.name || design.title || 'Untitled Design',
          color: design.color || '#4CAF50',
          icon: design.icon || 'fas fa-cube',
          size: design.size || '2.5 MB',
          price: design.price || 19.99,
          originalPrice: design.originalPrice || design.price || 29.99,
          description: design.description || 'A premium 3D design model',
          category: design.category || '3D Models',
          seller: design.seller || design.sellerName || 'You',
          sellerId: design.sellerId || design.seller_id || design.userId,
          rating: design.rating || 4.5,
          downloads: design.downloads || design.downloadCount || 0,
          preview: design.preview || design.image || design.thumbnail,
          isOwner: true
        }));
      
      console.log(`👤 Found ${mappedDesigns.length} uploaded items`);
      setUploadedItems(mappedDesigns);
      
    } catch (error) {
      console.log('⚠️ Commerce API failed for uploaded items, trying models API:', error);
      
      try {
        // Fallback to models API
        const models = await modelsAPI.getAll();
        
        const mappedModels: StoreItem[] = models
          .filter((model: any) => 
            model.sellerId === user?.id || 
            model.creatorId === user?.id || 
            model.userId === user?.id
          )
          .map((model: any) => ({
            id: model.id || model._id,
            name: model.name || model.title || 'Untitled Model',
            color: model.color || '#2196F3',
            icon: model.icon || 'fas fa-cube',
            size: model.size || '3.1 MB',
            price: model.price || 24.99,
            originalPrice: model.originalPrice || model.price || 34.99,
            description: model.description || 'A detailed 3D model',
            category: model.category || '3D Models',
            seller: model.seller || model.creator || 'You',
            sellerId: model.sellerId || model.creatorId || model.userId,
            rating: model.rating || 4.7,
            downloads: model.downloads || model.downloadCount || 0,
            preview: model.preview || model.image || model.thumbnail,
            isOwner: true
          }));
        
        console.log(`👤 Found ${mappedModels.length} uploaded models`);
        setUploadedItems(mappedModels);
        
      } catch (modelsError) {
        console.log('❌ Both APIs failed for uploaded items:', modelsError);
        setUploadedItems([]);
      }
    }
  };

  const loadPurchasedItems = async () => {
    if (!user || !user.id) {
      console.log('User not authenticated, cannot load purchased items');
      setPurchasedItems([]);
      return;
    }

    try {
      const purchases = await getPurchases();
      console.log('🛒 Fetched purchased items:', purchases);
      
      if (!Array.isArray(purchases)) {
        console.warn('Purchases data is not an array:', purchases);
        setPurchasedItems([]);
        return;
      }
      
      const allPurchasedItems: StoreItem[] = [];
      
      purchases.forEach((purchase: any) => {
        if (purchase?.items && Array.isArray(purchase.items)) {
          purchase.items.forEach((item: any) => {
            if (item) {
              allPurchasedItems.push({
                id: item.design_id || item.id || `purchased-${purchase.id}-${item.design_id}`,
                name: item.design_name || item.name || 'Purchased Item',
                color: item.color || '#FF6B35',
                icon: item.icon || 'fas fa-shopping-bag',
                size: item.size || 'Unknown Size',
                price: item.price || 0,
                description: item.description || 'Purchased design model',
                category: item.category || 'Purchased',
                seller: item.seller_name || 'Unknown Seller',
                sellerId: item.seller_id,
                rating: item.rating || 4.0,
                downloads: item.downloads || 0,
                preview: item.preview || item.image,
                isPurchased: true,
                purchaseDate: purchase.purchaseDate || purchase.created_at,
                downloadCount: item.download_count || 0,
                maxDownloads: item.max_downloads || 5
              });
            }
          });
        }
      });
      
      console.log(`🛒 Found ${allPurchasedItems.length} purchased items`);
      setPurchasedItems(allPurchasedItems);
      
    } catch (error) {
      console.error('❌ Failed to load purchased items:', error);
      setPurchasedItems([]);
    }
  };

  // Helper function to get purchases (with fallback)
  const getPurchases = async (): Promise<any[]> => {
    if (!user || !user.id) {
      console.warn('No user available for fetching purchases');
      return [];
    }

    const userId = user.id;

    try {
      return await commerceAPI.purchases.getUserPurchases(userId);
    } catch (error) {
      console.log('Purchases endpoint failed, trying sales endpoint:', error);
      try {
        const sales = await commerceAPI.sales.getUserTransactions(userId);
        return Array.isArray(sales) ? sales.filter((sale: any) => sale.userId === userId) : [];
      } catch (salesError) {
        console.log('Sales endpoint also failed:', salesError);
        return [];
      }
    }
  };

  const handleEditItem = (item: StoreItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        category: editForm.category
      };

      try {
        await commerceAPI.designs.update(editingItem.id, updateData);
      } catch (commerceError) {
        await modelsAPI.update(editingItem.id, updateData);
      }

      const updateItems = (items: StoreItem[]) => 
        items.map(item =>
          item.id === editingItem.id
            ? { ...item, ...updateData }
            : item
        );

      setUploadedItems(updateItems(uploadedItems));
      
      setEditingItem(null);
      setEditForm({ name: '', description: '', price: 0, category: '' });
      
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDownload = async (item: StoreItem) => {
    if (!item.isPurchased) return;

    try {
      const downloadData = await downloadPurchasedItem(item.id);
      
      if (downloadData.file_url) {
        const link = document.createElement('a');
        link.href = downloadData.file_url;
        link.download = downloadData.filename || `design-${item.id}.stl`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        await loadPurchasedItems();
      }
    } catch (error) {
      console.error('Error downloading item:', error);
      alert('Failed to download item. Please try again.');
    }
  };

  const downloadPurchasedItem = async (itemId: string) => {
    try {
      return await commerceAPI.purchases.downloadItem(itemId);
    } catch (error) {
      console.log('Download endpoint failed, using fallback:', error);
      return {
        file_url: `/api/v1/files/download/${itemId}`,
        filename: `design-${itemId}.stl`
      };
    }
  };

  const canDownload = (item: StoreItem) => {
    if (!item.isPurchased) return false;
    
    const downloadCount = item.downloadCount || 0;
    const maxDownloads = item.maxDownloads || 5;
    
    return downloadCount < maxDownloads;
  };

  const getRemainingDownloads = (item: StoreItem) => {
    const downloadCount = item.downloadCount || 0;
    const maxDownloads = item.maxDownloads || 5;
    return Math.max(0, maxDownloads - downloadCount);
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'all': return allItems;
      case 'uploaded': return uploadedItems;
      case 'purchased': return purchasedItems;
      default: return allItems;
    }
  };

  const currentItems = getCurrentItems();

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
          <h5 className="text-white">
            {activeTab === 'all' ? 'Loading Store...' : 
             activeTab === 'uploaded' ? 'Loading Your Uploads...' : 
             'Loading Purchases...'}
          </h5>
        </div>
      </div>
    );
  }

  const handleBuyNow = (item: StoreItem) => {
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
        <div className="row">
          <div className="col-12 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={onBack}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              
              <h2 className="text-white mb-0 text-center">
                {activeTab === 'all' ? '3D Model Store' : 
                 activeTab === 'uploaded' ? 'My Uploads' : 
                 'My Purchases'}
              </h2>
              
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('all')}
                >
                  <i className="fas fa-store me-2"></i>
                  All Items
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'uploaded' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('uploaded')}
                >
                  <i className="fas fa-upload me-2"></i>
                  My Uploads
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'purchased' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('purchased')}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  My Purchases
                </button>
              </div>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-5">
                <i className={`fas ${
                  activeTab === 'all' ? 'fa-store' : 
                  activeTab === 'uploaded' ? 'fa-upload' : 
                  'fa-shopping-bag'
                } fa-4x text-muted mb-3`}></i>
                <h4 className="text-white mb-3">
                  {activeTab === 'all' ? 'No items available' : 
                   activeTab === 'uploaded' ? 'No uploaded items' : 
                   'No purchased items'}
                </h4>
                <p className="text-white-50 mb-4">
                  {activeTab === 'all' 
                    ? (user 
                      ? "There are no other sellers' items in the store right now. Check back later for new listings!"
                      : "The store is empty right now. Check back later for new listings!"
                      )
                    : activeTab === 'uploaded'
                    ? "You haven't uploaded any items yet. Start selling your designs!"
                    : "You haven't purchased any items yet. Browse the store to find amazing designs!"
                  }
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {currentItems.map((item, index) => (
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
                            <div className="d-flex align-items-center justify-content-between">
                              <h5 className="card-title mb-1 fw-bold text-white" style={{ fontSize: '1rem', lineHeight: '1.3' }}>
                                {item.name}
                              </h5>
                              <div>
                                {item.isOwner && activeTab === 'uploaded' && (
                                  <span className="badge bg-info me-1">Your Item</span>
                                )}
                                {item.isPurchased && (
                                  <span className="badge bg-success">
                                    <i className="fas fa-check me-1"></i>
                                    Purchased
                                  </span>
                                )}
                              </div>
                            </div>
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
                        
                        {item.isPurchased && (
                          <div className="mb-3 p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-white-50">
                                Downloads: {item.downloadCount || 0}/{item.maxDownloads || 5}
                              </small>
                              <small className={canDownload(item) ? 'text-success' : 'text-warning'}>
                                {canDownload(item) 
                                  ? `${getRemainingDownloads(item)} remaining`
                                  : 'Limit reached'
                                }
                              </small>
                            </div>
                            {item.purchaseDate && (
                              <small className="text-white-50 d-block">
                                Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                              </small>
                            )}
                          </div>
                        )}
                        
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
                            {/* Edit Button - only show in Uploaded tab */}
                            {item.isOwner && activeTab === 'uploaded' && (
                              <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => handleEditItem(item)}
                                style={{
                                  borderRadius: '20px',
                                  minWidth: '65px',
                                  height: '32px',
                                  fontSize: '0.7rem'
                                }}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Edit
                              </button>
                            )}

                            {/* Download Button - only show in Purchased tab */}
                            {item.isPurchased && (
                              <button 
                                className={`btn btn-sm ${canDownload(item) ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => handleDownload(item)}
                                disabled={!canDownload(item)}
                                style={{
                                  borderRadius: '20px',
                                  minWidth: '100px',
                                  height: '32px',
                                  fontSize: '0.7rem'
                                }}
                              >
                                <i className="fas fa-download me-1"></i>
                                {canDownload(item) ? 'Download' : 'Limit Reached'}
                              </button>
                            )}

                            {/* View Button - show in All and Uploaded tabs for non-purchased items */}
                            {onViewItem && !item.isPurchased && activeTab !== 'purchased' && (
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
                              >
                                <i className="fas fa-eye me-1"></i>
                                View
                              </button>
                            )}

                            {/* Add to Cart Button - only show in All tab for others' items */}
                            {activeTab === 'all' && (
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
                                title="Add to Cart"
                              >
                                <i className="fas fa-cart-plus"></i>
                              </button>
                            )}
                            
                            {/* Buy Now Button - only show in All tab for others' items */}
                            {activeTab === 'all' && (
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
                              >
                                <i className="fas fa-shopping-cart me-2"></i>
                                Buy Now
                              </button>
                            )}
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

      {editingItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ 
              background: 'var(--curfd-dark, #0A0F29)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px'
            }}>
              <div className="modal-header border-0">
                <h5 className="modal-title text-white">Edit Item</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setEditingItem(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-white">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Price ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;