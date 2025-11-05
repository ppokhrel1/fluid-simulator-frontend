// frontend/src/components/3dShapes/ShapeLibrary.tsx
import React from 'react';
import { useObjectStudio } from '../../hooks/useObjectStudio';

const ShapeLibrary: React.FC = () => {
  const { createPrimitive } = useObjectStudio();

  // Ensuring these parameters are visible/sensible
  const primitives = [
    { type: 'cube', label: 'Cube', parameters: { size: 4.0 } },
    { type: 'sphere', label: 'Sphere', parameters: { radius: 2.0 } }, 
    { type: 'cylinder', label: 'Cylinder', parameters: { radius: 1.0, height: 4.0 } }, 
    { type: 'cone', label: 'Cone', parameters: { radius: 1.5, height: 4.0 } }, 
    { type: 'torus', label: 'Torus', parameters: { major_radius: 3.0, minor_radius: 1.0 } },
  ];

  const handleAddPrimitive = async (primitive: any) => {
    try {
      console.log('🔄 Adding primitive:', primitive);
      
      const shapeData = {
        shape_type: primitive.type,
        parameters: primitive.parameters,
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      };
      
      await createPrimitive(shapeData);
      
      // 💡 NEW DEBUG: This will fire if createPrimitive resolves without error
      console.log('✅ Primitive added successfully (Check useObjectStudio state update)');
      
    } catch (error) {
      console.error('❌ Failed to create primitive:', error);
      alert('Failed to create shape. Please check the console for details.');
    }
  };

  return (
    <div className="shape-library">
      <h3>Primitive Shapes</h3>
      <div className="shape-grid">
        {primitives.map((primitive) => (
          <button
            key={primitive.type}
            className="shape-button"
            onClick={() => handleAddPrimitive(primitive)}
          >
            {primitive.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeLibrary;