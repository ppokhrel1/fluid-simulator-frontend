import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI } from '~/services/api';

// Enhanced environment variable handling
const getStripePublishableKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
    return process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  }
  
  if (typeof window !== 'undefined' && (window as any).STRIPE_PUBLISHABLE_KEY) {
    return (window as any).STRIPE_PUBLISHABLE_KEY;
  }
  
  console.warn('Using fallback Stripe test key. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your environment.');
  // NOTE: Use your actual test publishable key here or in your .env file
  return 'pk_test_51SOdbLCCJxhpzPUf4KupyJK5ZAj68mvOc8NHVUJXvobdwxBRqSv461w5VP2tzB1GLiQkY4U5Aqu1iVUUhhZzYLL100INISOdLc'; 
};

const stripePromise = loadStripe(getStripePublishableKey());

export interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  cartItems?: any[];
  totalAmount: number;
  isQuickPurchase?: boolean;
  assetData?: {
    id: string;
    name: string;
    price: number;
    type: string;
    file_urls: string[];
  };
  userData?: {
    name?: string;
    email?: string;
  };
}

interface CheckoutFormProps {
  clientSecret: string;
  totalAmount: number;
  cartItems: any[];
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onProcessing: (processing: boolean) => void;
  userData?: {
    name?: string;
    email?: string;
  };
}

// Helper function to parse complex FastAPI/Pydantic validation errors
const parseErrorMessage = (error: any): string => {
    let errorMessage: string;
    if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
            // Flatten Pydantic validation errors (422)
            errorMessage = error.response.data.detail
                .map((e: any) => `${e.loc.length > 1 ? e.loc.slice(1).join('.') : 'API'} - ${e.msg}`)
                .join('; ');
        } else if (typeof error.response.data.detail === 'object') {
            // Handle other generic JSON error details
            errorMessage = JSON.stringify(error.response.data.detail);
        } else {
            // Handle simple string error details
            errorMessage = error.response.data.detail;
        }
    } else {
        errorMessage = error.message || 'Payment failed';
    }
    return errorMessage;
};


// Enhanced Stripe Checkout Form Component
const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  clientSecret, 
  totalAmount, 
  cartItems, 
  onSuccess, 
  onError, 
  onProcessing,
  userData 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
  });

  const handleBillingChange = (field: keyof typeof billingDetails, value: string) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setPaymentError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    onProcessing(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Validate billing details
      if (!billingDetails.name.trim() || !billingDetails.email.trim()) {
        throw new Error('Please fill in all billing details');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingDetails.email)) {
        throw new Error('Please enter a valid email address');
      }

      // 1. Confirm payment with Stripe (Authorization/Capture)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      // 2. If payment is successful/authorized, confirm with our backend
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log("PaymentIntent succeeded:", paymentIntent);
        // This is the call that failed due to double confirmation in the backend.
        // It relies on the backend being fixed to RETRIEVE the intent, not CONFIRM it.
        const confirmation = await paymentAPI.confirmPayment(
          paymentIntent.id,
          paymentIntent.payment_method as string,
          cartItems
        );
        
        onSuccess(confirmation);
      } else {
        // Handle cases like 'requires_action' if not fully successful instantly
        throw new Error(`Payment status: ${paymentIntent?.status || 'unknown'}. Please check your payment details.`);
      }
    } catch (error: any) {
      // 🚨 FIX: Use robust error parsing for backend confirmation errors
      const errorMessage = parseErrorMessage(error);
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
      onProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '10px',
      },
    },
    hidePostalCode: true,
  };

  return (
    <Form onSubmit={handleSubmit}>
      {paymentError && (
        <Alert variant="danger" className="mb-3" dismissible onClose={() => setPaymentError(null)}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {paymentError}
        </Alert>
      )}

      {/* Order Summary */}
      <div className="order-summary mb-4 p-3" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h6 className="text-white mb-3">
          <i className="fas fa-receipt me-2"></i>
          Order Summary
        </h6>
        {cartItems.map((item, index) => (
          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-white-50" style={{ fontSize: '0.9rem' }}>
              {item.name} 
              {item.quantity > 1 && (
                <span className="text-white-50 ms-1">× {item.quantity}</span>
              )}
            </div>
            <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-white">Total Amount</strong>
          <strong className="text-success" style={{ fontSize: '1.2rem' }}>
            ${totalAmount.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* Billing Information */}
      <div className="billing-info mb-4">
        <h6 className="text-white mb-3">
          <i className="fas fa-user me-2"></i>
          Billing Information
        </h6>
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="text-white-50 small">Full Name</Form.Label>
              <Form.Control
                type="text"
                value={billingDetails.name}
                onChange={(e) => handleBillingChange('name', e.target.value)}
                placeholder="Enter your full name"
                disabled={isProcessing}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label className="text-white-50 small">Email Address</Form.Label>
              <Form.Control
                type="email"
                value={billingDetails.email}
                onChange={(e) => handleBillingChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled={isProcessing}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="mb-4">
        <label className="form-label text-white mb-3">
          <i className="fas fa-credit-card me-2"></i>
          Card Details
        </label>
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-4">
        <div className="d-flex align-items-center text-white-50 mb-2">
          <i className="fas fa-lock me-2 text-success"></i>
          <small>Your payment is secure and encrypted</small>
        </div>
        <div className="d-flex align-items-center text-white-50">
          <i className="fas fa-shield-alt me-2 text-warning"></i>
          <small>Protected by Stripe - PCI DSS compliant</small>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || !billingDetails.name || !billingDetails.email}
        className="w-100 py-3"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: 'white',
          cursor: (!stripe || isProcessing || !billingDetails.name || !billingDetails.email) ? 'not-allowed' : 'pointer',
          opacity: (!stripe || isProcessing || !billingDetails.name || !billingDetails.email) ? 0.6 : 1,
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (stripe && !isProcessing && billingDetails.name && billingDetails.email) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (stripe && !isProcessing && billingDetails.name && billingDetails.email) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {isProcessing ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <i className="fas fa-lock me-2"></i>
            Pay ${totalAmount.toFixed(2)}
          </>
        )}
      </button>
    </Form>
  );
};

// Enhanced Main Payment Modal Component
const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  onClose,
  onSuccess,
  cartItems = [],
  totalAmount,
  isQuickPurchase = false,
  assetData,
  userData
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [isProcessing, setIsProcessing] = useState(false);

  const initializePayment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // ⚠️ CRITICAL CHECK: Prevent API call if amount is zero or less
    if (totalAmount <= 0) {
        setError("Invalid payment amount. Please ensure your cart total is greater than $0.00.");
        setIsLoading(false);
        return;
    }

    try {
      let paymentIntentData;
      
      if (isQuickPurchase && assetData) {
        paymentIntentData = await paymentAPI.createPaymentLink(assetData); 
      } else {
        console.log("cartItems being sent to createPaymentIntent:", cartItems);
        paymentIntentData = await paymentAPI.createPaymentIntent(cartItems, totalAmount);
      }
      
      setClientSecret(paymentIntentData.client_secret);
    } catch (error: any) {
      // 🚨 FIX: Use robust error parsing for initialization errors
      const errorMessage = parseErrorMessage(error);
      setError(errorMessage); 
      console.error('Payment initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [show, isQuickPurchase, assetData, cartItems, totalAmount]); // Add totalAmount to dependency array

  useEffect(() => {
    if (show) {
      initializePayment();
    } else {
      setClientSecret(null);
      setError(null);
      setIsLoading(false);
      setIsProcessing(false);
    }
  }, [show, initializePayment]);

  const handlePaymentSuccess = (paymentData: any) => {
    onSuccess(paymentData);
    onClose();
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const handleRetry = () => {
    setError(null);
    initializePayment();
  };

  return (
    <Modal 
      show={show} 
      onHide={isProcessing ? undefined : onClose}
      size="lg" 
      centered 
      backdrop={isProcessing ? 'static' : true}
      keyboard={!isProcessing}
      className="payment-modal"
    >
      <Modal.Header 
        closeButton={!isProcessing}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-credit-card me-3" style={{ color: '#FFD700' }}></i>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              Secure Payment
            </div>
            <small style={{ opacity: 0.9 }}>
              {isQuickPurchase ? 'Quick Purchase' : 'Complete Your Purchase'}
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{
        background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
        padding: '2rem'
      }}>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <div className="mt-3 text-white">Initializing secure payment...</div>
            <small className="text-white-50 mt-2">This may take a few seconds</small>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-white mt-3">Payment Error</h5>
            <p className="text-white-50">{error}</p> 
            <div className="d-flex gap-2 justify-content-center mt-3">
              <button
                onClick={handleRetry}
                className="btn btn-primary"
                style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}
              >
                <i className="fas fa-redo me-2"></i>
                Try Again
              </button>
              <button
                onClick={onClose}
                className="btn btn-outline-light"
                style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
            </div>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              totalAmount={totalAmount}
              cartItems={cartItems}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onProcessing={handleProcessingChange}
              userData={userData}
            />
          </Elements>
        ) : null}

        {/* Payment Methods Logos */}
        {!isLoading && !error && (
          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <small className="text-white-50 mb-2 d-block">We Accept</small>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <i className="fab fa-cc-visa text-white" style={{ fontSize: '2rem' }} title="Visa"></i>
              <i className="fab fa-cc-mastercard text-white" style={{ fontSize: '2rem' }} title="Mastercard"></i>
              <i className="fab fa-cc-amex text-white" style={{ fontSize: '2rem' }} title="American Express"></i>
              <i className="fab fa-cc-discover text-white" style={{ fontSize: '2rem' }} title="Discover"></i>
              <i className="fab fa-cc-stripe text-white" style={{ fontSize: '2rem' }} title="Stripe"></i>
            </div>
          </div>
        )}
      </Modal.Body>

      {/* Footer with additional info */}
      <Modal.Footer style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="w-100 text-center">
          <small className="text-white-50">
            <i className="fas fa-lock me-1"></i>
            All transactions are secured with 256-bit SSL encryption
          </small>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;