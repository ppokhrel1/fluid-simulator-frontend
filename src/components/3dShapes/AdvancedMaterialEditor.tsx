// frontend/src/components/3dShapes/AdvancedMaterialEditor.tsx
import React, { useState, useEffect } from 'react';
import { useObjectStudio } from '~/hooks/useObjectStudio';

interface CustomMaterial {
  color: string;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  transparent: boolean;
  opacity: number;
  wireframe: boolean;
}

const AdvancedMaterialEditor: React.FC = () => {
  const { selectedObject, objects, updateObjectMaterial } = useObjectStudio();
  const [customMaterial, setCustomMaterial] = useState<CustomMaterial>({
    color: '#ff6b6b',
    metalness: 0.2,
    roughness: 0.6,
    emissive: '#000000',
    emissiveIntensity: 0,
    transparent: false,
    opacity: 1,
    wireframe: false
  });

  // When selected object changes, load its current material
  useEffect(() => {
    if (selectedObject) {
      const currentObject = objects.find(obj => obj.id === selectedObject);
      if (currentObject?.material) {
        setCustomMaterial(prev => ({
          ...prev,
          ...currentObject.material
        }));
      } else {
        // Reset to defaults for new object
        setCustomMaterial({
          color: '#ff6b6b',
          metalness: 0.2,
          roughness: 0.6,
          emissive: '#000000',
          emissiveIntensity: 0,
          transparent: false,
          opacity: 1,
          wireframe: false
        });
      }
    }
  }, [selectedObject, objects]);

  const handleApplyCustom = () => {
    if (!selectedObject) {
      alert('Please select an object first in advanced material editor');
      return;
    }
    updateObjectMaterial(selectedObject, customMaterial);
  };

  const handleReset = () => {
    setCustomMaterial({
      color: '#ff6b6b',
      metalness: 0.2,
      roughness: 0.6,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1,
      wireframe: false
    });
  };

  const presetMaterials = [
    { name: 'Default Red', color: '#ff6b6b', metalness: 0.2, roughness: 0.6 },
    { name: 'Glossy Metal', color: '#cccccc', metalness: 0.9, roughness: 0.1 },
    { name: 'Matte Plastic', color: '#ff4444', metalness: 0.0, roughness: 0.9 },
    { name: 'Gold', color: '#ffd700', metalness: 1.0, roughness: 0.3 },
    { name: 'Glass', color: '#ffffff', metalness: 0.0, roughness: 0.1, transparent: true, opacity: 0.5 },
    { name: 'Neon Glow', color: '#00ff00', metalness: 0.0, roughness: 0.5, emissive: '#00ff00', emissiveIntensity: 1 }
  ];

  const applyPreset = (preset: any) => {
    setCustomMaterial(prev => ({
      ...prev,
      ...preset,
      // Ensure all properties are set
      emissive: preset.emissive || '#000000',
      emissiveIntensity: preset.emissiveIntensity || 0,
      transparent: preset.transparent || false,
      opacity: preset.opacity !== undefined ? preset.opacity : 1,
      wireframe: false
    }));
  };

  if (!selectedObject) {
    return (
      <div className="advanced-material-editor">
        <h4>Advanced Material Editor</h4>
        <div className="material-hint">
          🎯 Select an object to edit its material properties
        </div>
      </div>
    );
  }

  console.log("object selected in AdvancedMaterialEditor:", selectedObject);
  return (
    <div className="advanced-material-editor">
      <h4>Advanced Material Editor</h4>
      
      {/* Quick Presets */}
      <div className="preset-section">
        <label>Quick Presets:</label>
        <div className="preset-buttons">
          {presetMaterials.map((preset, index) => (
            <button
              key={index}
              className="preset-btn"
              onClick={() => applyPreset(preset)}
              title={preset.name}
            >
              <div
                className="preset-preview"
                style={{ backgroundColor: preset.color }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Material Controls */}
      <div className="material-controls">
        <div className="control-group">
          <label>
            Base Color
            <input
              type="color"
              value={customMaterial.color}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, color: e.target.value }))}
            />
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Metalness: {customMaterial.metalness.toFixed(1)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customMaterial.metalness}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, metalness: parseFloat(e.target.value) }))}
            />
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Roughness: {customMaterial.roughness.toFixed(1)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customMaterial.roughness}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
            />
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Emissive Color
            <input
              type="color"
              value={customMaterial.emissive}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, emissive: e.target.value }))}
            />
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Emissive Intensity: {customMaterial.emissiveIntensity.toFixed(1)}
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={customMaterial.emissiveIntensity}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, emissiveIntensity: parseFloat(e.target.value) }))}
            />
          </label>
        </div>
        
        <div className="control-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={customMaterial.transparent}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, transparent: e.target.checked }))}
            />
            Transparent Material
          </label>
        </div>
        
        {customMaterial.transparent && (
          <div className="control-group">
            <label>
              Opacity: {customMaterial.opacity.toFixed(1)}
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={customMaterial.opacity}
                onChange={(e) => setCustomMaterial(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              />
            </label>
          </div>
        )}
        
        <div className="control-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={customMaterial.wireframe}
              onChange={(e) => setCustomMaterial(prev => ({ ...prev, wireframe: e.target.checked }))}
            />
            Show Wireframe
          </label>
        </div>
      </div>
      
      {/* Live Preview */}
      <div className="preview-section">
        <label>Live Preview:</label>
        <div className="material-preview-3d">
          <div
            className="preview-cube"
            style={{
              backgroundColor: customMaterial.color,
              opacity: customMaterial.opacity,
              boxShadow: customMaterial.emissiveIntensity > 0 
                ? `0 0 20px ${customMaterial.emissive}` 
                : 'none',
              border: customMaterial.wireframe ? '2px dashed #fff' : 'none'
            }}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
        <button onClick={handleApplyCustom} className="apply-button">
          Apply to Selected
        </button>
      </div>

      <div className="selected-object-info">
        Editing: <strong>{objects.find(obj => obj.id === selectedObject)?.type || 'Object'}</strong>
      </div>
    </div>
  );
};

export default AdvancedMaterialEditor;