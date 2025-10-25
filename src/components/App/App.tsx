

// App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MainPageApp from '../ModelRender/mainPage'; // Assuming you have these components
import './App.css';
import ModelsListDemo from '../listings';
import ModelsListPage from '../listings/ModelsListing';

export function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MainPageApp />} />
        <Route path="/feed" element={<ModelsListPage 
          onModelSelect={(model) => console.log('Selected:', model)}
          onBackToMain={() => window.history.back()}
        />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* You can also add a catch-all route for 404 pages */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}

export default App;