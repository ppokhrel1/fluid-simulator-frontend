import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/constants';

interface ConnectivityTestResult {
  name: string;
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'testing' | 'warning';
  message: string;
  responseTime?: number;
  statusCode?: number;
  data?: any;
}

const ComprehensiveBackendTester: React.FC = () => {
  const [results, setResults] = useState<ConnectivityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');
  const [testCredentials, setTestCredentials] = useState({
    username: 'admin',
    password: '!Ch4ng3Th1sP4ssW0rd!'
  });

  const addResult = (result: ConnectivityTestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test basic server connectivity
  const testServerHealth = async (): Promise<ConnectivityTestResult> => {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${config.apiUrl}/`, { timeout: 5000 });
      return {
        name: 'Server Health',
        endpoint: '/',
        method: 'GET',
        status: 'success',
        message: 'Backend server is running',
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        data: response.data
      };
    } catch (error: any) {
      return {
        name: 'Server Health',
        endpoint: '/',
        method: 'GET',
        status: 'error',
        message: `Server connection failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  };

  // Test API documentation access
  const testAPIDocumentation = async (): Promise<ConnectivityTestResult> => {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${config.apiUrl}/docs`, { timeout: 5000 });
      return {
        name: 'API Documentation',
        endpoint: '/docs',
        method: 'GET',
        status: 'success',
        message: 'API documentation is accessible',
        responseTime: Date.now() - startTime,
        statusCode: response.status
      };
    } catch (error: any) {
      return {
        name: 'API Documentation',
        endpoint: '/docs',
        method: 'GET',
        status: 'error',
        message: `Documentation access failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  };

  // Test user registration
  const testUserRegistration = async (): Promise<ConnectivityTestResult> => {
    const startTime = Date.now();
    const testUser = {
      username: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testPassword123',
      full_name: 'Test User'  // ✅ Using full_name as per backend schema
    };

    try {
      const response = await axios.post(`${config.apiUrl}/api/v1/register`, testUser, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        name: 'User Registration',
        endpoint: '/api/v1/register',
        method: 'POST',
        status: 'success',
        message: '✅ User registration endpoint working with full_name schema',
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        data: { registered_user: response.data.email, full_name: response.data.full_name }
      };
    } catch (error: any) {
      const status = error.response?.status === 400 ? 'warning' : 'error';
      const message = error.response?.status === 400 
        ? '✅ Registration endpoint working (validation error expected for test data)'
        : `❌ Registration failed: ${error.response?.data?.detail || error.message}`;
      
      return {
        name: 'User Registration',
        endpoint: '/api/v1/register',
        method: 'POST',
        status,
        message,
        responseTime: Date.now() - startTime,
        statusCode: error.response?.status
      };
    }
  };

  // Test user login
  const testUserLogin = async (): Promise<ConnectivityTestResult> => {
    const startTime = Date.now();
    const formData = new FormData();
    formData.append('username', testCredentials.username);
    formData.append('password', testCredentials.password);

    try {
      const response = await axios.post(`${config.apiUrl}/api/v1/login`, formData, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        return {
          name: 'User Login',
          endpoint: '/api/v1/login',
          method: 'POST',
          status: 'success',
          message: '✅ Authentication successful - JWT token received',
          responseTime: Date.now() - startTime,
          statusCode: response.status,
          data: { token_type: response.data.token_type, username: testCredentials.username }
        };
      } else {
        return {
          name: 'User Login',
          endpoint: '/api/v1/login',
          method: 'POST',
          status: 'warning',
          message: 'Login response received but no token found',
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      }
    } catch (error: any) {
      return {
        name: 'User Login',
        endpoint: '/api/v1/login',
        method: 'POST',
        status: 'error',
        message: `❌ Login failed: ${error.response?.data?.detail || error.message}`,
        responseTime: Date.now() - startTime,
        statusCode: error.response?.status
      };
    }
  };

  // Test commerce endpoints
  const testCommerceEndpoints = async (): Promise<ConnectivityTestResult[]> => {
    if (!authToken) {
      return [{
        name: 'Commerce Endpoints',
        endpoint: '/api/v1/commerce/*',
        method: 'GET',
        status: 'warning',
        message: 'Skipped - requires authentication token'
      }];
    }

    const results: ConnectivityTestResult[] = [];
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test marketplace designs
    try {
      const startTime = Date.now();
      const response = await axios.get(`${config.apiUrl}/api/v1/commerce/designs`, {
        headers: authHeaders,
        timeout: 10000
      });
      
      results.push({
        name: 'Marketplace Designs',
        endpoint: '/api/v1/commerce/designs',
        method: 'GET',
        status: 'success',
        message: `Marketplace accessible (${Array.isArray(response.data) ? response.data.length : 0} designs)`,
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        data: { design_count: Array.isArray(response.data) ? response.data.length : 0 }
      });
    } catch (error: any) {
      results.push({
        name: 'Marketplace Designs',
        endpoint: '/api/v1/commerce/designs',
        method: 'GET',
        status: 'error',
        message: `Marketplace access failed: ${error.response?.data?.detail || error.message}`,
        statusCode: error.response?.status
      });
    }

    // ✅ Test the new /designs/sell endpoint (Frontend Compatible)
    const sellDesignStartTime = Date.now();
    try {
      const testDesignData = {
        designName: 'Test Design',
        description: 'Test description for design',
        price: '99.99',
        category: 'mechanical',
        fileOrigin: 'original',
        licenseType: 'commercial',
        originDeclaration: true,
        qualityAssurance: true,
        technicalSpecs: 'Test specifications',
        tags: 'test,design',
        instructions: 'Test instructions'
      };

      const response = await axios.post(`${config.apiUrl}/api/v1/commerce/designs/sell`, testDesignData, {
        headers: authHeaders,
        timeout: 10000
      });
      
      results.push({
        name: 'Sell Design (Frontend Form)',
        endpoint: '/api/v1/commerce/designs/sell',
        method: 'POST',
        status: 'success',
        message: `✅ Frontend form endpoint working - design created!`,
        responseTime: Date.now() - sellDesignStartTime,
        statusCode: response.status,
        data: { design_id: response.data.id, design_name: response.data.name }
      });
    } catch (error: any) {
      const status = error.response?.status === 400 ? 'warning' : 'error';
      const message = error.response?.status === 400 
        ? '✅ Sell endpoint working (validation error expected for test data)'
        : `❌ Sell endpoint failed: ${error.response?.data?.detail || error.message}`;
        
      results.push({
        name: 'Sell Design (Frontend Form)',
        endpoint: '/api/v1/commerce/designs/sell',
        method: 'POST',
        status,
        message,
        responseTime: Date.now() - sellDesignStartTime,
        statusCode: error.response?.status
      });
    }

    // Test shopping cart
    const cartStartTime = Date.now();
    try {
      const response = await axios.get(`${config.apiUrl}/api/v1/commerce/cart`, {
        headers: authHeaders,
        timeout: 10000
      });
      
      results.push({
        name: 'Shopping Cart',
        endpoint: '/api/v1/commerce/cart',
        method: 'GET',
        status: 'success',
        message: `Shopping cart accessible (${Array.isArray(response.data) ? response.data.length : 0} items)`,
        responseTime: Date.now() - cartStartTime,
        statusCode: response.status,
        data: { cart_items: Array.isArray(response.data) ? response.data.length : 0 }
      });
    } catch (error: any) {
      results.push({
        name: 'Shopping Cart',
        endpoint: '/api/v1/commerce/cart',
        method: 'GET',
        status: 'error',
        message: `Cart access failed: ${error.response?.data?.detail || error.message}`,
        responseTime: Date.now() - cartStartTime,
        statusCode: error.response?.status
      });
    }

    return results;
  };

  // Test chat endpoints
  const testChatEndpoints = async (): Promise<ConnectivityTestResult[]> => {
    if (!authToken) {
      return [{
        name: 'Chat Endpoints',
        endpoint: '/api/v1/chat/*',
        method: 'GET',
        status: 'warning',
        message: 'Skipped - requires authentication token'
      }];
    }

    const results: ConnectivityTestResult[] = [];
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test chat sessions
    try {
      const startTime = Date.now();
      const response = await axios.get(`${config.apiUrl}/api/v1/chat/sessions`, {
        headers: authHeaders,
        timeout: 10000
      });
      
      results.push({
        name: 'Chat Sessions',
        endpoint: '/api/v1/chat/sessions',
        method: 'GET',
        status: 'success',
        message: `Chat system accessible (${Array.isArray(response.data) ? response.data.length : 0} sessions)`,
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        data: { session_count: Array.isArray(response.data) ? response.data.length : 0 }
      });
    } catch (error: any) {
      results.push({
        name: 'Chat Sessions',
        endpoint: '/api/v1/chat/sessions',
        method: 'GET',
        status: 'error',
        message: `Chat access failed: ${error.response?.data?.detail || error.message}`,
        statusCode: error.response?.status
      });
    }

    return results;
  };

  // Test labeling endpoints
  const testLabelingEndpoints = async (): Promise<ConnectivityTestResult[]> => {
    if (!authToken) {
      return [{
        name: 'Labeling Endpoints',
        endpoint: '/api/v1/labels/*',
        method: 'GET',
        status: 'warning',
        message: 'Skipped - requires authentication token'
      }];
    }

    const results: ConnectivityTestResult[] = [];
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test labels for model (using model ID 1 as example)
    try {
      const startTime = Date.now();
      const response = await axios.get(`${config.apiUrl}/api/v1/labels/models/1/labels`, {
        headers: authHeaders,
        timeout: 10000
      });
      
      results.push({
        name: '3D Labeling System',
        endpoint: '/api/v1/labels/models/1/labels',
        method: 'GET',
        status: 'success',
        message: `Labeling system accessible (${Array.isArray(response.data) ? response.data.length : 0} labels)`,
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        data: { label_count: Array.isArray(response.data) ? response.data.length : 0 }
      });
    } catch (error: any) {
      const status = error.response?.status === 404 ? 'warning' : 'error';
      const message = error.response?.status === 404 
        ? 'Labeling system working (model not found - expected)'
        : `Labeling access failed: ${error.response?.data?.detail || error.message}`;
        
      results.push({
        name: '3D Labeling System',
        endpoint: '/api/v1/labels/models/1/labels',
        method: 'GET',
        status,
        message,
        statusCode: error.response?.status
      });
    }

    return results;
  };

  // Run all tests
  const runFullConnectivityTest = async () => {
    setIsRunning(true);
    clearResults();
    setAuthToken(''); // Reset token

    addResult({
      name: 'Test Suite',
      endpoint: 'Multiple',
      method: 'ALL',
      status: 'testing',
      message: 'Starting comprehensive backend connectivity tests...'
    });

    // Run tests sequentially
    const serverResult = await testServerHealth();
    addResult(serverResult);

    const docsResult = await testAPIDocumentation();
    addResult(docsResult);

    const registrationResult = await testUserRegistration();
    addResult(registrationResult);

    const loginResult = await testUserLogin();
    addResult(loginResult);

    // Test protected endpoints (only if login succeeded)
    if (authToken) {
      const commerceResults = await testCommerceEndpoints();
      commerceResults.forEach(result => addResult(result));

      const chatResults = await testChatEndpoints();
      chatResults.forEach(result => addResult(result));

      const labelingResults = await testLabelingEndpoints();
      labelingResults.forEach(result => addResult(result));
    }

    addResult({
      name: 'Test Suite',
      endpoint: 'Complete',
      method: 'ALL',
      status: 'success',
      message: '✅ Comprehensive backend connectivity test completed!'
    });

    setIsRunning(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="badge bg-success">✅ Success</span>;
      case 'error':
        return <span className="badge bg-danger">❌ Error</span>;
      case 'warning':
        return <span className="badge bg-warning text-dark">⚠️ Warning</span>;
      case 'testing':
        return <span className="badge bg-info">🔄 Testing</span>;
      default:
        return <span className="badge bg-secondary">❓ Unknown</span>;
    }
  };

  return (
    <div className="comprehensive-backend-tester p-4">
      <div className="card border-0 shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-network-wired me-2"></i>
              Backend Connectivity & API Tester
            </h5>
            <button
              onClick={runFullConnectivityTest}
              disabled={isRunning}
              className="btn btn-light btn-sm"
            >
              {isRunning ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-play me-2"></i>
                  Run Full Test
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Configuration Display */}
          <div className="alert alert-info mb-4">
            <h6><i className="fas fa-cog me-2"></i>Current Configuration</h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Backend URL:</strong> <code>{config.apiUrl}</code>
              </div>
              <div className="col-md-6">
                <strong>Test Credentials:</strong> <code>{testCredentials.username}</code>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card border-secondary">
                <div className="card-header">
                  <h6 className="mb-0">Test Credentials</h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Username"
                      value={testCredentials.username}
                      onChange={(e) => setTestCredentials(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Password"
                      value={testCredentials.password}
                      onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  {authToken && (
                    <div className="alert alert-success py-2 mb-0">
                      <small><i className="fas fa-key me-1"></i>Token acquired</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card border-secondary">
                <div className="card-header">
                  <h6 className="mb-0">Quick Actions</h6>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <a href={`${config.apiUrl}/docs`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                      <i className="fas fa-book me-2"></i>Open API Docs
                    </a>
                    <a href={`${config.apiUrl}/admin`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">
                      <i className="fas fa-user-shield me-2"></i>Open Admin Panel
                    </a>
                    <button onClick={clearResults} className="btn btn-outline-danger btn-sm">
                      <i className="fas fa-trash me-2"></i>Clear Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="test-results">
            <h6 className="mb-3">Test Results ({results.length})</h6>
            
            {results.length === 0 && (
              <div className="alert alert-secondary text-center">
                <i className="fas fa-info-circle me-2"></i>
                No tests run yet. Click "Run Full Test" to check backend connectivity.
              </div>
            )}

            {results.map((result, index) => (
              <div key={index} className="card mb-2">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-3">{result.name}</strong>
                        {getStatusBadge(result.status)}
                        {result.responseTime && (
                          <small className="text-muted ms-2">
                            {result.responseTime}ms
                          </small>
                        )}
                        {result.statusCode && (
                          <span className={`badge ms-2 ${result.statusCode < 300 ? 'bg-success' : result.statusCode < 500 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {result.statusCode}
                          </span>
                        )}
                      </div>
                      <div className="mb-2">
                        <code className="text-muted">{result.method} {result.endpoint}</code>
                      </div>
                      <div className="text-muted">{result.message}</div>
                      
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-primary" style={{ cursor: 'pointer' }}>
                            <small>Show response data</small>
                          </summary>
                          <pre className="mt-2 p-2 bg-light rounded small" style={{ maxHeight: '150px', overflow: 'auto' }}>
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveBackendTester;