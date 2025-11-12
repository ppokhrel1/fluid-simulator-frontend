import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF, Stats } from '@react-three/drei';
import * as THREE from 'three';

const environments = {
  Studio: 'studio',
  Sunset: 'sunset',
  Forest: 'forest',
  City: 'city',
};

const labelCategories = ['Material', 'Part', 'Function', 'Texture', 'Dimension', 'Other'];

function generateAISuggestions(filename) {
  const lower = filename.toLowerCase();
  const suggestions = [];

  if (lower.includes('engine')) suggestions.push({ text: 'Engine Block', category: 'Part' });
  if (lower.includes('chair')) suggestions.push({ text: 'Seat Cushion', category: 'Material' });
  if (lower.includes('pipe')) suggestions.push({ text: 'Pipe Connection', category: 'Function' });
  if (lower.includes('helmet')) suggestions.push({ text: 'Protective Shell', category: 'Material' });
  if (lower.includes('gear')) suggestions.push({ text: 'Gear Tooth', category: 'Dimension' });

  if (suggestions.length === 0)
    suggestions.push({ text: 'Unlabeled Object', category: 'Other' });

  return suggestions;
}

function Model({ fileUrl, labels, onLabelAdd, onLabelMove }) {
  const { scene } = useGLTF(fileUrl);
  const [draggedLabel, setDraggedLabel] = useState(null);

  const handleDoubleClick = (event) => {
    event.stopPropagation();
    const { point } = event;
    onLabelAdd(point);
  };

  const handlePointerDown = (e, i) => {
    e.stopPropagation();
    setDraggedLabel(i);
  };

  const handlePointerUp = () => {
    setDraggedLabel(null);
  };

  const handlePointerMove = (e) => {
    if (draggedLabel !== null) {
      e.stopPropagation();
      const point = e.point;
      onLabelMove(draggedLabel, [point.x, point.y, point.z]);
    }
  };

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group
      onDoubleClick={handleDoubleClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <primitive object={scene} />
      {labels.map((label, i) => (
        <Html key={i} position={label.position}>
          <div
            onPointerDown={(e) => handlePointerDown(e, i)}
            className="bg-white/80 text-xs rounded p-1 shadow-md cursor-pointer"
          >
            {label.editing ? (
              <div className="flex flex-col gap-1">
                <input
                  value={label.text}
                  onChange={(e) => label.onTextChange(i, e.target.value)}
                  onBlur={() => label.onEditToggle(i, false)}
                  className="border rounded p-1 text-xs"
                  autoFocus
                />
                <select
                  value={label.category}
                  onChange={(e) => label.onCategoryChange(i, e.target.value)}
                  className="border rounded p-1 text-xs"
                >
                  {labelCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <span onDoubleClick={() => label.onEditToggle(i, true)}>{label.text}</span>
                <div className="text-[10px] text-gray-600 italic">{label.category}</div>
              </div>
            )}
          </div>
        </Html>
      ))}
    </group>
  );
}

export default function ThreeDAssetLabelerChatbot() {
  const [fileUrl, setFileUrl] = useState('/air.stl'); // Preloaded file
  const [environment, setEnvironment] = useState('Studio');
  const [labels, setLabels] = useState([]);
  const [labelText, setLabelText] = useState('');
  const [labelCategory, setLabelCategory] = useState('Material');
  const [aiSuggestions, setAISuggestions] = useState([]);

  useEffect(() => {
    // Auto-generate AI suggestions based on preloaded file
    const suggestions = generateAISuggestions('air.stl');
    setAISuggestions(suggestions);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      const suggestions = generateAISuggestions(file.name);
      setAISuggestions(suggestions);
    }
  };

  const handleLabelAdd = (point) => {
    if (labelText.trim()) {
      setLabels([
        ...labels,
        {
          position: [point.x, point.y, point.z],
          text: labelText,
          category: labelCategory,
          editing: false,
          onEditToggle: handleEditToggle,
          onTextChange: handleTextChange,
          onCategoryChange: handleCategoryChange,
        },
      ]);
      setLabelText('');
    }
  };

  const handleLabelMove = (index, newPos) => {
    setLabels((prev) => prev.map((l, i) => (i === index ? { ...l, position: newPos } : l)));
  };

  const handleEditToggle = (index, editing) => {
    setLabels((prev) => prev.map((l, i) => (i === index ? { ...l, editing } : l)));
  };

  const handleTextChange = (index, newText) => {
    setLabels((prev) => prev.map((l, i) => (i === index ? { ...l, text: newText } : l)));
  };

  const handleCategoryChange = (index, newCategory) => {
    setLabels((prev) => prev.map((l, i) => (i === index ? { ...l, category: newCategory } : l)));
  };

  const applyAISuggestion = (suggestion) => {
    setLabelText(suggestion.text);
    setLabelCategory(suggestion.category);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex justify-between items-center p-2 bg-white shadow gap-2">
        <input type="file" accept=".glb,.gltf,.obj,.fbx,.stl" onChange={handleFileChange} />
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="border rounded p-1"
        >
          {Object.keys(environments).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="bg-white shadow p-2 flex flex-wrap gap-2 text-xs border-t">
          <div className="font-semibold">AI Suggestions:</div>
          {aiSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => applyAISuggestion(s)}
              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
            >
              {s.text} ({s.category})
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 relative">
        {fileUrl ? (
          <Canvas camera={{ position: [2, 2, 3], fov: 45 }} shadows>
            <color attach="background" args={["#f0f0f0"]} />
            <hemisphereLight intensity={0.5} groundColor="white" />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <Suspense fallback={<Html><div>Loading model...</div></Html>}>
              <Model
                fileUrl={fileUrl}
                labels={labels}
                onLabelAdd={handleLabelAdd}
                onLabelMove={handleLabelMove}
              />
              <Environment preset={environments[environment]} background={false} />
            </Suspense>
            <OrbitControls enableDamping dampingFactor={0.05} enablePan enableZoom enableRotate />
            <Stats />
          </Canvas>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Upload a 3D file to view and label
          </div>
        )}
      </div>

      <div className="p-2 bg-white flex gap-2">
        <input
          type="text"
          placeholder="Enter label text or pick an AI suggestion, then double-click on model"
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <select
          value={labelCategory}
          onChange={(e) => setLabelCategory(e.target.value)}
          className="border rounded p-2"
        >
          {labelCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
