import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { FileData } from '../../types';

interface LeftDockProps {
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  onFileSelect: (file: FileData) => void;
}

const LeftDock: React.FC<LeftDockProps> = ({ expanded, onToggle, onFileSelect }) => {
  const navigate = useNavigate();

  const sampleFiles: FileData[] = [
    { name: 'Car Design v2.stl', color: '#7c3aed', icon: 'fas fa-car' },
    { name: 'Airplane Wing.stl', color: '#3b82f6', icon: 'fas fa-plane' },
    { name: 'Turbine Blade.stl', color: '#10b981', icon: 'fas fa-fan' },
    // Add "See All Models" as another item for consistent styling
    { name: 'See All Models', color: '#6c757d', icon: 'fas fa-list' }
  ];

  return (
    <Card
      className="h-100 bg-light bg-opacity-75 border-secondary d-flex flex-column"
      onMouseEnter={() => onToggle(true)}
      onMouseLeave={() => onToggle(false)}
    >
      {/* Header */}
      <Card.Header className="bg-light border-secondary d-flex justify-content-center">
        <i className="fas fa-folder text-primary fs-5"></i>
      </Card.Header>

      {/* Body with sample files */}
      <Card.Body className="d-flex flex-column align-items-center gap-2 flex-grow-1">
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
              onClick={() => {
                if (file.name === 'See All Models') {
                  navigate('/feed');
                } else {
                  onFileSelect(file);
                }
              }}
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
