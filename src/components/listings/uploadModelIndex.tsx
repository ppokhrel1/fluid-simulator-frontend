import React, { useRef, useState } from 'react';
import UploadModelsPage from './UploadNewModel';
import ThreeJSCanvas from '../ModelRender/ThreeJSCanvas';
import BottomControlDock from '../ModelRender/BottomControlDock';
import type { UploadedModel, AppState } from '../../types';

export const UpdateModelDemo: React.FC = () => {
  const canvasRef = useRef<any>(null);
  const [uploadedModel, setUploadedModel] = useState<UploadedModel | null>(null);
  const [appState, setAppState] = useState<AppState>({
    gridVisible: true,
    autoRotateEnabled: false,
    chatMessages: [],
    leftDockExpanded: false,
    selectedAiModel: 'gpt-4-turbo',
    status: 'Ready for upload',
    uploadedFiles: [],
    isTyping: false,
    view: 'main'
  });

  // Triggered immediately when a file is selected
  const handleModelSelect = (model: UploadedModel, file: File) => {
    console.log('Model selected:', model);
    console.log('File:', file);
    setUploadedModel(model);

    // Update app state
    setAppState(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, model],
      status: `Loading ${model.name}...`
    }));

    // Load file into ThreeJSCanvas
    if (canvasRef.current) {
      canvasRef.current.loadFile(file);
    }
  };

  const handleBackToMain = () => {
    console.log('Back to main');
    alert('Going back to main page');
  };

  return (
    <div className="p-3">
      {/* Upload Form */}
      <UploadModelsPage 
        onUpload={handleModelSelect}
        onCancel={handleBackToMain}
      />

      {/* 3D Viewer */}
      <div className="mt-3" style={{ height: '500px', position: 'relative' }}>
        <ThreeJSCanvas
          ref={canvasRef}
          appState={appState}
          onStateUpdate={(updates: Partial<AppState>) =>
            setAppState(prev => ({ ...prev, ...updates }))
          }
        />
      </div>

      {/* Bottom Controls */}
      <div className="mt-2">
        <BottomControlDock
          gridVisible={appState.gridVisible}
          autoRotateEnabled={appState.autoRotateEnabled}
          onToggleGrid={() => setAppState(prev => ({ ...prev, gridVisible: !prev.gridVisible }))}
          onAutoRotate={() => setAppState(prev => ({ ...prev, autoRotateEnabled: !prev.autoRotateEnabled }))}
          onResetView={() => canvasRef.current?.resetCamera()}
          onUploadModel={() => console.log('Trigger upload')}
          onScreenshot={() => canvasRef.current?.takeScreenshot()}
        />
      </div>
    </div>
  );
};

export default UpdateModelDemo;
