import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { FileData } from '../../types';

interface LeftDockProps {
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  onFileSelect: (file: FileData) => void;
  onUploadModel: () => void; // new prop for upload
}

export const LeftDock: React.FC<LeftDockProps> = ({ expanded, onToggle, onFileSelect, onUploadModel }) => {
  const navigate = useNavigate();

  const sampleFiles: FileData[] = [
    { name: 'Car Design v2.stl', color: '#7c3aed', icon: 'fas fa-car' },
    { name: 'Airplane Wing.stl', color: '#3b82f6', icon: 'fas fa-plane' },
    { name: 'Turbine Blade.stl', color: '#10b981', icon: 'fas fa-fan' }
  ];

  const extraButtons: FileData[] = [
    { name: 'See All Models', color: '#6c757d', icon: 'fas fa-list' },
    { name: 'Upload Model', color: '#0d6efd', icon: 'fas fa-upload' }
  ];

  const allItems = [...sampleFiles, ...extraButtons];

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

      {/* Body with files and extra buttons */}
      <Card.Body className="d-flex flex-column align-items-center gap-2 flex-grow-1">
        {allItems.map((item, index) => (
          <OverlayTrigger
            key={index}
            placement="right"
            overlay={<Tooltip>{item.name}</Tooltip>}
          >
            <div
              className="rounded d-flex align-items-center justify-content-center cursor-pointer"
              style={{
                width: expanded ? '100%' : '50px',
                height: '50px',
                background: `linear-gradient(135deg, ${item.color}, ${item.color}aa)`,
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                if (item.name === 'See All Models') {
                  navigate('/feed');
                } else if (item.name === 'Upload Model') {
                    navigate('/upload');
                    //onUploadModel();
                } else {
                  onFileSelect(item);
                }
              }}
            >
              <i className={item.icon} style={{ color: 'white', fontSize: '20px' }}></i>
              {expanded && (
                <small className="text-white ms-2 text-truncate" style={{ fontSize: '12px' }}>
                  {item.name}
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
