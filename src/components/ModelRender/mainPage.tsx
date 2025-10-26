import React, { useState, useRef, useEffect } from 'react';
import ThreeJSCanvas from '../ModelRender/ThreeJSCanvas';
import ControlsHint from '../ModelRender/ControlsHint';
import Header from '../ModelRender/Header';
import LeftDock from '../ModelRender/LeftDock';
import Chatbot from '../ai_system/chatbot';
import StorePage, { type StoreItem } from '../Store/StorePage';
import SellDesignModal, { type SellDesignFormData } from '../ModelRender/SellDesignModal';
import SalesModal from '../ModelRender/SalesModal';
import AuthModal, { type UserData } from '../Auth/AuthModal';
import CartModal, { type CartItem } from '../Store/CartModal';
import BottomControlDock from '../ModelRender/BottomControlDock';
import PressureLegend from '../ModelRender/PressureLegend';
import type { AppState, ThreeJSActions, FileData, ChatMessage } from '../../types';
import { sendMessageToAI } from '../ai_system/aiAdapter';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const MainPageApp: React.FC = () => {
  // Helper functions for localStorage persistence
  const saveStateToStorage = (state: AppState, hasFile: boolean, userData: UserData | null) => {
    try {
      const stateToSave = {
        ...state,
        // Don't save chat messages as they can get large and are not essential
        chatMessages: state.chatMessages.slice(-5), // Keep only last 5 messages
      };
      localStorage.setItem('curfd-app-state', JSON.stringify(stateToSave));
      localStorage.setItem('curfd-has-uploaded-file', JSON.stringify(hasFile));
      if (userData) {
        localStorage.setItem('curfd-user-data', JSON.stringify(userData));
      } else {
        localStorage.removeItem('curfd-user-data');
      }
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  };

  const loadStateFromStorage = () => {
    try {
      const savedState = localStorage.getItem('curfd-app-state');
      const savedHasFile = localStorage.getItem('curfd-has-uploaded-file');
      const savedUser = localStorage.getItem('curfd-user-data');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Merge with default state to ensure all properties exist
        return {
          state: {
            leftDockExpanded: false,
            isTyping: false,
            chatMessages: [
              {
                type: 'ai',
                content: 'Hello! I\'m CURFD AI. Upload a 3D model to begin CFD analysis.',
                time: new Date().toLocaleTimeString()
              }
            ],
            selectedAiModel: 'gpt-4-turbo',
            uploadedFiles: [],
            status: 'Ready for analysis',
            gridVisible: true,
            autoRotateEnabled: false,
            view: 'main',
            ...parsedState
          } as AppState,
          hasFile: savedHasFile ? JSON.parse(savedHasFile) : false,
          user: savedUser ? JSON.parse(savedUser) : null
        };
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
    
    return {
      state: {
        leftDockExpanded: false,
        isTyping: false,
        chatMessages: [
          {
            type: 'ai',
            content: 'Hello! I\'m CURFD AI. Upload a 3D model to begin CFD analysis.',
            time: new Date().toLocaleTimeString()
          }
        ],
        selectedAiModel: 'gpt-4-turbo',
        uploadedFiles: [],
        status: 'Ready for analysis',
        gridVisible: true,
        autoRotateEnabled: false,
        view: 'main'
      } as AppState,
      hasFile: false,
      user: null
    };
  };

  // Load initial state from localStorage
  const initialStateData = loadStateFromStorage();
  const [appState, setAppState] = useState<AppState>(initialStateData.state);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserData | null>(initialStateData.user);
  const [loginSource, setLoginSource] = useState<'header' | 'sellDesign'>('header');
  const [hasUploadedFile, setHasUploadedFile] = useState(initialStateData.hasFile);
  const [controlsHintTop, setControlsHintTop] = useState<number>(0);
  const [wasRefreshedInStore, setWasRefreshedInStore] = useState(initialStateData.state.view === 'store' && initialStateData.hasFile);
  const threeRef = useRef<ThreeJSActions>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  // Save state to localStorage whenever appState, hasUploadedFile, or user changes
  useEffect(() => {
    saveStateToStorage(appState, hasUploadedFile, user);
  }, [appState, hasUploadedFile, user]);

  // Restore 3D model and other state after component mounts
  useEffect(() => {
    const restoreState = async () => {
      console.log('RestoreState - hasUploadedFile:', hasUploadedFile, 'view:', appState.view, 'uploadedFiles:', appState.uploadedFiles);
      
      // Small delay to ensure ThreeJS canvas is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (hasUploadedFile) {
        if (appState.uploadedFiles.length > 0) {
          const fileInfo = appState.uploadedFiles[0];
          console.log('Attempting to restore file:', fileInfo.name, 'in view:', appState.view);
          
          if (appState.view === 'main') {
            updateAppState({ status: 'Restoring previous model...' });
            
            // Since we can't actually restore the 3D model after refresh, 
            // prompt user to re-upload
            setTimeout(() => {
              updateAppState({ 
                status: `Please re-upload ${fileInfo.name} to continue analysis` 
              });
              setHasUploadedFile(false);
              updateAppState({ uploadedFiles: [] });
            }, 2000);
          }
        }
      }
    };

    restoreState();
  }, []);

  // Watch for view changes 
  useEffect(() => {
    console.log('View changed to:', appState.view, 'hasUploadedFile:', hasUploadedFile);
    
    // When switching to main view, check if we need to handle file restoration
    if (appState.view === 'main' && hasUploadedFile && appState.uploadedFiles.length > 0) {
      const fileInfo = appState.uploadedFiles[0];
      console.log('In main view with file info:', fileInfo.name);
      
      // Give the ThreeJS canvas a moment to be ready, then check if model is actually loaded
      setTimeout(() => {
        // Since we can't reliably detect if the 3D model is actually loaded after a refresh,
        // we'll prompt the user to re-upload when we have file metadata but potentially no loaded model
        if (wasRefreshedInStore) {
          console.log('Was refreshed in store, prompting re-upload');
          setWasRefreshedInStore(false);
          updateAppState({ 
            status: `Session restored. Please re-upload ${fileInfo.name} to continue analysis.` 
          });
          
          setTimeout(() => {
            setHasUploadedFile(false);
            updateAppState({ 
              uploadedFiles: [],
              status: 'Ready for analysis'
            });
          }, 3000);
        }
      }, 500);
    }
  }, [appState.view]);

  const handleThreeAction = (action: keyof ThreeJSActions, data?: any) => {
    console.log(`Three action: ${action}`, data);
    if (threeRef.current && threeRef.current[action]) {
      (threeRef.current[action] as Function)(data);
    } else {
      console.warn(`Three action ${action} not available`);
    }
  };

  const handleSendMessage = async (message: string, file?: File) => {
    const newMessage: ChatMessage = {
      type: 'user',
      content: message || (file ? `Uploaded ${file.name}` : ''),
      time: new Date().toLocaleTimeString()
    };

    // optimistically add user message and show typing
    updateAppState({
      chatMessages: [...appState.chatMessages, newMessage],
      isTyping: true
    });

    // forward to ThreeJS processor if a file was uploaded or the message relates to the scene
    if (file) {
      handleThreeAction('loadFile', file);
      setHasUploadedFile(true); // ensure UI updates when uploaded from chat panel
      
      // Update app state with file information
      updateAppState({ 
        status: `Loading ${file.name}...`,
        uploadedFiles: [{ 
          name: file.name, 
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          color: '#4CAF50',
          icon: 'fas fa-cube'
        }]
      });
    }
    handleThreeAction('processMessage', { message, file });

    // call AI adapter (pluggable). If no API configured the adapter returns a helpful placeholder reply.
    let aiReplyText = '';
    try {
      aiReplyText = await sendMessageToAI(message, file, appState.selectedAiModel);
    } catch (err: any) {
      aiReplyText = `[AI error] ${err?.message || String(err)}`;
    }

    const aiResponse: ChatMessage = {
      type: 'ai',
      content: aiReplyText,
      time: new Date().toLocaleTimeString()
    };

    updateAppState({
      chatMessages: [...appState.chatMessages, newMessage, aiResponse],
      isTyping: false
    });
  };

  const handleFileSelect = (file: FileData) => {
    updateAppState({ status: `Loading ${file.name}...` });
    setTimeout(() => {
      updateAppState({ status: `${file.name} loaded - Analysis ready` });
    }, 1000);
  };

  const handleUploadModel = () => {
    console.log('Upload button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed', e.target.files);
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleThreeAction('loadFile', file);
      setHasUploadedFile(true); // Track that a file has been uploaded
      
      // Update app state with file information
      updateAppState({ 
        status: `Loading ${file.name}...`,
        uploadedFiles: [{ 
          name: file.name, 
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          color: '#4CAF50',
          icon: 'fas fa-cube'
        }]
      });
      
      // Update status after load
      setTimeout(() => {
        updateAppState({ status: `${file.name} loaded - Analysis ready` });
      }, 1000);
      
      // Reset the input to allow uploading the same file again
      e.target.value = '';
    }
  };

  // Position the ControlsHint just below the chatbot dynamically
  useEffect(() => {
    const updatePosition = () => {
      const el = chatContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // place with 12px gap below the chat container
      setControlsHintTop(rect.top + rect.height + 12);
    };

    updatePosition();

    // Observe resize of the chat container to keep placement correct
    const el = chatContainerRef.current;
    let ro: ResizeObserver | null = null;
    if (el && 'ResizeObserver' in window) {
      ro = new ResizeObserver(updatePosition);
      ro.observe(el);
    }
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      if (ro && el) ro.unobserve(el);
    };
  }, []);

  const handleResetView = () => {
    console.log('Reset view called');
    handleThreeAction('resetCamera');
  };

  const handleToggleGrid = () => {
    const newGridVisible = !appState.gridVisible;
    updateAppState({ gridVisible: newGridVisible });
    handleThreeAction('toggleGrid');
  };

  const handleAutoRotate = () => {
    const newAutoRotate = !appState.autoRotateEnabled;
    updateAppState({ autoRotateEnabled: newAutoRotate });
    handleThreeAction('toggleAutoRotate');
  };

  const handleSalesClick = () => {
    if (user) {
      // User is authenticated, show sales dashboard
      setShowSalesModal(true);
    } else {
      // User not authenticated, show auth modal first
      setShowAuthModal(true);
    }
  };

  const handleSellDesignClick = () => {
    if (user) {
      // User is authenticated, check if they have uploaded a file
      if (hasUploadedFile && appState.uploadedFiles.length > 0) {
        // User has uploaded file(s), show sell design modal
        setShowSellModal(true);
      } else {
        // User is logged in but hasn't uploaded any design yet
        updateAppState({ 
          status: 'Please upload a 3D design file first before listing it for sale. Opening file picker...' 
        });
        // Trigger file upload after showing message
        setTimeout(() => {
          fileInputRef.current?.click();
        }, 2000);
      }
    } else {
      // User not authenticated, show auth modal first
      setLoginSource('sellDesign');
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    setShowAuthModal(false);
    updateAppState({ 
      status: `Welcome ${userData.firstName}! You can now access your sales dashboard.` 
    });
    // Show sell modal after successful authentication for first-time users
    setTimeout(() => {
      setShowSellModal(true);
    }, 500);
  };

  const handleHeaderAuthSuccess = (userData: UserData) => {
    setUser(userData);
    setShowAuthModal(false);
    updateAppState({ 
      status: `Welcome ${userData.firstName}! Logged in successfully.` 
    });
    // Don't show sell modal - just complete the login
  };

  const handleSellDesignSubmit = (formData: SellDesignFormData) => {
    console.log('Design submitted for sale:', formData, 'by user:', user);
    // TODO: Implement API call to backend to save the design listing with user information
    updateAppState({ 
      status: `${formData.designName} listed successfully! It will be reviewed and published soon.` 
    });
  };

  const handleLogout = () => {
    setUser(null);
    updateAppState({ status: 'Logged out successfully.' });
  };

  const handleSalesModalUpload = () => {
    // Close the sales modal first
    setShowSalesModal(false);
    // Switch to main view if not already there
    updateAppState({ 
      view: 'main',
      status: 'Select a 3D file to upload and analyze...'
    });
    // Trigger the file input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 300);
  };

  // Cart handling functions
  const handleAddToCart = (item: StoreItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        const newCartItem: CartItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          size: item.size || '0 MB',
          color: item.color,
          icon: item.icon,
          quantity: 1
        };
        return [...prevItems, newCartItem];
      }
    });
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    alert('Checkout functionality will be implemented in the next phase!');
    setShowCartModal(false);
  };

  // Handle viewing an item from the store
  const handleViewItem = (item: StoreItem) => {
    console.log('Viewing item:', item);
    
    // Switch back to main view to show the 3D model
    updateAppState({ 
      view: 'main',
      status: `Previewing ${item.name} - ${item.description || 'Premium 3D design'}`
    });
    
    // Simulate loading the 3D model for preview
    // In a real implementation, you would load the actual 3D file here
    setTimeout(() => {
      updateAppState({ 
        status: `${item.name} loaded successfully! This is a preview - purchase to download the full model.`
      });
    }, 1000);
    
    // You could also trigger the ThreeJS canvas to load a preview version
    // or show a modal with more details about the item
  };

  return (
    <div className="app vh-100 vw-100 p-0 m-0 bg-dark overflow-hidden">
      {/* Header with CURFD branding */}
      <div className="fixed-top d-flex align-items-center px-4 py-2" style={{ 
        zIndex: 1050, 
        background: 'var(--chat-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--chat-border)'
      }}>
        <div className="d-flex align-items-center gap-3">
          <img src="/curfdlogo.png" alt="CURFD" style={{ height: '40px', filter: 'brightness(1.2) contrast(1.1)' }} />
          <div className="d-flex flex-column">
            <strong className="text-white" style={{ fontSize: '1.2rem' }}>CURFD</strong>
            <small className="text-white-50">V3 - Advanced AI CFD Engine</small>
          </div>
        </div>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-white-50">{appState.status}</span>
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className="d-flex flex-column">
                <small className="text-white" style={{ fontSize: '0.8rem', lineHeight: 1 }}>
                  {user.firstName} {user.lastName}
                </small>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '0.7rem',
                    padding: 0,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    lineHeight: 1
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginSource('header');
                setShowAuthModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                fontSize: '0.9rem',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Fullscreen 3D - Always mounted but hidden when in store view */}
      <div 
        className="position-fixed inset-0 w-100 h-100" 
        style={{ 
          top: '60px',
          opacity: appState.view === 'main' ? 1 : 0,
          pointerEvents: appState.view === 'main' ? 'auto' : 'none',
          zIndex: appState.view === 'main' ? 1 : -1
        }}
      >
        <ThreeJSCanvas 
          ref={threeRef}
          onStateUpdate={updateAppState}
          appState={appState}
        />
      </div>

      {/* Store Page - Overlay when in store view */}
      {appState.view === 'store' && (
        <StorePage 
          onBack={() => updateAppState({ view: 'main' })}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onShowCart={() => setShowCartModal(true)}
          onViewItem={handleViewItem}
        />
      )}

      {/* Floating Chatbot Panel */}
      <div ref={chatContainerRef} className="position-fixed" style={{ top: '76px', right: '16px', width: '400px', zIndex: 1040 }}>
        <Chatbot 
          onSendMessage={handleSendMessage}
          selectedModel={appState.selectedAiModel}
          onModelChange={(model) => updateAppState({ selectedAiModel: model })}
        />
      </div>

      {/* Controls hint overlay - placed below the chatbot, persistent while a file is uploaded - Only show in main view */}
      <ControlsHint 
        visible={hasUploadedFile && appState.view === 'main'} 
        onClose={() => { /* persistent - no dismiss */ }}
        placement={{ top: controlsHintTop, right: 16 }}
      />

      {/* Floating Action Buttons */}
      <div className="fab-container">
        {appState.view === 'main' ? (
          <>
            <button
              className="fab-button"
              onClick={() => updateAppState({ view: 'store' })}
            >
              Store
            </button>

            <button
              className={`fab-button ${appState.gridVisible ? 'active' : ''}`}
              onClick={handleToggleGrid}
            >
              Grid
            </button>

            <button
              className={`fab-button ${appState.autoRotateEnabled ? 'active' : ''}`}
              onClick={handleAutoRotate}
            >
              Auto Rotate
            </button>

            <button
              className="fab-button"
              onClick={handleResetView}
            >
              Reset View
            </button>

            <button
              className="fab-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </button>

            <button
              className="fab-button"
              onClick={() => handleThreeAction('takeScreenshot')}
            >
              Screenshot
            </button>

            {user && (
              <>
                <button
                  className="fab-button"
                  onClick={handleSalesClick}
                  style={{ 
                    minWidth: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Sales</span>
                </button>
                <button
                  className="fab-button"
                  onClick={handleSellDesignClick}
                  style={{ 
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    whiteSpace: 'nowrap',
                    ...(hasUploadedFile && appState.uploadedFiles.length > 0 ? {
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: '2px solid #10B981',
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
                      transform: 'scale(1.02)'
                    } : {
                      opacity: 0.7
                    })
                  }}
                  title={hasUploadedFile && appState.uploadedFiles.length > 0 ? 
                    `Sell "${appState.uploadedFiles[appState.uploadedFiles.length - 1]?.name}"` : 
                    'Upload a design file first to enable selling'
                  }
                >
                  <span style={{ color: '#FFD700', fontSize: '1.1rem', fontWeight: 'bold' }}>$</span>
                  <span>Sell Design</span>
                </button>
              </>
            )}
            {hasUploadedFile && !user && (
              <button
                className="fab-button"
                onClick={handleSellDesignClick}
                style={{ 
                  minWidth: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: '#FFD700', fontSize: '1.1rem', fontWeight: 'bold' }}>$</span>
                <span>Sell Design</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="fab-button"
              onClick={() => updateAppState({ view: 'main' })}
            >
              Back
            </button>
            <button
              className="fab-button"
              onClick={() => console.log('Sort by price')}
            >
              Sort by Price
            </button>
            <button
              className="fab-button"
              onClick={() => console.log('Filter')}
            >
              Filter
            </button>
            <button
              className="fab-button"
              onClick={() => setShowCartModal(true)}
              style={{ position: 'relative' }}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Cart
              {cartItems.length > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{
                    background: '#dc3545',
                    fontSize: '0.7rem',
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </>
        )}
      </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept=".stl,.obj,.step,.stp,.iges,.glb"
          onChange={handleFileInputChange}
        />

        {/* Pressure Distribution Legend - Only show in main view */}
        {appState.view === 'main' && (
          <div className="position-fixed start-0 ms-4 rounded chat-container" 
               style={{ 
                 zIndex: 1040, 
                 top: '50%', 
                 transform: 'translateY(-50%)',
                 padding: '1.25rem',
                 background: 'rgba(0, 0, 0, 0.7)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255, 255, 255, 0.1)'
               }}>
              <div className="d-flex align-items-center gap-3">
                {/* Scale markings */}
                <div className="d-flex flex-column justify-content-between" style={{ height: '260px' }}>
                  <div className="text-white-50" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                    100 kPa
                  </div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                    75
                  </div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                    50
                  </div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                    25
                  </div>
                  <div className="text-white-50" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                    0 kPa
                  </div>
                </div>

                {/* Gradient bar with labels */}
                <div className="d-flex flex-column align-items-center gap-2">
                  <div className="text-white small mb-1 fw-bold">
                    High
                  </div>

                  <div
                    style={{
                      width: '32px',
                      height: '220px',
                      background: 'linear-gradient(to bottom, #F44336, #FFC107, #4CAF50)',
                      borderRadius: '14px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.4) inset, 0 4px 12px rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.08)',
                      position: 'relative'
                    }}
                  >
                    {/* Tick marks */}
                    <div style={{ position: 'absolute', left: '-8px', top: '0', width: '8px', height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    <div style={{ position: 'absolute', left: '-8px', top: '25%', width: '8px', height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    <div style={{ position: 'absolute', left: '-8px', top: '50%', width: '8px', height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    <div style={{ position: 'absolute', left: '-8px', top: '75%', width: '8px', height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    <div style={{ position: 'absolute', left: '-8px', bottom: '0', width: '8px', height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                  </div>

                  <div className="text-white small mt-1 fw-bold">
                    Low
                  </div>
                </div>
              </div>

              {/* Horizontal caption for easier reading */}
              <div className="text-white-50 small text-center mt-3" style={{ width: '140px' }}>
                Pressure Distribution
              </div>
          </div>
        )}

      {/* Sell Design Modal */}
      <SellDesignModal
        show={showSellModal}
        onClose={() => setShowSellModal(false)}
        onSubmit={handleSellDesignSubmit}
        uploadedFile={appState.uploadedFiles.length > 0 ? {
          ...appState.uploadedFiles[appState.uploadedFiles.length - 1],
          size: (appState.uploadedFiles[appState.uploadedFiles.length - 1] as any).size || 'Unknown size'
        } : undefined}
      />

      {/* Sales Dashboard Modal */}
      <SalesModal
        show={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        user={user}
        onUploadDesign={handleSalesModalUpload}
      />

      {/* Authentication Modal */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={loginSource === 'header' ? handleHeaderAuthSuccess : handleAuthSuccess}
        initialMode="signup"
      />

      {/* Cart Modal */}
      <CartModal
        show={showCartModal}
        onClose={() => setShowCartModal(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default MainPageApp;