// Updated MaterialLibrary.tsx with debugging
import React from 'react';
import { useObjectStudio } from '~/hooks/useObjectStudio';

interface MaterialPreset {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

const MaterialLibrary: React.FC = () => {
  const { selectedObject, updateObjectMaterial, objects } = useObjectStudio();

  // Debug logging
  console.log('🔍 MaterialLibrary Debug:', {
    selectedObject,
    objectsCount: objects.length,
    objects: objects.map(obj => ({ id: obj.id, type: obj.type }))
  });

  const materialPresets: MaterialPreset[] = [
    { name: 'Glossy Red', color: '#ff4444', metalness: 0.9, roughness: 0.1 },
    { name: 'Matte Blue', color: '#4444ff', metalness: 0.0, roughness: 0.9 },
    { name: 'Gold', color: '#ffd700', metalness: 1.0, roughness: 0.3 },
    { name: 'Chrome', color: '#aaaaaa', metalness: 1.0, roughness: 0.1 },
    { name: 'Plastic', color: '#ff6b6b', metalness: 0.0, roughness: 0.5 },
    { name: 'Glass', color: '#ffffff', metalness: 0.0, roughness: 0.1, transparent: true, opacity: 0.5 },
    { name: 'Emerald', color: '#00ff88', metalness: 0.3, roughness: 0.4 },
    { name: 'Neon', color: '#ff00ff', metalness: 0.0, roughness: 0.5, emissive: '#ff00ff', emissiveIntensity: 0.8 }
  ];

  const applyMaterialPreset = (preset: MaterialPreset) => {
    console.log('🎨 Applying material preset:', { selectedObject, preset });
    
    if (!selectedObject) {
      alert('Please select an object first for material library');
      return;
    }
    
    updateObjectMaterial(selectedObject, {
      color: preset.color,
      metalness: preset.metalness,
      roughness: preset.roughness,
      emissive: preset.emissive || '#000000',
      emissiveIntensity: preset.emissiveIntensity || 0,
      transparent: preset.transparent || false,
      opacity: preset.opacity || 1,
      wireframe: false
    });
  };

  return (
    <div className="material-library">
      <h4>Material Library</h4>
      {!selectedObject && (
        <div className="material-hint" style={{ 
          background: '#4a5568', 
          padding: '8px', 
          borderRadius: '4px', 
          marginBottom: '10px',
          fontSize: '0.8em',
          color: '#cbd5e0'
        }}>
          ⚡ Select an object in the 3D view to apply materials
        </div>
      )}
      <div className="material-presets">
        {materialPresets.map((preset, index) => (
          <div
            key={index}
            className="material-preset"
            onClick={() => applyMaterialPreset(preset)}
            title={preset.name}
            style={{ 
              opacity: selectedObject ? 1 : 0.6,
              cursor: selectedObject ? 'pointer' : 'not-allowed'
            }}
          >
            <div
              className="material-preview"
              style={{
                backgroundColor: preset.color,
                boxShadow: preset.emissiveIntensity 
                  ? `0 0 10px ${preset.emissive}` 
                  : 'none',
                opacity: preset.opacity || 1
              }}
            />
            <span>{preset.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialLibrary;