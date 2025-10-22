import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { STLToolbar } from "../ModelRender/stl_toolbar";
import { EnhancedOrbitControls } from "../ModelRender/orbit_controls";

/**
 * Load a CFD model (URL or File) and send to backend to store in DB.
 * - If `input` is a File, it POSTs as multipart/form-data.
 * - If `input` is a string, it fetches the URL and forwards the bytes.
 *
 * Returns an object with server response and optionally a preview scene if parsePreview = true.
 */
export async function loadCFDModelAndStore(
    input: File | string,
    options?: {
        apiEndpoint?: string; // default: /api/models
        modelId?: string;
        parsePreview?: boolean; // try to parse with GLTFLoader for quick preview
    }
) {
    const apiEndpoint = options?.apiEndpoint ?? "/api/models";
    const modelId = options?.modelId;

    if (typeof input === "string") {
        // fetch remote resource and forward it as raw bytes
        const respFetch = await fetch(input);
        if (!respFetch.ok) throw new Error(`Failed to fetch model: ${respFetch.status}`);
        const arr = await respFetch.arrayBuffer();
        const filename = input.split("/").pop() ?? "model.bin";

        const headers: Record<string, string> = {
            "Content-Type": "application/octet-stream",
            "X-Filename": filename,
        };
        if (modelId) headers["X-Model-Id"] = modelId;

        const resp = await fetch(apiEndpoint, { method: "POST", body: arr, headers });
        const json = await resp.json().catch(() => ({}));

        let preview: THREE.Object3D | null = null;
        if (options?.parsePreview && filename.match(/\.(gltf|glb)$/i)) {
            try {
                const loader = new GLTFLoader();
                const gltf = await loader.parseAsync(arr, "");
                preview = gltf.scene || null;
            } catch {
                // ignore preview parse errors
            }
        }

        return { response: resp, json, preview };
    } else {
        // File
        const form = new FormData();
        form.append("file", input, input.name);
        if (modelId) form.append("modelId", modelId);

        // optionally parse a quick preview client-side for immediate rendering
        let preview: THREE.Object3D | null = null;
        try {
            if (options?.parsePreview && input.name.match(/\.(gltf|glb)$/i)) {
                const loader = new GLTFLoader();
                const buffer = await input.arrayBuffer();
                const gltf = await loader.parseAsync(buffer, "");
                preview = gltf.scene || null;
            }
        } catch {
            // ignore preview parse errors
        }

        // send form directly
        const resp = await fetch(apiEndpoint, { method: "POST", body: form });
        const json = await resp.json().catch(() => ({}));
        return { response: resp, json, preview };
    }
}

type Viewpoint = { position?: [number, number, number]; target?: [number, number, number]; fov?: number };

export type STLModification = {
  type: 'translate' | 'rotate' | 'scale' | 'boolean' | 'extrude' | 'chamfer' | 'reset' | 'add_primitive' | 'delete' | 'select' | 'zoom' | 'bounding_box_select' | string;
  parameters: any;
  description: string;
  timestamp: number;
};

export type CFDModelRendererHandle = {
  setView: (vp: Viewpoint) => void;
  setSize: (w: number, h: number) => void;
  captureImage: () => string;
  applyModification: (mod: STLModification) => Promise<void>;
  exportSTL: () => Blob;
  getSceneState: () => any;
  resetModel: () => void;
  undo: () => void;
  redo: () => void;
  getSelectedObject: () => THREE.Object3D | null;
  getSelectedObjects: () => THREE.Object3D[];
  zoomToSelection: () => void;
  zoomToFit: () => void;
};

interface CFDModelRendererProps {
  url?: string;
  file?: File;
  background?: number | string;
  initialFov?: number;
  showGrid?: boolean;
  onLoaded?: (details: { scene: THREE.Object3D }) => void;
  onModificationApplied?: (mod: STLModification) => void;
  showToolbar?: boolean;
  showChatbot?: boolean;
  apiEndpoint?: string;
  aiEndpoint?: string;
}

// Toolbar Component with Enhanced Controls


// AI Chatbot Component (unchanged, but included for completeness)
const AIChatbot: React.FC<{
  onSendMessage: (message: string) => Promise<STLModification | null>;
  onApplyModification: (mod: STLModification) => void;
  disabled?: boolean;
}> = ({ onSendMessage, onApplyModification, disabled }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; modification?: STLModification }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || disabled || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const modification = await onSendMessage(userMessage);
      
      if (modification) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: `I'll apply this modification: ${modification.description}`,
          modification
        };
        setMessages(prev => [...prev, assistantMessage]);
        onApplyModification(modification);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: "I understand your request but couldn't generate a specific modification. Please try being more specific about what you want to change." 
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "Sorry, I encountered an error processing your request. Please try again." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const applyModificationFromMessage = (modification: STLModification) => {
    onApplyModification(modification);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      right: 10,
      width: 400,
      height: 500,
      background: 'rgba(0,0,0,0.95)',
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: '1px solid #444',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        padding: 16,
        borderBottom: '1px solid #333',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        background: 'linear-gradient(135deg, #007acc 0%, #005a9e 100%)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}>
        🤖 AI STL Assistant
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        background: 'rgba(30,30,30,0.9)'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontStyle: 'italic',
            marginTop: 20
          }}>
            Ask me to modify your STL model. Try:
            <br />
            "Add a cube to the top"
            <br />
            "Rotate 90 degrees around X axis"
            <br />
            "Make it twice as big"
            <br />
            "Select the main object"
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 12,
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 18,
              background: msg.role === 'user' ? '#007acc' : '#333',
              color: 'white',
              maxWidth: '85%',
              wordWrap: 'break-word',
              borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
              borderBottomLeftRadius: msg.role === 'user' ? 18 : 4
            }}>
              {msg.content}
              {msg.modification && (
                <button
                  onClick={() => applyModificationFromMessage(msg.modification!)}
                  style={{
                    marginTop: 8,
                    padding: '4px 8px',
                    border: '1px solid #007acc',
                    background: 'transparent',
                    color: '#007acc',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Apply Again
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ 
            textAlign: 'left', 
            color: '#ccc', 
            fontStyle: 'italic',
            padding: '10px 14px',
            background: '#333',
            borderRadius: 18,
            display: 'inline-block'
          }}>
            Thinking...
            <span style={{ marginLeft: 8 }}>
              <span style={{ animation: 'dot1 1.5s infinite' }}>.</span>
              <span style={{ animation: 'dot2 1.5s infinite' }}>.</span>
              <span style={{ animation: 'dot3 1.5s infinite' }}>.</span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: 16,
        borderTop: '1px solid #333',
        background: 'rgba(40,40,40,0.9)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to modify the STL (e.g., 'add cube', 'rotate 45 degrees')..."
            disabled={disabled || isLoading}
            style={{
              flex: 1,
              padding: 12,
              border: '1px solid #555',
              borderRadius: 8,
              background: '#222',
              color: 'white',
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: 8,
              background: disabled ? '#555' : '#007acc',
              color: 'white',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              minWidth: 80
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dot1 {
          0%, 20% { opacity: 0; }
          40% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        @keyframes dot2 {
          0%, 40% { opacity: 0; }
          60% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        @keyframes dot3 {
          0%, 60% { opacity: 0; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export const CFDModelRenderer = forwardRef<CFDModelRendererHandle, CFDModelRendererProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<EnhancedOrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const originalModelStateRef = useRef<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    matrix: THREE.Matrix4;
  } | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  // Bounding box selection
  const selectionBoxRef = useRef<THREE.BoxHelper | null>(null);
  const isSelectingRef = useRef<boolean>(false);
  const selectionStartRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const selectionEndRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const selectionRectRef = useRef<HTMLDivElement | null>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [sceneState, setSceneState] = useState<any>(null);
  const [modificationHistory, setModificationHistory] = useState<STLModification[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<THREE.Object3D[]>([]);
  const [primitives, setPrimitives] = useState<THREE.Object3D[]>([]);
  const [isBoundingBoxSelecting, setIsBoundingBoxSelecting] = useState(false);

  // Enhanced pattern matching for AI commands with zoom and selection
  const handleAIPatternMatching = (message: string): STLModification | null => {
    const lowerMessage = message.toLowerCase().trim();
    
    const patterns = [
      // Zoom patterns
      {
        pattern: /(zoom in|closer|magnify)/i,
        handler: () => ({
          type: 'zoom',
          parameters: { direction: 'in', amount: 0.5 },
          description: 'Zoom in',
          timestamp: Date.now()
        })
      },
      {
        pattern: /(zoom out|farther|reduce)/i,
        handler: () => ({
          type: 'zoom',
          parameters: { direction: 'out', amount: 0.5 },
          description: 'Zoom out',
          timestamp: Date.now()
        })
      },
      {
        pattern: /(zoom fit|fit view|see all)/i,
        handler: () => ({
          type: 'zoom',
          parameters: { direction: 'fit' },
          description: 'Zoom to fit all objects',
          timestamp: Date.now()
        })
      },
      // Bounding box selection patterns
      {
        pattern: /(select multiple|box select|select area)/i,
        handler: () => ({
          type: 'bounding_box_select',
          parameters: { enable: true },
          description: 'Enable bounding box selection',
          timestamp: Date.now()
        })
      },
      // Add primitive patterns (existing)
      {
        pattern: /(add|create|insert).*?(cube|box|square)/i,
        handler: () => ({
          type: 'add_primitive',
          parameters: { primitive: 'cube', position: [0, 2, 0], size: 1 },
          description: 'Add a cube to the scene',
          timestamp: Date.now()
        })
      },
      {
        pattern: /(add|create|insert).*?(sphere|ball)/i,
        handler: () => ({
          type: 'add_primitive',
          parameters: { primitive: 'sphere', position: [0, 2, 0], radius: 0.5 },
          description: 'Add a sphere to the scene',
          timestamp: Date.now()
        })
      },
      {
        pattern: /(add|create|insert).*?(cylinder|tube)/i,
        handler: () => ({
          type: 'add_primitive',
          parameters: { primitive: 'cylinder', position: [0, 2, 0], radius: 0.5, height: 1 },
          description: 'Add a cylinder to the scene',
          timestamp: Date.now()
        })
      },
      // Selection patterns
      {
        pattern: /(select|choose).*?(object|model|main)/i,
        handler: () => ({
          type: 'select',
          parameters: { object: 'main' },
          description: 'Select the main object',
          timestamp: Date.now()
        })
      },
      // Transform patterns (existing)
      {
        pattern: /(rotate|turn|spin).*?(\d+).*?(degree|deg).*?(x|y|z|horizontal|vertical)/i,
        handler: (match: RegExpMatchArray) => ({
          type: 'rotate',
          parameters: { axis: match[4].toLowerCase(), angle: THREE.MathUtils.degToRad(parseInt(match[2])) },
          description: `Rotate ${match[4].toUpperCase()} axis by ${match[2]} degrees`,
          timestamp: Date.now()
        })
      },
      {
        pattern: /(scale|size|resize).*?(up|larger|bigger|increase)/i,
        handler: () => ({
          type: 'scale',
          parameters: { factor: 1.5 },
          description: 'Scale up by 1.5x',
          timestamp: Date.now()
        })
      },
      {
        pattern: /(reset|original|start over)/i,
        handler: () => ({
          type: 'reset',
          parameters: {},
          description: 'Reset to original state',
          timestamp: Date.now()
        })
      }
    ];

    for (const { pattern, handler } of patterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        return handler(match);
      }
    }

    return null;
  };

  // AI Chatbot message handler
  const handleAIMessage = useCallback(async (message: string): Promise<STLModification | null> => {
    const currentState = getSceneState();
    
    // Try AI agent first, then fallback to pattern matching
    if (props.aiEndpoint || process.env.REACT_APP_OPENAI_API_KEY) {
      try {
        const response = await fetch(props.aiEndpoint || 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a 3D modeling assistant. Help users modify STL files with commands like:
                - translate/move [direction] [distance]
                - rotate/turn [axis] [degrees] 
                - scale/resize [factor]
                - add [primitive] [position]
                - select [object]
                - zoom [in/out/fit]
                - bounding_box_select [enable/disable]
                - reset
                
                Current scene state: ${JSON.stringify(currentState)}
                Respond with JSON: { "type": "command", "parameters": {...}, "description": "human readable" }`
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          
          try {
            const modification = JSON.parse(content);
            modification.timestamp = Date.now();
            return modification;
          } catch {
            // If JSON parsing fails, fall back to pattern matching
            return handleAIPatternMatching(message);
          }
        }
      } catch (error) {
        console.warn('AI API call failed, falling back to pattern matching:', error);
      }
    }
    
    return handleAIPatternMatching(message);
  }, [props.aiEndpoint]);

  // Apply modification to the STL
  const applyModification = useCallback(async (mod: STLModification) => {
    if (!modelRootRef.current) return;

    const model = modelRootRef.current;
    let newMod = { ...mod, timestamp: Date.now() };
    
    switch (mod.type) {
      case 'translate':
        const targets = selectedObjects.length > 0 ? selectedObjects : (selectedObject ? [selectedObject] : [model]);
        targets.forEach(target => {
          target.position.x += mod.parameters.x || 0;
          target.position.y += mod.parameters.y || 0;
          target.position.z += mod.parameters.z || 0;
        });
        break;
        
      case 'rotate':
        const axis = new THREE.Vector3();
        switch (mod.parameters.axis) {
          case 'x': axis.set(1, 0, 0); break;
          case 'y': axis.set(0, 1, 0); break; // Corrected: This was previously 'x'
          case 'z': axis.set(0, 0, 1); break;
          default: axis.set(0, 1, 0); break;
        }
        const rotateTargets = selectedObjects.length > 0 ? selectedObjects : (selectedObject ? [selectedObject] : [model]);
        rotateTargets.forEach(target => {
          target.rotateOnWorldAxis(axis, mod.parameters.angle || 0);
        });
        break;
        
      case 'scale':
        const scaleTargets = selectedObjects.length > 0 ? selectedObjects : (selectedObject ? [selectedObject] : [model]);
        scaleTargets.forEach(target => {
          target.scale.multiplyScalar(mod.parameters.factor || 1);
        });
        break;
        
      case 'zoom':
        if (mod.parameters.direction === 'in') {
          cameraRef.current?.position.multiplyScalar(0.9);
        } else if (mod.parameters.direction === 'out') {
          cameraRef.current?.position.multiplyScalar(1.1);
        } else if (mod.parameters.direction === 'fit') {
          zoomToFit();
        }
        break;
        
      case 'bounding_box_select':
        setIsBoundingBoxSelecting(mod.parameters.enable);
        break;
        
      case 'delete':
        // Delete selected objects
        if (selectedObjects.length > 0) {
          selectedObjects.forEach(obj => {
            sceneRef.current?.remove(obj);
          });
          setPrimitives(prev => prev.filter(p => !selectedObjects.includes(p)));
          setSelectedObjects([]);
        } else if (selectedObject && selectedObject.parent !== modelRootRef.current) {
          // Only delete if it's not the main model
          sceneRef.current?.remove(selectedObject);
          setPrimitives(prev => prev.filter(p => p !== selectedObject));
          setSelectedObject(null);
        }
        break;
        
      case 'reset':
        if (originalModelStateRef.current) {
          model.position.copy(originalModelStateRef.current.position);
          model.rotation.copy(originalModelStateRef.current.rotation);
          model.scale.copy(originalModelStateRef.current.scale);
        } else {
          model.position.set(0, 0, 0);
          model.rotation.set(0, 0, 0);
          model.scale.set(1, 1, 1);
        }
        // Reset primitives
        primitives.forEach(primitive => sceneRef.current?.remove(primitive));
        setPrimitives([]);
        setSelectedObject(null);
        setSelectedObjects([]);
        break;
        
      case 'add_primitive':
        const primitive = createPrimitive(mod.parameters);
        if (primitive) {
          sceneRef.current?.add(primitive);
          setPrimitives(prev => [...prev, primitive]);
          setSelectedObject(primitive);
          setSelectedObjects([primitive]);
          newMod.description = `Added ${mod.parameters.primitive} to scene`;
        }
        break;
        
      case 'select':
        if (mod.parameters.object === 'main' && modelRootRef.current?.children[0]) {
          setSelectedObject(modelRootRef.current.children[0]);
          setSelectedObjects([]);
        }
        break;
    }
    
    if (modelRootRef.current) {
      modelRootRef.current.updateMatrixWorld(true);
    }
    
    // Add to history
    const newHistory = modificationHistory.slice(0, historyIndex + 1);
    newHistory.push(newMod);
    setModificationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    props.onModificationApplied?.(newMod);
    setSceneState(getSceneState());
    
    // Send to backend if API endpoint provided
    if (props.apiEndpoint) {
      try {
        await fetch(props.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modification: newMod,
            sceneState: getSceneState(),
            timestamp: newMod.timestamp
          })
        });
      } catch (error) {
        console.warn('Failed to send modification to backend:', error);
      }
    }
  }, [modificationHistory, historyIndex, selectedObject, selectedObjects, primitives, props.onModificationApplied, props.apiEndpoint]);

  // Create primitive shapes
  const createPrimitive = useCallback((params: any): THREE.Mesh | null => {
    let geometry: THREE.BufferGeometry;
    let material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(Math.random() * 0xffffff),
      metalness: 0.3,
      roughness: 0.4
    });

    switch (params.primitive) {
      case 'cube':
        geometry = new THREE.BoxGeometry(params.size || 1, params.size || 1, params.size || 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(params.radius || 0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(params.radius || 0.5, params.radius || 0.5, params.height || 1, 32);
        break;
      default:
        return null;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      params.position?.[0] || 0,
      params.position?.[1] || 2,
      params.position?.[2] || 0
    );
    mesh.name = `${params.primitive}_${Date.now()}`;
    
    return mesh;
  }, []);

  // Add primitive function
  const addPrimitive = useCallback((type: string) => {
    const mod: STLModification = {
      type: 'add_primitive',
      parameters: { primitive: type, position: [0, 2, 0] },
      description: `Add ${type} to scene`,
      timestamp: Date.now()
    };
    applyModification(mod);
  }, [applyModification]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    applyModification({
      type: 'zoom',
      parameters: { direction: 'in', amount: 0.5 },
      description: 'Zoom in',
      timestamp: Date.now()
    });
  }, [applyModification]);

  const zoomOut = useCallback(() => {
    applyModification({
      type: 'zoom',
      parameters: { direction: 'out', amount: 0.5 },
      description: 'Zoom out',
      timestamp: Date.now()
    });
  }, [applyModification]);

  const zoomToFit = useCallback(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    if (!scene || !camera || !controls) return;

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

    // Add some padding
    cameraZ *= 1.2;

    camera.position.copy(center);
    camera.position.z += cameraZ;
    controls.target.copy(center);
    camera.lookAt(center);
  }, []);

  const zoomToSelection = useCallback(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    if (!scene || !camera || !controls) return;

    const targets = selectedObjects.length > 0 ? selectedObjects : (selectedObject ? [selectedObject] : [scene]);
    
    const box = new THREE.Box3();
    targets.forEach(target => {
      box.expandByObject(target);
    });
    
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

    // Add some padding
    cameraZ *= 1.2;

    camera.position.copy(center);
    camera.position.z += cameraZ;
    controls.target.copy(center);
    camera.lookAt(center);
  }, [selectedObject, selectedObjects]);

  // Bounding box selection functions
  const startBoundingBoxSelection = useCallback((event: React.MouseEvent) => {
    if (!isBoundingBoxSelecting || !containerRef.current) return;

    event.preventDefault();
    isSelectingRef.current = true;
    
    const rect = containerRef.current.getBoundingClientRect();
    selectionStartRef.current.set(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    
    // Create selection rectangle
    if (!selectionRectRef.current) {
      const rectEl = document.createElement('div');
      rectEl.style.position = 'absolute';
      rectEl.style.border = '2px dashed #007acc';
      rectEl.style.background = 'rgba(0, 122, 204, 0.2)';
      rectEl.style.pointerEvents = 'none';
      rectEl.style.zIndex = '1000';
      selectionRectRef.current = rectEl;
      containerRef.current.appendChild(rectEl);
    }
  }, [isBoundingBoxSelecting]);

  const updateBoundingBoxSelection = useCallback((event: React.MouseEvent) => {
    if (!isSelectingRef.current || !containerRef.current || !selectionRectRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    selectionEndRef.current.set(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    // Update selection rectangle
    const left = Math.min(selectionStartRef.current.x, selectionEndRef.current.x);
    const top = Math.min(selectionStartRef.current.y, selectionEndRef.current.y);
    const width = Math.abs(selectionEndRef.current.x - selectionStartRef.current.x);
    const height = Math.abs(selectionEndRef.current.y - selectionStartRef.current.y);

    selectionRectRef.current.style.left = `${left}px`;
    selectionRectRef.current.style.top = `${top}px`;
    selectionRectRef.current.style.width = `${width}px`;
    selectionRectRef.current.style.height = `${height}px`;
  }, []);

  const finishBoundingBoxSelection = useCallback(() => {
    if (!isSelectingRef.current || !containerRef.current || !cameraRef.current || !sceneRef.current) {
      return;
    }

    isSelectingRef.current = false;

    // Remove selection rectangle
    if (selectionRectRef.current && selectionRectRef.current.parentNode) {
      selectionRectRef.current.parentNode.removeChild(selectionRectRef.current);
      selectionRectRef.current = null;
    }

    // Convert screen coordinates to normalized device coordinates
    const rect = containerRef.current.getBoundingClientRect();
    const start = new THREE.Vector2();
    const end = new THREE.Vector2();

    start.x = ((selectionStartRef.current.x - rect.left) / rect.width) * 2 - 1;
    start.y = -((selectionStartRef.current.y - rect.top) / rect.height) * 2 + 1;
    end.x = ((selectionEndRef.current.x - rect.left) / rect.width) * 2 - 1;
    end.y = -((selectionEndRef.current.y - rect.top) / rect.height) * 2 + 1;

    // Create bounding box in normalized device coordinates
    const box = new THREE.Box2(
      new THREE.Vector2(Math.min(start.x, end.x), Math.min(start.y, end.y)),
      new THREE.Vector2(Math.max(start.x, end.x), Math.max(start.y, end.y))
    );

    // Find objects in the selection box
    const selected: THREE.Object3D[] = [];
    const allSelectableObjects: THREE.Object3D[] = [];
    
    sceneRef.current.traverse((object: any) => {
      if (object instanceof THREE.Mesh && object as any !== modelRootRef.current) {
        allSelectableObjects.push(object);
      }
    });

    allSelectableObjects.forEach(object => {
      const boundingBox = new THREE.Box3().setFromObject(object);
      const boundingBoxPoints = [
        new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
        new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z)
      ];

      let isInside = false;
      for (const point of boundingBoxPoints) {
        point.project(cameraRef.current!);
        if (point.x >= box.min.x && point.x <= box.max.x && 
            point.y >= box.min.y && point.y <= box.max.y) {
          isInside = true;
          break;
        }
      }

      if (isInside) {
        selected.push(object);
      }
    });

    setSelectedObjects(selected);
    setSelectedObject(selected.length === 1 ? selected[0] : null);
  }, []);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // In a real implementation, you would restore the previous state
      console.log('Undo to index:', historyIndex - 1);
    }
  }, [historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < modificationHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // In a real implementation, you would restore the next state
      console.log('Redo to index:', historyIndex + 1);
    }
  }, [historyIndex, modificationHistory.length]);

  // Export STL function
  const exportSTL = useCallback((): Blob => {
    const exporter = new STLExporter();
    const scene = sceneRef.current;
    if (!scene) {
      throw new Error('No scene to export');
    }
    
    const stlString = exporter.parse(scene);
    return new Blob([stlString], { type: 'application/octet-stream' });
  }, []);

  // Reset model to original state
  const resetModel = useCallback(() => {
    applyModification({
      type: 'reset',
      parameters: {},
      description: 'Reset model to original state',
      timestamp: Date.now()
    });
  }, [applyModification]);

  // Get current scene state
  const getSceneState = useCallback(() => {
    if (!modelRootRef.current) return null;
    
    const model = modelRootRef.current;
    return {
      position: model.position.toArray(),
      rotation: [model.rotation.x, model.rotation.y, model.rotation.z],
      scale: model.scale.toArray(),
      primitives: primitives.map(p => ({
        type: p.name.split('_')[0],
        position: p.position.toArray(),
        name: p.name
      })),
      selectedObject: selectedObject?.name || null,
      selectedObjects: selectedObjects.map(o => o.name)
    };
  }, [primitives, selectedObject, selectedObjects]);

  // Get selected object
  const getSelectedObject = useCallback(() => {
    return selectedObject;
  }, [selectedObject]);

  // Get selected objects
  const getSelectedObjects = useCallback(() => {
    return selectedObjects;
  }, [selectedObjects]);

  // Mouse click handler for selection
  const handleMouseClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || isBoundingBoxSelecting) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // Check intersections with all objects in the scene
    const intersectableObjects: THREE.Object3D[] = [];
    sceneRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        intersectableObjects.push(object);
      }
    });

    const intersects = raycasterRef.current.intersectObjects(intersectableObjects, true);
    
    if (intersects.length > 0) {
      setSelectedObject(intersects[0].object);
      setSelectedObjects([intersects[0].object]);
    } else {
      setSelectedObject(null);
      setSelectedObjects([]);
    }
  }, [isBoundingBoxSelecting]);

  useImperativeHandle(
    ref,
    () => ({
      setView(vp: Viewpoint) {
        const cam = cameraRef.current;
        const ctrls = controlsRef.current;
        if (!cam || !ctrls) return;
        if (vp.fov !== undefined) cam.fov = vp.fov;
        if (vp.position) cam.position.set(...vp.position);
        if (vp.target) ctrls.target.set(...vp.target);
        cam.updateProjectionMatrix();
        ctrls.update();
      },
      setSize(w: number, h: number) {
        const renderer = rendererRef.current;
        const cam = cameraRef.current;
        if (!renderer || !cam) return;
        renderer.setSize(w, h);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      },
      captureImage() {
        const renderer = rendererRef.current;
        if (!renderer) return "";
        return renderer.domElement.toDataURL("image/png");
      },
      applyModification,
      exportSTL,
      getSceneState,
      resetModel,
      undo,
      redo,
      getSelectedObject,
      getSelectedObjects,
      zoomToSelection,
      zoomToFit
    }),
    [applyModification, exportSTL, getSceneState, resetModel, undo, redo, getSelectedObject, getSelectedObjects, zoomToSelection, zoomToFit]
  );

  // Store original model state when loaded
  const storeOriginalState = useCallback((model: THREE.Object3D) => {
    originalModelStateRef.current = {
      position: model.position.clone(),
      rotation: model.rotation.clone(),
      scale: model.scale.clone(),
      matrix: model.matrix.clone()
    };
  }, []);

  // Setup Three.js scene and event listeners - FIXED CLEANUP
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    rendererRef.current = renderer;
    
    // Use a wrapper div to avoid direct DOM manipulation that conflicts with React
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = '100%';
    canvasWrapper.style.height = '100%';
    canvasWrapper.appendChild(renderer.domElement);
    container.appendChild(canvasWrapper);

    const scene = new THREE.Scene();
    scene.background =
        props.background !== undefined ? new THREE.Color(props.background as any) : new THREE.Color(0x111111);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(props.initialFov ?? 45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const controls = new EnhancedOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // Optional grid
    if (props.showGrid !== false) {
      const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      scene.add(grid);
    }

    const root = new THREE.Group();
    modelRootRef.current = root;
    scene.add(root);

    // Add click event listener for selection
    container.addEventListener('click', handleMouseClick);

    // Animation loop
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize handling
    let ro: ResizeObserver | null = null;
    let resizeListener: (() => void) | null = null;
    
    const handleResize = () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(container);
    } else {
      resizeListener = handleResize;
      window.addEventListener("resize", handleResize);
    }

    return () => {
      // Proper cleanup to prevent DOM conflicts
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      
      controls.dispose();
      renderer.dispose();
      
      // Remove event listeners
      container.removeEventListener('click', handleMouseClick);
      
      if (ro) {
        ro.disconnect();
      } else if (resizeListener) {
        window.removeEventListener("resize", resizeListener);
      }
      
      // Clean up Three.js objects
      if (sceneRef.current) {
        sceneRef.current.traverse((object: any) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      // Remove canvas wrapper instead of all container children
      if (canvasWrapper.parentNode === container) {
        container.removeChild(canvasWrapper);
      }
    };
  }, []);

  // Modified model loading effect with proper cleanup
  useEffect(() => {
    const root = modelRootRef.current;
    if (!root) return;
    
    let cancelled = false;

    const addSceneObject = (obj: THREE.Object3D) => {
      if (cancelled) return;
      
      // Clear existing children with proper disposal
      while (root.children.length) {
        const child = root.children[0];
        root.remove(child);
        // Dispose of geometries and materials
        child.traverse((object: any) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      root.add(obj);
      
      // Store original state before any transformations
      storeOriginalState(obj);
      
      // center and scale object to fit view
      const box = new THREE.Box3().setFromObject(obj);
      if (!box.isEmpty()) {
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 2.5 / maxDim;
          obj.scale.setScalar(scale);
          const center = new THREE.Vector3();
          box.getCenter(center);
          obj.position.copy(center).multiplyScalar(-scale);
        }
      }
      
      setIsModelLoaded(true);
      setSceneState(getSceneState());
      setModificationHistory([]);
      setHistoryIndex(-1);
      setSelectedObject(obj);
      setSelectedObjects([obj]);
      props.onLoaded?.({ scene: obj });
    };

    const loadUrl = async (url: string) => {
      try {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(url);
        if (!cancelled) {
          addSceneObject(gltf.scene);
        }
      } catch (e) {
        console.warn("Failed to load model:", e);
      }
    };

    const loadFile = async (file: File) => {
      const name = file.name.toLowerCase();
      if (name.endsWith(".gltf") || name.endsWith(".glb")) {
        const loader = new GLTFLoader();
        const buffer = await file.arrayBuffer();
        const gltf = await loader.parseAsync(buffer, "");
        if (!cancelled) {
          addSceneObject(gltf.scene);
        }
      } else {
        const url = URL.createObjectURL(file);
        try {
          await loadUrl(url);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    };

    if (props.url) {
      loadUrl(props.url);
    } else if (props.file) {
      loadFile(props.file);
    }

    return () => {
      cancelled = true;
    };
  }, [props.url, props.file, props.onLoaded, storeOriginalState, getSceneState]);

  // Bounding box selection event handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => startBoundingBoxSelection(e as any);
    const handleMouseMove = (e: MouseEvent) => updateBoundingBoxSelection(e as any);
    const handleMouseUp = () => finishBoundingBoxSelection();

    if (isBoundingBoxSelecting) {
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isBoundingBoxSelecting, startBoundingBoxSelection, updateBoundingBoxSelection, finishBoundingBoxSelection]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "100%", overflow: "hidden", position: 'absolute' }}
      onMouseDown={startBoundingBoxSelection}
      onMouseMove={updateBoundingBoxSelection}
      onMouseUp={finishBoundingBoxSelection}
    >
      {/* Toolbar */}
      {props.showToolbar !== false && (
        <STLToolbar 
          onModify={applyModification}
          onExport={exportSTL}
          onReset={resetModel}
          onUndo={undo}
          onRedo={redo}
          onAddPrimitive={addPrimitive}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomFit={zoomToFit}
          onBoundingBoxSelect={setIsBoundingBoxSelecting}
          selectedObject={selectedObject}
          selectedObjects={selectedObjects}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < modificationHistory.length - 1}
          isBoundingBoxSelecting={isBoundingBoxSelecting}
          disabled={!isModelLoaded}
        />
      )}
      
      {/* AI Chatbot */}
      {props.showChatbot !== false && (
        <AIChatbot 
          onSendMessage={handleAIMessage}
          onApplyModification={applyModification}
          disabled={!isModelLoaded}
        />
      )}

      {/* Loading Indicator */}
      {!isModelLoaded && (props.url || props.file) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          background: 'rgba(0,0,0,0.7)',
          padding: 20,
          borderRadius: 8,
          zIndex: 999
        }}>
          Loading model...
        </div>
      )}

      {/* Selection Highlight */}
      {(selectedObject || selectedObjects.length > 0) && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 60,
          background: 'rgba(0, 122, 204, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 14,
          zIndex: 999
        }}>
          {selectedObjects.length > 0 ? (
            `✓ Selected: ${selectedObjects.length} object(s)`
          ) : (
            `✓ Selected: ${selectedObject?.name || 'Object'}`
          )}
        </div>
      )}

      {/* Bounding Box Selection Mode Indicator */}
      {isBoundingBoxSelecting && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#007acc',
          background: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold',
          zIndex: 999,
          border: '2px solid #007acc'
        }}>
          🟦 Bounding Box Selection Mode - Drag to select multiple objects
        </div>
      )}
    </div>
  );
});

// Enhanced OrbitControls with proper zoom functionality


/**
 * Helper to create an optimized HTTPS server.
 * This is a thin wrapper around node:https.createServer to apply sensible defaults
 * for performance (keepAlive, timeouts). Provide TLS options as usual.
 *
 * Example:
 * const server = createSecureServerOptimized({ key, cert }, (req, res) => { ... });
 * server.listen(8443);
 */
export function createSecureServerOptimized(tlsOptions: any, requestHandler?: (req: any, res: any) => void) {
  // This helper is server-side only. In browser builds we throw early to avoid bundling 'https'.
  if (typeof window !== "undefined") {
    throw new Error("createSecureServerOptimized can only be used in Node.js environment");
  }

  // Delay require so bundlers don't try to include 'https' in browser bundles.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createServer: createHttpsServer } = require("https");

  const wrappedHandler = requestHandler
    ? (req: any, res: any) => {
        try {
          requestHandler(req, res);
        } catch (err) {
          try {
            res.statusCode = 500;
            res.end("Server error");
          } catch {
            /* ignore */
          }
        }
      }
    : undefined;

  const server = createHttpsServer({ ...tlsOptions }, wrappedHandler);

  // sensible timeouts and limits
  server.setTimeout(2 * 60 * 1000); // 2 minutes
  server.maxConnections = server.maxConnections ?? 1000;
  return server;
}

export default CFDModelRenderer;