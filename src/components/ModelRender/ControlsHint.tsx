import React from 'react';

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
  if (!visible) return null;

  // Build placement only from provided sides; if none provided, default to bottom-left
  const stylePlacement: React.CSSProperties = {};
  if (placement) {
    if (placement.top !== undefined) stylePlacement.top = placement.top;
    if (placement.right !== undefined) stylePlacement.right = placement.right;
    if (placement.bottom !== undefined) stylePlacement.bottom = placement.bottom;
    if (placement.left !== undefined) stylePlacement.left = placement.left;
  } else {
    stylePlacement.left = 16;
    stylePlacement.bottom = 96;
  }

  return (
    <div
      className="position-fixed"
      style={{
        ...stylePlacement,
        zIndex: 2000,
      }}
    >
      <div
        className="chat-container shadow"
        style={{
          width: 300,
          background: 'rgba(0, 0, 0, 0.8)', // Match pressure bar background
          border: '1px solid rgba(255, 255, 255, 0.15)', // Match pressure bar border
          backdropFilter: 'blur(12px)', // Match pressure bar blur
          borderRadius: 12, // Consistent border radius
          color: 'white',
          padding: '16px',
          marginLeft: '24px' // Exactly match pressure bar's ms-4 margin (1.5rem = 24px)
        }}
      >
        <div className="d-flex align-items-center mb-2">
          <div
            className="me-3"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <i className="fas fa-mouse-pointer" style={{ fontSize: '14px', color: 'white' }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '2px' }}>Navigation</div>
            <div className="text-white-50" style={{ fontSize: '13px' }}>Use your mouse to move around the model</div>
          </div>
          {/* Persistent hint: no dismiss button rendered */}
        </div>

        {/* Mouse diagram */}
        <div className="d-flex align-items-center gap-4 mt-3">
          {/* Mouse icon */}
          <div style={{ position: 'relative', width: 70, height: 100 }}>
            <div
              style={{
                width: 70,
                height: 100,
                borderRadius: 35,
                background: 'linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            />
            {/* Left button */}
            <div style={{ position: 'absolute', top: 8, left: 8, right: 35, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
            {/* Right button */}
            <div style={{ position: 'absolute', top: 8, left: 35, right: 8, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
            {/* Wheel */}
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 8, height: 20, borderRadius: 4, background: 'rgba(34,211,238,0.9)' }} />
          </div>

          {/* Legend */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{ width: 10, height: 10, borderRadius: 5, background: '#ffffff', flexShrink: 0 }} />
              <div style={{ fontSize: '14px' }}><strong>Left Click + Drag</strong> — Rotate</div>
            </div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{ width: 10, height: 10, borderRadius: 5, background: '#A5B4FC', flexShrink: 0 }} />
              <div style={{ fontSize: '14px' }}><strong>Right Click + Drag</strong> — Pan</div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 10, height: 10, borderRadius: 5, background: '#22D3EE', flexShrink: 0 }} />
              <div style={{ fontSize: '14px' }}><strong>Mouse Wheel</strong> — Zoom</div>
            </div>
          </div>
        </div>

        <div className="text-white-50 mt-3 pt-2" style={{ fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          💡 Tip: Use Reset View at the bottom if you get lost.
        </div>
      </div>
    </div>
  );
};

export default ControlsHint;
