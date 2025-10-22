import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import type { STLModification } from "./render_cfd_model";
import * as THREE from "three";

export const STLToolbar: React.FC<{
  onModify: (mod: STLModification) => void;
  onExport: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddPrimitive: (type: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onBoundingBoxSelect: (enable: boolean) => void;
  selectedObject: THREE.Object3D | null;
  selectedObjects: THREE.Object3D[];
  canUndo: boolean;
  canRedo: boolean;
  isBoundingBoxSelecting: boolean;
  disabled?: boolean;
}> = ({ 
  onModify, 
  onExport, 
  onReset, 
  onUndo, 
  onRedo, 
  onAddPrimitive, 
  onZoomIn, 
  onZoomOut, 
  onZoomFit,
  onBoundingBoxSelect,
  selectedObject, 
  selectedObjects,
  canUndo, 
  canRedo, 
  isBoundingBoxSelecting,
  disabled 
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const transformTools = [
    {
        id: 'translate-x',
        icon: '→',
        title: 'Move Right',
        action: () => onModify({
            type: 'translate',
            parameters: { x: 1, y: 0, z: 0 },
            description: 'Move right along X axis',
            timestamp: Date.now()
        })
    },
    {
        id: 'translate-y',
        icon: '↑',
        title: 'Move Up',
        action: () => onModify({
            type: 'translate',
            parameters: { x: 0, y: 1, z: 0 },
            description: 'Move up along Y axis',
            timestamp: Date.now()
        })
    },
    {
        id: 'translate-z',
        icon: '↗',
        title: 'Move Forward',
        action: () => onModify({
            type: 'translate',
            parameters: { x: 0, y: 0, z: 1 },
            description: 'Move forward along Z axis',
            timestamp: Date.now()
        })
    },
    {
        id: 'rotate-x',
        icon: '🔄',
        title: 'Rotate X',
        action: () => onModify({
            type: 'rotate',
            parameters: { axis: 'x', angle: 45 },
            description: 'Rotate 45° around X axis',
            timestamp: Date.now()
        })
    },
    {
        id: 'rotate-y',
        icon: '🔄',
        title: 'Rotate Y',
        action: () => onModify({
            type: 'rotate',
            parameters: { axis: 'y', angle: 45 },
            description: 'Rotate 45° around Y axis',
            timestamp: Date.now()
        })
    },
    {
        id: 'scale-up',
        icon: '⊕',
        title: 'Scale Up',
        action: () => onModify({
            type: 'scale',
            parameters: { factor: 1.5 },
            description: 'Scale up by 1.5x',
            timestamp: Date.now()
        })
    },
    {
        id: 'scale-down',
        icon: '⊖',
        title: 'Scale Down',
        action: () => onModify({
            type: 'scale',
            parameters: { factor: 0.7 },
            description: 'Scale down by 0.7x',
            timestamp: Date.now()
        })
    }
];

  const historyTools = [
    {
      id: 'undo',
      icon: '↶',
      title: 'Undo',
      action: onUndo,
      disabled: !canUndo
    },
    {
      id: 'redo',
      icon: '↷',
      title: 'Redo',
      action: onRedo,
      disabled: !canRedo
    },
    {
      id: 'reset',
      icon: '↺',
      title: 'Reset',
      action: onReset
    }
  ];

  const primitiveTools = [
    {
      id: 'cube',
      icon: '⬛',
      title: 'Add Cube',
      action: () => onAddPrimitive('cube')
    },
    {
      id: 'sphere',
      icon: '⏺️',
      title: 'Add Sphere',
      action: () => onAddPrimitive('sphere')
    },
    {
      id: 'cylinder',
      icon: '⭕',
      title: 'Add Cylinder',
      action: () => onAddPrimitive('cylinder')
    },
    {
      id: 'export',
      icon: '📥',
      title: 'Export STL',
      action: onExport
    }
  ];

  const viewTools = [
    {
      id: 'zoom-in',
      icon: '➕',
      title: 'Zoom In',
      action: onZoomIn
    },
    {
      id: 'zoom-out',
      icon: '➖',
      title: 'Zoom Out',
      action: onZoomOut
    },
    {
      id: 'zoom-fit',
      icon: '⛶',
      title: 'Zoom to Fit',
      action: onZoomFit
    },
    {
      id: 'bounding-box',
      icon: '🔲',
      title: 'Bounding Box Select',
      action: () => onBoundingBoxSelect(!isBoundingBoxSelecting),
      active: isBoundingBoxSelecting
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      zIndex: 1000
    }}>
      {/* View Tools */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        border: '1px solid #333'
      }}>
        <div style={{ color: 'white', fontSize: 12, marginBottom: 4, opacity: 0.7 }}>View</div>
        {viewTools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.action}
            disabled={disabled}
            title={tool.title}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              borderRadius: 4,
              background: (activeTool === tool.id || tool.active) ? '#007acc' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: 16,
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setActiveTool(tool.id)}
            onMouseLeave={() => setActiveTool(null)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Transform Tools */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        border: '1px solid #333'
      }}>
        <div style={{ color: 'white', fontSize: 12, marginBottom: 10, opacity: 0.7 }}>Transform</div>
        {transformTools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.action}
            disabled={disabled}
            title={tool.title}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              borderRadius: 4,
              background: activeTool === tool.id ? '#007acc' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: 16,
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setActiveTool(tool.id)}
            onMouseLeave={() => setActiveTool(null)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* History Tools */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        border: '1px solid #333'
      }}>
        <div style={{ color: 'white', fontSize: 12, marginBottom: 4, opacity: 0.7 }}>History</div>
        {historyTools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.action}
            disabled={disabled || tool.disabled}
            title={tool.title}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              borderRadius: 4,
              background: activeTool === tool.id ? '#007acc' : 'rgba(255,255,255,0.1)',
              color: tool.disabled ? '#666' : 'white',
              fontSize: 16,
              cursor: (disabled || tool.disabled) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setActiveTool(tool.id)}
            onMouseLeave={() => setActiveTool(null)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Primitive Tools */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        border: '1px solid #333'
      }}>
        <div style={{ color: 'white', fontSize: 12, marginBottom: 4, opacity: 0.7 }}>Add</div>
        {primitiveTools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.action}
            disabled={disabled}
            title={tool.title}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              borderRadius: 4,
              background: activeTool === tool.id ? '#007acc' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: 16,
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setActiveTool(tool.id)}
            onMouseLeave={() => setActiveTool(null)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Selection Info */}
      {(selectedObject || selectedObjects.length > 0) && (
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          borderRadius: 8,
          padding: 8,
          border: '1px solid #007acc',
          color: 'white',
          fontSize: 12,
          maxWidth: 200
        }}>
          {selectedObjects.length > 0 ? (
            <div>
              Selected: {selectedObjects.length} object(s)
              <br />
              <button
                onClick={() => onModify({
                  type: 'delete',
                  parameters: {},
                  description: `Delete ${selectedObjects.length} selected objects`,
                  timestamp: Date.now()
                })}
                style={{
                  marginTop: 4,
                  padding: '2px 6px',
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 3,
                  fontSize: 10,
                  cursor: 'pointer'
                }}
              >
                Delete Selected
              </button>
            </div>
          ) : (
            `Selected: ${selectedObject?.name || 'Object'}`
          )}
        </div>
      )}
    </div>
  );
};