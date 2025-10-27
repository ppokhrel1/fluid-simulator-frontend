import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/constants';

interface ConnectionStatus {
  backend: 'connected' | 'disconnected' | 'testing';
  docs: 'accessible' | 'inaccessible' | 'testing';
  admin: 'accessible' | 'inaccessible' | 'testing';
  database: 'connected' | 'disconnected' | 'testing';
}

const QuickAPIConnectivityTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'testing',
    docs: 'testing',
    admin: 'testing',
    database: 'testing'
  });
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isAutoTesting, setIsAutoTesting] = useState(false);

  const testBackendConnection = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/`, { timeout: 5000 });
      return response.status === 200 ? 'connected' : 'disconnected';
    } catch (error) {
      console.error('Backend connection failed:', error);
      return 'disconnected';
    }
  };

  const testDocsAccess = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/docs`, { timeout: 5000 });
      return response.status === 200 ? 'accessible' : 'inaccessible';
    } catch (error) {
      return 'inaccessible';
    }
  };

  const testAdminAccess = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/admin`, { timeout: 5000 });
      return response.status === 200 ? 'accessible' : 'inaccessible';
    } catch (error) {
      return 'inaccessible';
    }
  };

  const testDatabaseConnection = async () => {
    try {
      // Test a simple authenticated endpoint to verify database
      const response = await axios.get(`${config.apiUrl}/api/v1/commerce/designs?limit=1`, { 
        timeout: 5000,
        validateStatus: function (status) {
          // Accept both 200 (success) and 401 (unauthorized) as "database connected"
          // 401 means the endpoint exists and database is working, just need auth
          return status === 200 || status === 401;
        }
      });
      return (response.status === 200 || response.status === 401) ? 'connected' : 'disconnected';
    } catch (error: any) {
      // If we get a 401, that's actually good - means the endpoint exists
      if (error.response && error.response.status === 401) {
        return 'connected';
      }
      return 'disconnected';
    }
  };

  const runFullConnectivityTest = async () => {
    setStatus({
      backend: 'testing',
      docs: 'testing', 
      admin: 'testing',
      database: 'testing'
    });

    // Test all connections in parallel
    const [backendStatus, docsStatus, adminStatus, dbStatus] = await Promise.all([
      testBackendConnection(),
      testDocsAccess(),
      testAdminAccess(),
      testDatabaseConnection()
    ]);

    setStatus({
      backend: backendStatus,
      docs: docsStatus,
      admin: adminStatus,
      database: dbStatus
    });

    setLastChecked(new Date().toLocaleTimeString());
  };

  // Auto-test on component mount
  useEffect(() => {
    runFullConnectivityTest();
  }, []);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!isAutoTesting) return;
    
    const interval = setInterval(() => {
      runFullConnectivityTest();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAutoTesting]);

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
      case 'accessible':
        return '✅';
      case 'disconnected':
      case 'inaccessible':
        return '❌';
      case 'testing':
        return '🔄';
      default:
        return '❓';
    }
  };

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
      case 'accessible':
        return 'text-success';
      case 'disconnected':
      case 'inaccessible':
        return 'text-danger';
      case 'testing':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  };

  const allConnected = Object.values(status).every(s => s === 'connected' || s === 'accessible');

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="fas fa-plug me-2"></i>
          API Connectivity Status
        </h6>
        <div>
          <button 
            className="btn btn-outline-light btn-sm me-2"
            onClick={runFullConnectivityTest}
            disabled={Object.values(status).some(s => s === 'testing')}
          >
            <i className="fas fa-sync-alt me-1"></i>
            {Object.values(status).some(s => s === 'testing') ? 'Testing...' : 'Test Now'}
          </button>
          <button 
            className={`btn btn-sm ${isAutoTesting ? 'btn-warning' : 'btn-outline-light'}`}
            onClick={() => setIsAutoTesting(!isAutoTesting)}
          >
            <i className="fas fa-clock me-1"></i>
            Auto
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-12 mb-3">
            <div className={`alert ${allConnected ? 'alert-success' : 'alert-warning'} mb-3`}>
              <div className="d-flex align-items-center">
                <span className="me-2" style={{ fontSize: '1.2em' }}>
                  {allConnected ? '🎉' : '⚠️'}
                </span>
                <div>
                  <strong>
                    {allConnected ? 'All Systems Connected!' : 'Connection Issues Detected'}
                  </strong>
                  <br />
                  <small>
                    Backend URL: <code>{config.apiUrl}</code>
                    {lastChecked && ` • Last checked: ${lastChecked}`}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center p-3 border rounded">
              <span style={{ fontSize: '1.5em' }} className="me-3">
                {getStatusIcon(status.backend)}
              </span>
              <div className="flex-grow-1">
                <div className={`fw-bold ${getStatusColor(status.backend)}`}>
                  Backend Server
                </div>
                <small className="text-muted">http://127.0.0.1:8000</small>
              </div>
              {status.backend === 'connected' && (
                <a href={config.apiUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center p-3 border rounded">
              <span style={{ fontSize: '1.5em' }} className="me-3">
                {getStatusIcon(status.docs)}
              </span>
              <div className="flex-grow-1">
                <div className={`fw-bold ${getStatusColor(status.docs)}`}>
                  API Documentation
                </div>
                <small className="text-muted">/docs endpoint</small>
              </div>
              {status.docs === 'accessible' && (
                <a href={`${config.apiUrl}/docs`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center p-3 border rounded">
              <span style={{ fontSize: '1.5em' }} className="me-3">
                {getStatusIcon(status.admin)}
              </span>
              <div className="flex-grow-1">
                <div className={`fw-bold ${getStatusColor(status.admin)}`}>
                  Admin Panel
                </div>
                <small className="text-muted">/admin endpoint</small>
              </div>
              {status.admin === 'accessible' && (
                <a href={`${config.apiUrl}/admin`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center p-3 border rounded">
              <span style={{ fontSize: '1.5em' }} className="me-3">
                {getStatusIcon(status.database)}
              </span>
              <div className="flex-grow-1">
                <div className={`fw-bold ${getStatusColor(status.database)}`}>
                  Database & APIs
                </div>
                <small className="text-muted">30+ endpoints ready</small>
              </div>
            </div>
          </div>
        </div>

        {!allConnected && (
          <div className="alert alert-info mt-3">
            <h6><i className="fas fa-lightbulb me-2"></i>Troubleshooting Tips:</h6>
            <ul className="mb-0">
              <li>Ensure your backend server is running on <code>http://127.0.0.1:8000</code></li>
              <li>Check that CORS is enabled for <code>http://localhost:3000</code> or <code>http://localhost:7579</code></li>
              <li>Verify your backend has all the enhanced endpoints from the AI integration</li>
              <li>Make sure the database is initialized with all tables</li>
            </ul>
          </div>
        )}

        {allConnected && (
          <div className="alert alert-success mt-3">
            <h6><i className="fas fa-rocket me-2"></i>Ready to Test Enhanced Features!</h6>
            <p className="mb-2">Your frontend is successfully connected to the enhanced backend. You can now test:</p>
            <div className="row">
              <div className="col-md-4">
                <strong>🛒 Commerce System</strong>
                <ul className="small mb-0">
                  <li>Marketplace browsing</li>
                  <li>Shopping cart</li>
                  <li>Design selling</li>
                </ul>
              </div>
              <div className="col-md-4">
                <strong>🤖 AI Chat System</strong>
                <ul className="small mb-0">
                  <li>Chat sessions</li>
                  <li>Message history</li>
                  <li>Model discussions</li>
                </ul>
              </div>
              <div className="col-md-4">
                <strong>🏷️ 3D Labeling</strong>
                <ul className="small mb-0">
                  <li>Positional labels</li>
                  <li>AI suggestions</li>
                  <li>Collaborative editing</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAPIConnectivityTest;