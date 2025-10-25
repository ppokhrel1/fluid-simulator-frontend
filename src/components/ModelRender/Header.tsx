import React from 'react';
import { Navbar, Badge } from 'react-bootstrap';

interface HeaderProps {
  status: string;
}

const Header: React.FC<HeaderProps> = ({ status }) => {
  return (
    <Navbar className="bg-dark bg-opacity-75 border-bottom border-secondary">
      <Navbar.Brand className="text-white d-flex align-items-center">
        <i className="fas fa-wind text-primary me-2"></i>
        <span className="fw-bold font-monospace">CURFD</span>
        <small className="text-muted ms-2">V3 - Advanced AI CFD Engine</small>
      </Navbar.Brand>
      
      <div className="ms-auto d-flex align-items-center">
        <Badge bg="secondary" className="d-flex align-items-center me-3">
          <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
          {status}
        </Badge>
        
        <div className="bg-dark rounded-circle border border-secondary" style={{ width: '36px', height: '36px' }}>
          <i className="fas fa-user-circle text-muted d-flex align-items-center justify-content-center h-100"></i>
        </div>
      </div>
    </Navbar>
  );
};

export default Header;