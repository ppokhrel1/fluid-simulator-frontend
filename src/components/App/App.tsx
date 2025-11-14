// App.js
import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MainPageApp from '../ModelRender/mainPage'; // Assuming you have these components
import './App.css';
import ModelsListPage from '../listings/ModelsListing';
import UploadPage from '../listings/UploadPage';
import { UpdateModelDemo } from '../listings/UploadModelDemo';
import LoginPage from '../listings/LoginPage';
import { AuthProvider, useAuth } from '~/contexts/AuthContext';
import ComprehensiveBackendTester from '../common/ComprehensiveBackendTester';
import ErrorBoundary from '../common/ErrorBoundary';
import UserDashboard from '../Auth/UserDashboard';
import { saveCurrentRoute } from '../../utils/stateUtils';
import ObjectInteractionApp from '../3dShapes/ImageInteraction';
// 💡 NEW IMPORT: Import the ObjectStudioProvider from the file you modified
import { ObjectStudioProvider } from '~/hooks/useObjectStudio'; 
import { GeometryProvider } from '~/contexts/GeometryContext';
import GeometryProviderHome from '../simulation_outputs/home';
import LandingPage from '../Landing';

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();
  
  // Save current route for state persistence
  useEffect(() => {
    saveCurrentRoute(location.pathname);
  }, [location.pathname]);
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌊</div>
        <div style={{ fontSize: '18px', color: '#007bff' }}>Loading Fluid Simulator...</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Restoring your session</div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<MainPageApp />} />
        <Route path="/feed" element={<ModelsListPage 
          onModelSelect={(model: any) => console.log('Selected:', model)}
          onBackToMain={() => window.history.back()}
        />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/upload-demo" element={<UpdateModelDemo />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<UserDashboard onBack={() => window.history.back()} />} />
        <Route path="/test-backend" element={<ComprehensiveBackendTester />} />
        
        <Route 
          path="/developer" 
          element={
            <ObjectStudioProvider>
              <ObjectInteractionApp />
            </ObjectStudioProvider>
          } 
        />

        
        <Route path="/simulations" element={<GeometryProvider>
          <GeometryProviderHome />
          </GeometryProvider>} />

        <Route path="/landing" element={<LandingPage />} />

        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* You can also add a catch-all route for 404 pages */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;