import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      step: 1,
      title: "Generate",
      icon: "fas fa-cube",
      description: "Create 3D models with AI-powered generation or import from STL, OBJ, GLB formats. Design faster with intelligent assistance.",
      link: "/developer",
      color: "#8A4FFF",
      delay: "0s"
    },
    {
      step: 2,
      title: "Simulate",
      icon: "fas fa-water",
      description: "Run CFD flow simulations in minutes. Validate aerodynamics, fluid dynamics, and thermal performance instantly.",
      link: "/simulations",
      color: "#6B7FFF",
      delay: "0.2s"
    },
    {
      step: 3,
      title: "Create",
      icon: "fas fa-print",
      description: "3D print, machine, or sell your validated designs. From digital model to physical product seamlessly.",
      link: "/",
      color: "#4F8AFF",
      delay: "0.4s"
    }
  ];

  const stats = [
    { value: "Generate", label: "AI-Powered 3D Models" },
    { value: "Simulate", label: "CFD in Minutes" },
    { value: "Create", label: "Print & Manufacture" }
  ];

  return (
    <div className="landing-page">
      <div className="hero-section" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="hero-content">
          <div className="logo-container">
            <img src="/curfdlogo.png" alt="CURFD" className="hero-logo" />
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">Innovation</span> at the Speed of <span className="gradient-text">Thinking</span>
          </h1>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="steps-section">
        <h2 className="section-title">Three Simple Steps to Success</h2>
        <p className="section-subtitle">From concept to validated design in minutes</p>
        
        <div className="steps-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="step-card"
              style={{ animationDelay: feature.delay }}
              onClick={() => navigate(feature.link)}
            >
              <div className="step-icon" style={{ color: feature.color }}>
                <i className={feature.icon}></i>
              </div>
              <h3 className="step-title">{feature.title}</h3>
              <p className="step-description">{feature.description}</p>
              <button className="step-button" style={{ borderColor: feature.color }}>
                <span>Explore</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-copilot-section">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        <div className="ai-copilot-content">
          <h2 className="section-title">Your AI Engineering Assistant</h2>
          <div className="copilot-demo">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-title">AI COPILOT</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-question">
                <div className="question-text">Ask anything about your design — from aerodynamics to structural integrity.</div>
                <div className="question-subtext">Get instant insights powered by physics-based AI that understands real engineering.</div>
              </div>
              <div className="terminal-footer">
                <div className="ai-badge"><i className="fas fa-robot"></i> AI</div>
                <div className="model-tag">Physics-aware intelligence</div>
              </div>
            </div>
          </div>
          <button className="demo-access-btn" onClick={() => navigate('/developer')}>
            <i className="fas fa-paper-plane"></i>
            <span>Try It Now</span>
          </button>
        </div>
      </div>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span className="footer-tagline">Innovation at the Speed of Thinking</span>
            <span className="footer-divider">|</span>
            <a href="mailto:curfdai@gmail.com" className="footer-link">curfdai@gmail.com</a>
            <span className="footer-divider">|</span>
            <a href="https://curfd-ai.com" target="_blank" rel="noopener noreferrer" className="footer-link">curfd-ai.com</a>
            <span className="footer-divider">|</span>
            <span className="footer-copyright">&copy; 2025 CURFD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
