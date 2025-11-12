import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { commerceAPI, chatAPI, labelsAPI } from '../../services/api';
import axios from 'axios';
import config from '../../config/constants';

interface TestResult {
  category: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  timestamp: string;
}

const EnhancedBackendTester: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '!Ch4ng3Th1sP4ssW0rd!' });

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // ========== AUTHENTICATION TESTS ==========
  const testEnhancedAuth = async () => {
    if (!user) {
      try {
        await login(loginForm.username, loginForm.password);
        addResult({
          category: 'Authentication',
          endpoint: '/api/v1/login',
          status: 'success',
          message: 'Enhanced authentication successful'
        });
      } catch (error: any) {
        addResult({
          category: 'Authentication',
          endpoint: '/api/v1/login',
          status: 'error',
          message: `Login failed: ${error.response?.data?.detail || error.message}`
        });
      }
    } else {
      addResult({
        category: 'Authentication',
        endpoint: '/api/v1/login',
        status: 'success',
        message: 'Already authenticated',
        data: user
      });
    }
  };

  const testRegistration = async () => {
    const testUser = {
      username: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testPassword123',
      full_name: 'Test User Enhanced'
    };

    try {
      const response = await axios.post(`${config.apiUrl}/api/v1/register`, testUser);
      addResult({
        category: 'Authentication',
        endpoint: '/api/v1/register',
        status: 'success',
        message: 'Enhanced registration successful',
        data: response.data
      });
    } catch (error: any) {
      addResult({
        category: 'Authentication',
        endpoint: '/api/v1/register',
        status: 'error',
        message: `Registration failed: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  // ========== COMMERCE TESTS ==========
  const testMarketplace = async () => {
    if (!user) {
      addResult({
        category: 'Commerce',
        endpoint: '/api/v1/commerce/designs',
        status: 'error',
        message: 'Must be authenticated first'
      });
      return;
    }

    try {
      const designs = await commerceAPI.designs.getAll();
      addResult({
        category: 'Commerce',
        endpoint: '/api/v1/commerce/designs',
        status: 'success',
        message: `Marketplace loaded (${Array.isArray(designs) ? designs.length : 0} designs)`,
        data: designs
      });
    } catch (error: any) {
      addResult({
        category: 'Commerce',
        endpoint: '/api/v1/commerce/designs',
        status: 'error',
        message: `Marketplace failed: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  const testCreateDesign = async () => {
    if (!user) {
      addResult({
        category: 'Commerce',
        endpoint: 'POST /api/v1/commerce/designs',
        status: 'error',
        message: 'Must be authenticated first'
      });
      return;
    }

    const testDesign = {
      name: `Test Design ${Date.now()}`,
      description: 'A test design created by the enhanced backend tester',
      price: 29.99,
      category: 'mechanical',
      file_url: 'https://example.com/test.stl',
      thumbnail_url: 'https://example.com/test-thumb.jpg'
    };

    try {
      const design = await commerceAPI.designs.create(testDesign);
      addResult({
        category: 'Commerce',
        endpoint: 'POST /api/v1/commerce/designs',
        status: 'success',
        message: 'Design created for sale successfully',
        data: design
      });
    } catch (error: any) {
      addResult({
        category: 'Commerce',
        endpoint: 'POST /api/v1/commerce/designs',
        status: 'error',
        message: `Design creation failed: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  const testShoppingCart = async () => {
    if (!user) {
      addResult({
        category: 'Commerce',
        endpoint: '/api/v1/commerce/cart',
        status: 'error',
        message: 'Must be authenticated first'
      });
      return;
    }

    try {
      // Test get cart
      const cart = await commerceAPI.cart.get();
      addResult({
        category: 'Commerce',
        endpoint: 'GET /api/v1/commerce/cart',
        status: 'success',
        message: `Shopping cart loaded (${Array.isArray(cart) ? cart.length : 0} items)`,
        data: cart
      });

      // Test add to cart
      const testItem = {
        design_id: 'test-design-123',
        name: 'Test Cart Item',
        price: 19.99,
        size: 'Medium',
        color: 'Blue',
        icon: 'fas fa-cube',
        quantity: 1
      };

      const addedItem = await commerceAPI.cart.add(testItem);
      addResult({
        category: 'Commerce',
        endpoint: 'POST /api/v1/commerce/cart',
        status: 'success',
        message: 'Item added to cart successfully',
        data: addedItem
      });
    } catch (error: any) {
      addResult({
        category: 'Commerce',
        endpoint: '/api/v1/commerce/cart',
        status: 'error',
        message: `Cart operations failed: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  // ========== AI CHAT TESTS ==========
  const testChatSessions = async () => {
    if (!user) {
      addResult({
        category: 'AI Chat',
        endpoint: '/api/v1/chat/sessions',
        status: 'error',
        message: 'Must be authenticated first'
      });
      return;
    }

    try {
      // Get existing sessions
      const sessions = await chatAPI.sessions.getAll();
      addResult({
        category: 'AI Chat',
        endpoint: 'GET /api/v1/chat/sessions',
        status: 'success',
        message: `Chat sessions loaded (${Array.isArray(sessions) ? sessions.length : 0} sessions)`,
        data: sessions
      });

      // Create new session
      const newSession = await chatAPI.sessions.create();
      addResult({
        category: 'AI Chat',
        endpoint: 'POST /api/v1/chat/sessions',
        status: 'success',
        message: 'New chat session created',
        data: newSession
      });

      // Send test message
      if (newSession?.id) {
        const response = await chatAPI.messages.send(
          newSession.id, 
          'Hello! This is a test message from the enhanced backend tester.',
          'text'
        );

        addResult({
          category: 'AI Chat',
          endpoint: 'POST /api/v1/chat/sessions/{id}/messages',
          status: 'success',
          message: 'Test message sent to AI successfully',
          data: response
        });
      }
    } catch (error: any) {
      addResult({
        category: 'AI Chat',
        endpoint: '/api/v1/chat/sessions',
        status: 'error',
        message: `Chat operations failed: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  // ========== 3D LABELING TESTS ==========
  const testLabelingSystem = async () => {
    if (!user) {
      addResult({
        category: '3D Labeling',
        endpoint: '/api/v1/labels',
        status: 'error',
        message: 'Must be authenticated first'
      });
      return;
    }

    const testModelId = 1; // Assuming model ID 1 exists

    try {
      // Get existing labels
      const labels = await labelsAPI.getForModel(testModelId);
      addResult({
        category: '3D Labeling',
        endpoint: `GET /api/v1/labels/models/${testModelId}/labels`,
        status: 'success',
        message: `Model labels loaded (${Array.isArray(labels) ? labels.length : 0} labels)`,
        data: labels
      });

      // Create test label
      const testLabel = {
        position_x: 10.5,
        position_y: 15.2,
        position_z: 8.7,
        text: 'Test Label - Base Component',
        category: 'Part' as const
      };

      const newLabel = await labelsAPI.create(testModelId, testLabel);
      addResult({
        category: '3D Labeling',
        endpoint: 'POST /api/v1/labels/models/{id}/labels',
        status: 'success',
        message: 'Test label created successfully',
        data: newLabel
      });

      // Get AI suggestions
      const suggestions = await labelsAPI.getAISuggestions(testModelId);
      addResult({
        category: '3D Labeling',
        endpoint: 'POST /api/v1/labels/models/{id}/ai-suggestions',
        status: 'success',
        message: `AI labeling suggestions received (${Array.isArray(suggestions) ? suggestions.length : 0} suggestions)`,
        data: suggestions
      });
    } catch (error: any) {
      addResult({
        category: '3D Labeling',
        endpoint: '/api/v1/labels',
        status: 'error',
        message: `Labeling operations failed: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  // ========== TEST RUNNERS ==========
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    addResult({ 
      category: 'System', 
      endpoint: 'Test Suite', 
      status: 'pending', 
      message: 'Starting enhanced backend integration tests...' 
    });
    
    await testEnhancedAuth();
    await testRegistration();
    await testMarketplace();
    await testCreateDesign();
    await testShoppingCart();
    await testChatSessions();
    await testLabelingSystem();
    
    addResult({ 
      category: 'System', 
      endpoint: 'Test Suite', 
      status: 'success', 
      message: '✅ All enhanced backend tests completed!' 
    });
    setIsRunning(false);
  };

  const runSelectedTests = async () => {
    setIsRunning(true);
    clearResults();
    
    switch (selectedTest) {
      case 'auth':
        await testEnhancedAuth();
        await testRegistration();
        break;
      case 'commerce':
        await testMarketplace();
        await testCreateDesign();
        await testShoppingCart();
        break;
      case 'chat':
        await testChatSessions();
        break;
      case 'labels':
        await testLabelingSystem();
        break;
      default:
        await runAllTests();
        return;
    }
    
    setIsRunning(false);
  };

  // Group results by category
  const groupedResults = testResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <div className="enhanced-backend-tester" style={{ padding: '20px', maxWidth: '1200px' }}>
      <div className="row">
        <div className="col-12">
          <h2>🚀 Enhanced Backend Integration Tester</h2>
          <div className="alert alert-info">
            <h5>🎉 MAJOR UPDATE: Full Platform Features Available!</h5>
            <p>Your backend now includes:</p>
            <ul className="mb-0">
              <li><strong>✅ Commerce System</strong> - Marketplace, cart, checkout, payouts</li>
              <li><strong>✅ AI Chatbot</strong> - Sessions, message history, model discussions</li>
              <li><strong>✅ 3D Labeling</strong> - Positional annotations with AI suggestions</li>
              <li><strong>✅ Enhanced Auth</strong> - Frontend-compatible registration</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6>Authentication Status</h6>
              {user ? (
                <div className="alert alert-success">
                  <i className="fas fa-user-check me-2"></i>
                  <strong>{user.name}</strong> ({user.email})
                  <button onClick={logout} className="btn btn-outline-danger btn-sm ms-2">Logout</button>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <i className="fas fa-user-slash me-2"></i>
                  Not authenticated
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      className="form-control form-control-sm me-2"
                      style={{ display: 'inline-block', width: 'auto' }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="form-control form-control-sm"
                      style={{ display: 'inline-block', width: 'auto' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6>Test Controls</h6>
              <div className="mb-3">
                <select 
                  className="form-select"
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                >
                  <option value="all">All Tests</option>
                  <option value="auth">Authentication Only</option>
                  <option value="commerce">Commerce System</option>
                  <option value="chat">AI Chatbot</option>
                  <option value="labels">3D Labeling</option>
                </select>
              </div>
              <button
                onClick={runSelectedTests}
                disabled={isRunning}
                className="btn btn-primary me-2"
              >
                {isRunning ? '🔄 Running...' : '🚀 Run Tests'}
              </button>
              <button
                onClick={clearResults}
                className="btn btn-outline-secondary"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h4>Test Results</h4>
          {Object.keys(groupedResults).length === 0 && (
            <div className="alert alert-secondary">
              <i className="fas fa-info-circle me-2"></i>
              No tests run yet. Select a test suite and click "Run Tests" to begin.
            </div>
          )}

          {Object.entries(groupedResults).map(([category, results]) => (
            <div key={category} className="card mb-3">
              <div className="card-header">
                <h5 className="mb-0">
                  {category === 'System' && '⚙️'}
                  {category === 'Authentication' && '🔐'}
                  {category === 'Commerce' && '🛒'}
                  {category === 'AI Chat' && '🤖'}
                  {category === '3D Labeling' && '🏷️'}
                  {' ' + category}
                </h5>
              </div>
              <div className="card-body">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`alert ${
                      result.status === 'success' ? 'alert-success' :
                      result.status === 'error' ? 'alert-danger' : 'alert-info'
                    } mb-2`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">
                            {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}
                          </span>
                          <strong>{result.endpoint}</strong>
                          <small className="text-muted ms-2">{result.timestamp}</small>
                        </div>
                        <div>{result.message}</div>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-muted" style={{ cursor: 'pointer' }}>
                              Show response data
                            </summary>
                            <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBackendTester;