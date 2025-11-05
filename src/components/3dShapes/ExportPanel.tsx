// frontend/src/components/3dShapes/ExportPanel.tsx
import React from 'react';

interface ExportPanelProps {
  selectedObject: string | null;
  // FIX: Change return type from Promise<void> to Promise<string | undefined>
  onExport: (meshId: string, format: string) => Promise<string | undefined>; 
}

const ExportPanel: React.FC<ExportPanelProps> = ({ selectedObject, onExport }) => {
  const handleExport = async (format: string) => {
    if (!selectedObject) return;
    
    try {
      await onExport(selectedObject, format);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="export-panel">
      <h3>Export</h3>
      <div className="export-buttons">
        <button 
          onClick={() => handleExport('stl')}
          disabled={!selectedObject}
        >
          Export as STL
        </button>
        <button 
          onClick={() => handleExport('glb')}
          disabled={!selectedObject}
        >
          Export as GLB
        </button>
        <button 
          onClick={() => handleExport('obj')}
          disabled={!selectedObject}
        >
          Export as OBJ
        </button>
      </div>
      
      {!selectedObject && (
        <p className="export-hint">Select an object to export</p>
      )}
    </div>
  );
};

export default ExportPanel;