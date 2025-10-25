import React from 'react';
import type { FileData } from '../../types';

interface LeftDockProps {
  onFileSelect: (file: FileData) => void;
}

const LeftDock: React.FC<LeftDockProps> = ({ onFileSelect }) => {
  const sampleFiles: FileData[] = [
    { name: 'Car Design v2.stl', color: '#7c3aed', icon: 'fas fa-car' },
    { name: 'Airplane Wing.stl', color: '#3b82f6', icon: 'fas fa-plane' },
    { name: 'Turbine Blade.stl', color: '#10b981', icon: 'fas fa-fan' }
  ];

  return (
    <div className="dock-overlay left-dock">
      <div className="dock-trigger">
        <i className="fas fa-folder text-primary fs-5 mb-4"></i>
        <i className="fas fa-chevron-right text-secondary small"></i>
      </div>
      
      <div className="dock-content p-3">
        <div className="d-flex flex-column gap-2">
          {sampleFiles.map((file, index) => (
            <div
              key={index}
              className="rounded d-flex align-items-center p-2 cursor-pointer"
              style={{ 
                background: `linear-gradient(135deg, ${file.color}22, ${file.color}11)`,
                transition: 'all 0.2s ease'
              }}
              onClick={() => onFileSelect(file)}
              title={file.name}
            >
              <div className="rounded-circle p-2 me-2" style={{ background: `${file.color}33` }}>
                <i className={file.icon} style={{ color: file.color, fontSize: '18px' }}></i>
              </div>
              <span className="text-white small text-truncate">
                {file.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftDock;