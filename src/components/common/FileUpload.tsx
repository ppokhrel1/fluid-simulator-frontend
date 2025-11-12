import React from 'react';

interface FileUploadProgressProps {
  file: File;
  progress: number;
  onCancel: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ file, progress, onCancel }) => {
  return (
    <div className="d-flex align-items-center p-2 rounded" style={{ background: 'var(--chat-input-bg)' }}>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between mb-1">
          <small className="text-white">{file.name}</small>
          <small className="text-white-50">{progress}%</small>
        </div>
        <div className="progress" style={{ height: '4px' }}>
          <div 
            className="progress-bar"
            role="progressbar"
            style={{ 
              width: `${progress}%`,
              background: 'var(--brand-gradient)'
            }}
          />
        </div>
      </div>
      <button 
        className="btn btn-link text-white-50 p-0 ms-2"
        onClick={onCancel}
      >
        <i className="fas fa-times" />
      </button>
    </div>
  );
};

export const FilePreview: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
  return (
    <div className="d-flex align-items-center p-2 rounded" style={{ background: 'var(--chat-input-bg)' }}>
      <i className="fas fa-file-alt text-white-50 me-2" />
      <span className="text-white text-truncate">{file.name}</span>
      <button 
        className="btn btn-link text-white-50 p-0 ms-2"
        onClick={onRemove}
      >
        <i className="fas fa-times" />
      </button>
    </div>
  );
};