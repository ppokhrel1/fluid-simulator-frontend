import React, { useRef } from 'react';

interface BottomControlDockProps {
  onUploadModel: () => void;
  onResetView: () => void;
  onToggleGrid: () => void;
  onAutoRotate: () => void;
  onScreenshot: () => void;
  gridVisible: boolean;
  autoRotateEnabled: boolean;
}

const BottomControlDock: React.FC<BottomControlDockProps> = ({ 
  onUploadModel, 
  onResetView, 
  onToggleGrid, 
  onAutoRotate, 
  onScreenshot,
  gridVisible,
  autoRotateEnabled
}) => {
  const getButtonClass = (isActive: boolean) => {
    const baseClass = "btn rounded-pill mx-1 border-0";
    return isActive 
      ? `${baseClass} btn-primary text-white` 
      : `${baseClass} btn-outline-secondary text-white`;
  };

  return (
    <div className="bg-dark bg-opacity-75 rounded-pill p-2 border border-secondary d-flex">
      <button
        className={getButtonClass(gridVisible)}
        onClick={onToggleGrid}
      >
        <i className="fas fa-th me-2"></i>
        Grid
      </button>
      
      <button
        className={getButtonClass(autoRotateEnabled)}
        onClick={onAutoRotate}
      >
        <i className="fas fa-sync-alt me-2"></i>
        Auto Rotate
      </button>
      
      <button
        className={getButtonClass(false)}
        onClick={onResetView}
      >
        <i className="fas fa-refresh me-2"></i>
        Reset View
      </button>
      
      <button
        className={getButtonClass(false)}
        onClick={onUploadModel}
      >
        <i className="fas fa-upload me-2"></i>
        Upload
      </button>
      
      <button
        className={getButtonClass(false)}
        onClick={onScreenshot}
      >
        <i className="fas fa-camera me-2"></i>
        Screenshot
      </button>
    </div>
  );
};

export default BottomControlDock;