import React from 'react';
import { Modal } from 'react-bootstrap';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  size: string;
  color: string;
  icon: string;
  quantity: number;
}

interface CartModalProps {
  show: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ 
  show, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered className="cart-modal">
      <Modal.Header 
        closeButton 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-shopping-cart me-3" style={{ color: '#FFD700', fontSize: '1.5rem' }}></i>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              Shopping Cart
            </div>
            <small style={{ opacity: 0.9, fontSize: '0.85rem' }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body 
        style={{ 
          background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
          padding: '2rem',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}
      >
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-shopping-cart text-white-50" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
            <h4 className="text-white-50 mb-3">Your cart is empty</h4>
            <p className="text-white-50">Browse our store to add items to your cart</p>
            <button 
              className="btn btn-outline-light mt-3"
              onClick={onClose}
              style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-items mb-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="cart-item mb-3 p-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle p-2 me-3" 
                          style={{ 
                            background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                            border: `2px solid ${item.color}30`,
                            minWidth: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i className={item.icon} style={{ color: item.color, fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <h6 className="text-white mb-1" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                            {item.name}
                          </h6>
                          <small className="text-white-50">{item.size}</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <div className="d-flex align-items-center">
                        <button 
                          className="btn btn-sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            width: '30px',
                            height: '30px',
                            padding: 0,
                            borderRadius: '50%'
                          }}
                        >
                          <i className="fas fa-minus" style={{ fontSize: '0.7rem' }}></i>
                        </button>
                        <span className="text-white mx-3" style={{ minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          className="btn btn-sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            width: '30px',
                            height: '30px',
                            padding: 0,
                            borderRadius: '50%'
                          }}
                        >
                          <i className="fas fa-plus" style={{ fontSize: '0.7rem' }}></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <div className="text-center">
                        <div className="text-success fw-bold" style={{ fontSize: '1.1rem' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.originalPrice && (
                          <small className="text-white-50 text-decoration-line-through">
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </small>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <button 
                        className="btn btn-sm"
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          color: '#dc3545',
                          borderRadius: '50%',
                          width: '35px',
                          height: '35px',
                          padding: 0
                        }}
                      >
                        <i className="fas fa-trash" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div 
              className="order-summary p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h5 className="text-white mb-3">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Subtotal ({cartItems.length} items)</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Tax (8%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-white-50">Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              
              <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
              
              <div className="d-flex justify-content-between mb-4">
                <span className="text-white fw-bold" style={{ fontSize: '1.2rem' }}>Total</span>
                <span className="text-success fw-bold" style={{ fontSize: '1.3rem' }}>${total.toFixed(2)}</span>
              </div>
              
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-outline-light flex-fill"
                  onClick={onClose}
                  style={{
                    borderRadius: '50px',
                    padding: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  Continue Shopping
                </button>
                <button 
                  className="btn flex-fill"
                  onClick={onCheckout}
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '50px',
                    padding: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                  }}
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CartModal;