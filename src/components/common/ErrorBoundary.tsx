import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Application Error Caught by Boundary:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '20px', maxWidth: '500px' }}>
            The application encountered an error. This could be due to:
          </p>
          <ul style={{ color: '#666', textAlign: 'left', marginBottom: '30px' }}>
            <li>Network connectivity issues with the backend</li>
            <li>Browser storage quota exceeded</li>
            <li>Incompatible browser features</li>
            <li>Corrupted application state</li>
          </ul>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔄 Clear Data & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔁 Just Reload
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ↩️ Try Again
            </button>
          </div>
          {this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                Show technical details
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                marginTop: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;