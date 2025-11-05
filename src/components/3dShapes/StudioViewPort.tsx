// components/ObjectStudio/StudioViewport.tsx
import React from 'react';
import { useObjectStudio } from '../../hooks/useObjectStudio';

export const StudioViewport: React.FC = () => {
  const {
    objects,
    selectedObject,
    createPrimitive,
    generateAIShape,
    exportToSupabase
  } = useObjectStudio();

  const handleAddCube = async () => {
    await createPrimitive({
      shape_type: 'cube',
      parameters: { size: 1.0 }
    });
  };

  const handleAIGenerate = async () => {
    await generateAIShape(
      "add a rectangular block to the side",
      selectedObject || undefined
    );
  };

  const handleExport = async () => {
    if (selectedObject) {
      await exportToSupabase(selectedObject, 'stl');
    }
  };

  return (
    <div className="studio-viewport">
      <div className="toolbar">
        <button onClick={handleAddCube}>Add Cube</button>
        <button onClick={handleAIGenerate} disabled={!selectedObject}>
          AI Add to Selected
        </button>
        <button onClick={handleExport} disabled={!selectedObject}>
          Export to Supabase
        </button>
      </div>
      
      {/* Your Three.js viewport here */}
      <div className="viewport">
        {objects.map(obj => (
          <div key={obj.id}>Object: {obj.type}</div>
        ))}
      </div>
    </div>
  );
};