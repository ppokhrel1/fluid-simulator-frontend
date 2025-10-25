import React from 'react';
import { Card } from 'react-bootstrap';

const PressureLegend: React.FC = () => {
  return (
    <Card className="bg-dark bg-opacity-75 border-secondary">
      <Card.Body className="py-2">
        <div className="d-flex align-items-center gap-3 text-white">
          <small className="fw-bold">Pressure Distribution</small>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">Low</small>
            <div 
              className="rounded"
              style={{
                width: '80px',
                height: '8px',
                background: 'linear-gradient(to right, #44ff88, #88ff44, #ffdd44, #ff8844, #ff4444)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            ></div>
            <small className="text-muted">High</small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PressureLegend;