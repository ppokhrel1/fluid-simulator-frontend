

// App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MainPageApp from '../ModelRender/mainPage'; // Assuming you have these components
import './App.css';
import ModelsListPage from '../listings/ModelsListing';
import { UpdateModelDemo } from '../listings/UploadModelDemo';
import LoginPage from '../listings/LoginPage';
import { AuthProvider } from '~/contexts/AuthContext';
import ComprehensiveBackendTester from '../common/ComprehensiveBackendTester';

export function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/feed">Models</Link> | <Link to="/upload">Upload</Link> | <Link to="/login">Login</Link> | <Link to="/test-backend">Test Backend</Link>
      </nav>
      <AuthProvider>
      <Routes>

        <Route path="/" element={<MainPageApp />} />
        <Route path="/feed" element={<ModelsListPage 
          onModelSelect={(model: any) => console.log('Selected:', model)}
          onBackToMain={() => window.history.back()}
        />} />
        <Route path="/upload" element={<UpdateModelDemo />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test-backend" element={<ComprehensiveBackendTester />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* You can also add a catch-all route for 404 pages */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;