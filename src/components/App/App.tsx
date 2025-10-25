

// App.js
import React from 'react';
import { Routes, Route, Link, HashRouter } from 'react-router-dom';
import MainPageApp from '../ModelRender/mainPage'; // Assuming you have these components
import './App.css';

export function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/contact">Contact</Link>
      </nav>
      <HashRouter>
      <Routes>
        <Route path="/" element={<MainPageApp />} />
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* You can also add a catch-all route for 404 pages */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      </HashRouter>
    </div>
  );
}

export default App;