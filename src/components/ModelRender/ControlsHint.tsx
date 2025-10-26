import React, { useState, useRef, useEffect } from 'react';

interface ControlsHintProps {
  visible: boolean;
  onClose: () => void;
  placement?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
}

const ControlsHint: React.FC<ControlsHintProps> = ({ visible, onClose, placement }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!visible) return null;

  // Initialize position based on placement prop or default
  useEffect(() => {
    if (placement) {
      const initialX = placement.right !== undefined 
        ? window.innerWidth - (placement.right as number) - 280 // 280 is the width of the hint
        : placement.left !== undefined 
        ? (placement.left as number) 
        : 16;
      
      const initialY = placement.top !== undefined 
        ? (placement.top as number)
        : placement.bottom !== undefined
        ? window.innerHeight - (placement.bottom as number) - 150 // approximate height
        : window.innerHeight - 246; // default bottom position
      
      setPosition({ x: initialX, y: initialY });
    } else {
      // Default position
      setPosition({ x: 16, y: window.innerHeight - 246 });
    }
  }, [placement, visible]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 280; // width of hint
    const maxY = window.innerHeight - 150; // approximate height of hint
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const stylePlacement: React.CSSProperties = {
    left: position.x,
    top: position.y,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  return (
    <div
      ref={containerRef}
      className="position-fixed"
      style={{
        ...stylePlacement,
        zIndex: 1060, // Higher than chatbot to be draggable
        userSelect: 'none' // Prevent text selection while dragging
      }}
    >
      <div
        className="chat-container shadow"
        style={{
          width: 280,
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          borderRadius: 14,
          color: 'white',
          padding: '14px 14px 10px 14px',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'all 0.2s ease'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="d-flex align-items-center mb-2">
          <div
            className="me-2"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #9F7AEA, #6366F1)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
            }}
          >
            <span style={{ fontWeight: 800 }}>i</span>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontWeight: 700 }}>Navigation</span>
              <div className="d-flex align-items-center gap-1">
                <div 
                  style={{ 
                    fontSize: 10, 
                    opacity: 0.6, 
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px dashed rgba(255,255,255,0.2)'
                  }}
                >
                  DRAG TO MOVE
                </div>
                <div style={{ opacity: 0.4, fontSize: 12 }}>⋮⋮</div>
              </div>
            </div>
            <div className="text-white-50" style={{ fontSize: 12 }}>Use your mouse to move around the model</div>
          </div>
          {/* Persistent hint: no dismiss button rendered */}
        </div>

        {/* Joystick/Mouse diagram */}
        <div className="d-flex align-items-center gap-3">
          {/* Mouse icon */}
          <div style={{ position: 'relative', width: 72, height: 104 }}>
            <div
              style={{
                width: 72,
                height: 104,
                borderRadius: 36,
                background: 'linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            {/* Left button */}
            <div style={{ position: 'absolute', top: 8, left: 8, right: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)' }} />
            {/* Right button */}
            <div style={{ position: 'absolute', top: 8, left: 36, right: 8, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
            {/* Wheel */}
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 10, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.9)' }} />
          </div>

          {/* Legend */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: 8, height: 8, borderRadius: 4, background: '#ffffff' }} />
              <div className="small"><strong>Left Click + Drag</strong> — Rotate</div>
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: 8, height: 8, borderRadius: 4, background: '#A5B4FC' }} />
              <div className="small"><strong>Right Click + Drag</strong> — Pan</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: 4, background: '#22D3EE' }} />
              <div className="small"><strong>Mouse Wheel</strong> — Zoom</div>
            </div>
          </div>
        </div>

        <div className="text-white-50 mt-2" style={{ fontSize: 11 }}>
          Tip: Use Reset View at the bottom if you get lost.
        </div>
      </div>
    </div>
  );
};

export default ControlsHint;
