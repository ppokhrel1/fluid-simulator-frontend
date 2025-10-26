import React, { useRef, useState } from 'react';
import UploadModelForm from './UploadModelForm';
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

  // Function to update AppState
  const updateAppState = (updates: Partial<AppState>) => {
    setAppState((prev: any) => ({ ...prev, ...updates }));
  };

  // Triggered when a file is selected and form is submitted successfully
  const handleModelUpload = (model: UploadedModel, file: File) => {
    console.log('Model uploaded:', model);
    console.log('File:', file);
    setUploadedModel(model);

    // Update app state
    setAppState((prev: AppState) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, model],
      status: `Loading ${model.name}...`
    }));

    // Load file into ThreeJSCanvas
    if (canvasRef.current && canvasRef.current.loadFile) {
      canvasRef.current.loadFile(file);
    } else {
      console.warn('ThreeJSCanvas ref or loadFile method not available');
    }
  };

  const handleBackToMain = () => {
    console.log('Back to main');
    // Navigate back to main page or close the form
    window.history.back(); // Or use your router
  };

  return (
    <div className="p-3" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
      {/* Upload Form - Using UploadModelForm directly */}
      <UploadModelForm 
        onUpload={handleModelUpload}
        onCancel={handleBackToMain}
      />

      {/* 3D Viewer */}
      <div className="mt-3" style={{ height: '500px', position: 'relative', border: '1px solid #ccc', borderRadius: '4px' }}>
        <ThreeJSCanvas
          ref={canvasRef}
          appState={appState}
          onStateUpdate={updateAppState}
        />
      </div>

      {/* Status Display */}
      <div className="mt-2 p-2 bg-light rounded">
        <small className="text-muted">Status: {appState.status}</small>
        {uploadedModel && (
          <div className="mt-1">
            <small className="text-success">
              Loaded: {uploadedModel.name} (ID: {uploadedModel.id})
            </small>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="mt-2">
        <BottomControlDock
          gridVisible={appState.gridVisible}
          autoRotateEnabled={appState.autoRotateEnabled}
          onToggleGrid={() => updateAppState({ gridVisible: !appState.gridVisible })}
          onAutoRotate={() => updateAppState({ autoRotateEnabled: !appState.autoRotateEnabled })}
          onResetView={() => canvasRef.current?.resetCamera?.()}
          onUploadModel={() => console.log('Trigger upload')}
          onScreenshot={() => canvasRef.current?.takeScreenshot?.()}
        />
      </div>
    </div>
  );
};

export default UpdateModelDemo;