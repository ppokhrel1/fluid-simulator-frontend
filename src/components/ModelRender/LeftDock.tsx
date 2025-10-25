import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import type { FileData } from '../../types';

interface LeftDockProps {
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  onFileSelect: (file: FileData) => void;
}

const LeftDock: React.FC<LeftDockProps> = ({ expanded, onToggle, onFileSelect }) => {
  const sampleFiles: FileData[] = [
    { name: 'Car Design v2.stl', color: '#7c3aed', icon: 'fas fa-car' },
    { name: 'Airplane Wing.stl', color: '#3b82f6', icon: 'fas fa-plane' },
    { name: 'Turbine Blade.stl', color: '#10b981', icon: 'fas fa-fan' }
  ];

  return (
    <Card 
      className="h-100 bg-dark bg-opacity-75 border-secondary"
      onMouseEnter={() => onToggle(true)}
      onMouseLeave={() => onToggle(false)}
    >
      <Card.Header className="bg-dark border-secondary d-flex justify-content-center">
        <i className="fas fa-folder text-primary fs-5"></i>
      </Card.Header>
      
      <Card.Body className="d-flex flex-column align-items-center gap-2">
        {sampleFiles.map((file, index) => (
          <OverlayTrigger
            key={index}
            placement="right"
            overlay={<Tooltip>{file.name}</Tooltip>}
          >
            <div
              className="rounded d-flex align-items-center justify-content-center cursor-pointer"
              style={{ 
                width: expanded ? '100%' : '50px',
                height: '50px',
                background: `linear-gradient(135deg, ${file.color}, ${file.color}aa)`,
                transition: 'all 0.3s ease'
              }}
              onClick={() => onFileSelect(file)}
            >
              <i className={file.icon} style={{ color: 'white', fontSize: '20px' }}></i>
              {expanded && (
                <small className="text-white ms-2 text-truncate" style={{ fontSize: '12px' }}>
                  {file.name}
                </small>
              )}
            </div>
          </OverlayTrigger>
        ))}
      </Card.Body>
    </Card>
  );
};

export default LeftDock;