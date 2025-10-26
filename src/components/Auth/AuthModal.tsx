import React, { useState } from 'react';
import { Modal, Form, Alert } from 'react-bootstrap';
import { localDB } from '../../services/localStorageDB';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: UserData) => void;
  initialMode?: 'login' | 'signup';
}

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, onAuthSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Common input styles
  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '8px'
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use localDB for authentication
      const user = await localDB.loginUser(loginData.email, loginData.password);
      
      const userData: UserData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username
      };

      onAuthSuccess(userData);
      onClose();
      
      // Reset form
      setLoginData({ email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!signupData.agreeToTerms) {
      setError('Please agree to the terms and conditions.');
      return;
    }

    setIsLoading(true);

    try {
      // Use localDB for registration
      const user = await localDB.registerUser({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        username: signupData.username,
        email: signupData.email,
        password: signupData.password
      });
      
      const userData: UserData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username
      };

      onAuthSuccess(userData);
      onClose();
      
      // Reset form
      setSignupData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github' | 'linkedin') => {
    setError('');
    setIsLoading(true);

    try {
      // Simulate social login API call - replace with actual OAuth integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful social login with provider-specific data
      const providerData = {
        google: { firstName: 'John', lastName: 'Smith', email: 'john.smith@gmail.com' },
        facebook: { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@facebook.com' },
        github: { firstName: 'Dev', lastName: 'User', email: 'dev.user@github.com' },
        linkedin: { firstName: 'Professional', lastName: 'User', email: 'professional.user@linkedin.com' }
      };

      const data = providerData[provider];
      const userData: UserData = {
        id: `${provider}_` + Date.now(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.email.split('@')[0]
      };

      onAuthSuccess(userData);
      onClose();
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <>
      <style>
        {`
          .auth-modal input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
            opacity: 1;
          }
          .auth-modal .social-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0.9;
          }
          .auth-modal .social-btn:active:not(:disabled) {
            transform: translateY(0px);
          }
          .auth-modal .social-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>
      <Modal show={show} onHide={onClose} centered backdrop="static" className="auth-modal">
        <Modal.Header 
          closeButton 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          <Modal.Title className="d-flex align-items-center w-100">
            <img 
              src="/curfdlogo.png" 
              alt="CURFD" 
              style={{ 
                height: '40px', 
                marginRight: '1rem',
                filter: 'brightness(1.2) contrast(1.1)' 
              }} 
            />
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <i className={`fas ${mode === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'}`} style={{ color: '#FFD700', marginRight: '0.5rem' }}></i>
                {mode === 'login' ? 'Welcome Back' : 'Join CURFD'}
              </div>
              <small style={{ opacity: 0.9, fontSize: '0.85rem' }}>
                {mode === 'login' ? 'Sign in to your account' : 'Create your account to start selling'}
              </small>
            </div>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body 
          style={{ 
            background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
            padding: '2rem'
          }}
        >
          {error && (
            <Alert variant="danger" style={{ 
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              color: '#ff6b6b'
            }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {mode === 'login' ? (
            <Form onSubmit={handleLoginSubmit}>
              <div 
                className="alert mb-4" 
                style={{ 
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '8px',
                  color: '#a8b3ff'
                }}
              >
                <i className="fas fa-info-circle me-2"></i>
                Sign in to access the marketplace and start selling your designs.
              </div>

              {/* Social Media Login Buttons */}
              <div className="mb-4">
                <div className="text-center mb-4">
                  <div style={{ 
                    color: '#b0b0b0', 
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    letterSpacing: '0.5px'
                  }}>
                    Sign in with your social account
                  </div>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(219, 68, 55, 0.1)',
                          border: '1px solid rgba(219, 68, 55, 0.3)',
                          color: '#db4437',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-google" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        Google
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(66, 103, 178, 0.1)',
                          border: '1px solid rgba(66, 103, 178, 0.3)',
                          color: '#4267B2',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-facebook-f" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        Facebook
                      </button>
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('github')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-github" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        GitHub
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('linkedin')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(0, 119, 181, 0.1)',
                          border: '1px solid rgba(0, 119, 181, 0.3)',
                          color: '#0077B5',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-linkedin-in" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="d-flex align-items-center my-5">
                  <hr style={{ 
                    flex: 1, 
                    border: 'none',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)' 
                  }} />
                  <span className="px-4" style={{ 
                    color: '#b0b0b0', 
                    fontSize: '0.85rem',
                    fontWeight: '400',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}>
                    or continue with email
                  </span>
                  <hr style={{ 
                    flex: 1, 
                    border: 'none',
                    height: '1px',
                    background: 'linear-gradient(to left, transparent, rgba(255, 255, 255, 0.2), transparent)' 
                  }} />
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your email"
                  style={inputStyle}
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your password"
                  style={inputStyle}
                  className="form-control-lg"
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center gap-3">
                <button 
                  type="button"
                  className="btn btn-outline-light" 
                  onClick={onClose}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontWeight: '500',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    flex: 2,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  className="btn"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <span style={{ color: '#888' }}>Don't have an account? </span>
                <button 
                  type="button"
                  onClick={toggleMode}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Sign up here
                </button>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleSignupSubmit}>
              <div 
                className="alert mb-4" 
                style={{ 
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '8px',
                  color: '#a8b3ff'
                }}
              >
                <i className="fas fa-rocket me-2"></i>
                Join thousands of creators earning from their designs on CURFD.
              </div>

              {/* Social Media Signup Buttons */}
              <div className="mb-4">
                <div className="text-center mb-4">
                  <div style={{ 
                    color: '#b0b0b0', 
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    letterSpacing: '0.5px'
                  }}>
                    Quick signup with your social account
                  </div>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(219, 68, 55, 0.1)',
                          border: '1px solid rgba(219, 68, 55, 0.3)',
                          color: '#db4437',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-google" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        Google
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(66, 103, 178, 0.1)',
                          border: '1px solid rgba(66, 103, 178, 0.3)',
                          color: '#4267B2',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-facebook-f" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        Facebook
                      </button>
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('github')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-github" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        GitHub
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                      onClick={() => handleSocialLogin('linkedin')}
                        disabled={isLoading}
                        className="btn w-100 social-btn d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(0, 119, 181, 0.1)',
                          border: '1px solid rgba(0, 119, 181, 0.3)',
                          color: '#0077B5',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          minHeight: '45px'
                        }}
                      >
                        <i className="fab fa-linkedin-in" style={{ fontSize: '1.1rem', marginRight: '8px' }}></i>
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="d-flex align-items-center my-5">
                  <hr style={{ 
                    flex: 1, 
                    border: 'none',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)' 
                  }} />
                  <span className="px-4" style={{ 
                    color: '#b0b0b0', 
                    fontSize: '0.85rem',
                    fontWeight: '400',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}>
                    or create account with email
                  </span>
                  <hr style={{ 
                    flex: 1, 
                    border: 'none',
                    height: '1px',
                    background: 'linear-gradient(to left, transparent, rgba(255, 255, 255, 0.2), transparent)' 
                  }} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={signupData.firstName}
                      onChange={handleSignupChange}
                      required
                      placeholder="First name"
                      style={inputStyle}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                      Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      required
                      placeholder="Last name"
                      style={inputStyle}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  required
                  placeholder="Choose a username"
                  style={inputStyle}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your email"
                  style={inputStyle}
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      required
                      placeholder="Create password"
                      style={inputStyle}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#e0e0e0', fontWeight: '500' }}>
                      Confirm Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      required
                      placeholder="Confirm password"
                      style={inputStyle}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="agreeToTerms"
                  checked={signupData.agreeToTerms}
                  onChange={handleSignupChange}
                  required
                  label={
                    <span style={{ color: '#e0e0e0' }}>
                      I agree to the <span style={{ color: '#667eea', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#667eea', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
                    </span>
                  }
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center gap-3">
                <button 
                  type="button"
                  className="btn btn-outline-light" 
                  onClick={onClose}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontWeight: '500',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    flex: 2,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  className="btn"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <span style={{ color: '#888' }}>Already have an account? </span>
                <button 
                  type="button"
                  onClick={toggleMode}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Sign in here
                </button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Social Media Button Enhanced Styles */}
      <style>
        {`
          .social-btn {
            position: relative;
            overflow: hidden;
          }
          
          .social-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          }
          
          .social-btn:hover:not(:disabled):before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            pointer-events: none;
          }
          
          .social-btn:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }
          
          .social-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .social-btn i {
            transition: transform 0.2s ease;
          }
          
          .social-btn:hover:not(:disabled) i {
            transform: scale(1.1);
          }
        `}
      </style>
    </>
  );
};

export default AuthModal;