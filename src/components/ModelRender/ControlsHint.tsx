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
          width: 280,
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          borderRadius: 14,
          color: 'white',
          padding: '14px 14px 10px 14px'
        }}
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
          <div>
            <div style={{ fontWeight: 700 }}>Navigation</div>
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
