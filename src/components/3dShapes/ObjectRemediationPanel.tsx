// Enhanced ObjectRemediationPanel.tsx
import React, { useState } from 'react';
import { useObjectStudio } from '../../hooks/useObjectStudio'; 

interface ObjectRemediationPanelProps {
  selectedObjectId: string | null;
}

const ObjectRemediationPanel: React.FC<ObjectRemediationPanelProps> = ({ selectedObjectId }) => {
  const { objects, applyMeshOperation } = useObjectStudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [decimationTarget, setDecimationTarget] = useState(50);
  const [smoothIterations, setSmoothIterations] = useState(3);
  const [lastOperationStats, setLastOperationStats] = useState<{
    operation: string;
    before: number;
    after: number;
    reduction: string;
  } | null>(null);

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  const handleOperation = async (operationType: 'decimate' | 'smooth' | 'remesh', value: number) => {
    if (!selectedObjectId) {
      alert('Please select an object to apply a remediation operation.');
      return;
    }
    
    setIsProcessing(true);
    try {
      await applyMeshOperation(selectedObjectId, operationType, value);
      
      // Update stats from the updated object
      const updatedObject = objects.find(obj => obj.id === selectedObjectId);
      if (updatedObject?.parameters?.last_operation === operationType) {
        const originalFaces = updatedObject.parameters.original_face_count;
        const newFaces = updatedObject.parameters.new_face_count;
        const reduction = originalFaces && newFaces 
          ? `${((1 - newFaces / originalFaces) * 100).toFixed(1)}%` 
          : 'N/A';
          
        setLastOperationStats({
          operation: operationType,
          before: originalFaces || 0,
          after: newFaces || 0,
          reduction
        });
      }
      
      console.log(`✅ ${operationType} applied successfully.`);
    } catch (error) {
      console.error(`❌ ${operationType} failed:`, error);
      alert(`Remediation failed. Check console.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFaceCount = (obj: any) => {
    return obj.parameters?.new_face_count || obj.faces?.length || 'Unknown';
  };

  return (
    <div className="remediation-panel">
      <h4>Mesh Refinement & Remediation</h4>
      
      
      {!selectedObjectId ? (
        <p className="remediation-hint">Select an object (especially an AI-generated one) to clean it up.</p>
      ) : (
        <div className="object-stats">
          <p><strong>Selected Object:</strong> {selectedObject?.type}</p>
          <p><strong>Face Count:</strong> {getFaceCount(selectedObject)} faces</p>
        </div>
      )}

      {lastOperationStats && (
        <div className="operation-stats">
          <h5>Last Operation Results:</h5>
          <p>
            {lastOperationStats.operation}: {lastOperationStats.before} → {lastOperationStats.after} faces 
            ({lastOperationStats.reduction} reduction)
          </p>
        </div>
      )}

      

      <fieldset disabled={isProcessing || !selectedObjectId}>
        <legend>Cleanup Tools</legend>

        {/* Decimation Control */}
        <div className="control-group">
          <label>
            Decimation %: {decimationTarget}%
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={decimationTarget}
              onChange={(e) => setDecimationTarget(parseInt(e.target.value))}
            />
          </label>
          <button 
            onClick={() => handleOperation('decimate', decimationTarget)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Decimating...' : 'Decimate Mesh'}
          </button>
          <p className="control-tip">Reduce polygon count for better performance.</p>
        </div>

        {/* Smoothing Control */}
        <div className="control-group">
          <label>
            Smooth Iterations: {smoothIterations}
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={smoothIterations}
              onChange={(e) => setSmoothIterations(parseInt(e.target.value))}
            />
          </label>
          <button 
            onClick={() => handleOperation('smooth', smoothIterations)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Smoothing...' : 'Smooth Surface'}
          </button>
          <p className="control-tip">Apply sub-division smoothing to round out details.</p>
        </div>

        {/* Remesh Control */}
        <div className="control-group">
          <button 
            onClick={() => handleOperation('remesh', 0)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Remeshing...' : 'Remesh Object'}
          </button>
          <p className="control-tip">Generate new, clean topology (voxel-based remeshing).</p>
        </div>
      </fieldset>
    </div>
  );
};

export default ObjectRemediationPanel;