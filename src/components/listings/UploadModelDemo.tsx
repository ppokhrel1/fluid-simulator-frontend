import React, { useRef, useState, useEffect } from 'react';
import UploadModelForm from './UploadModelForm';
import DebugStorage from './DebugStorage';
import ThreeJSCanvas from '../ModelRender/ThreeJSCanvas';
import BottomControlDock from '../ModelRender/BottomControlDock';
import type { UploadedModel, AppState } from '../../types';
import { 
  getUploadSession, 
  restoreFileFromSession, 
  clearUploadSession,
  hasActiveUploadSession,
  getUploadSessionInfo 
} from '../../utils/uploadPersistence';
import { Alert, Button } from 'react-bootstrap';

export const UpdateModelDemo: React.FC = () => {
  const canvasRef = useRef<any>(null);
  const [uploadedModel, setUploadedModel] = useState<UploadedModel | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>({
    gridVisible: true,
    autoRotateEnabled: false,
    chatMessages: [],
    leftDockExpanded: false,
    selectedAiModel: 'gpt-4-turbo',
    status: 'Ready for upload',
    uploadedFiles: [],
    isTyping: false,
    view: 'models-list' // Changed from 'main' to avoid main page conflicts
  });

  // Check for active upload session on component mount
  useEffect(() => {
    const checkSession = () => {
      const session = getUploadSession();
      const sessionExists = hasActiveUploadSession();
      const info = getUploadSessionInfo();
      
      setHasActiveSession(sessionExists);
      setSessionInfo(info);
      
      if (session && session.uploadedModel) {
        setUploadedModel(session.uploadedModel);
        setAppState(prev => ({
          ...prev,
          uploadedFiles: [session.uploadedModel],
          status: 'Model loaded from previous session'
        }));
        
        // Try to restore the file in the canvas
        try {
          const file = restoreFileFromSession(session);
          if (canvasRef.current && canvasRef.current.loadFile) {
            canvasRef.current.loadFile(file);
          }
        } catch (error) {
          console.error('❌ Failed to restore file in canvas:', error);
        }
      }
    };
    
    checkSession();
  }, []);

  // Function to update AppState
  const updateAppState = (updates: Partial<AppState>) => {
    setAppState((prev: any) => ({ ...prev, ...updates }));
  };

  // Triggered when a file is selected and form is submitted successfully
  const handleModelUpload = (model: UploadedModel, file: File) => {
    console.log('🎯 Model uploaded in UploadModelDemo:', model);
    console.log('📁 File received:', file.name, file.size, file.type);
    setUploadedModel(model);

    // Update app state
    setAppState((prev: AppState) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, model],
      status: `Loading ${model.name}...`
    }));

    console.log('🎮 Attempting to load file into ThreeJSCanvas...');
    // Load file into ThreeJSCanvas
    if (canvasRef.current && canvasRef.current.loadFile) {
      console.log('✅ ThreeJSCanvas ref available, calling loadFile');
      canvasRef.current.loadFile(file);
      
      // Update status after a short delay to confirm loading
      setTimeout(() => {
        setAppState((prev: AppState) => ({
          ...prev,
          status: `${model.name} loaded successfully`
        }));
      }, 1000);
    } else {
      console.warn('❌ ThreeJSCanvas ref or loadFile method not available');
      console.log('canvasRef.current:', canvasRef.current);
      if (canvasRef.current) {
        console.log('Available methods:', Object.keys(canvasRef.current));
      }
      
      setAppState((prev: AppState) => ({
        ...prev,
        status: 'File uploaded but 3D viewer not ready'
      }));
    }
  };

  const handleBackToMain = () => {
    console.log('Back to main');
    // Ask user if they want to clear the upload session
    if (hasActiveUploadSession()) {
      const confirm = window.confirm(
        'You have an active upload session. Do you want to clear it before leaving?'
      );
      if (confirm) {
        clearUploadSession();
      }
    }
    window.history.back(); // Or use your router
  };

  const handleClearSession = () => {
    clearUploadSession();
    setHasActiveSession(false);
    setSessionInfo(null);
    setUploadedModel(null);
    setAppState(prev => ({
      ...prev,
      uploadedFiles: [],
      status: 'Ready for upload'
    }));
    
    // Clear the canvas
    if (canvasRef.current && canvasRef.current.clearScene) {
      canvasRef.current.clearScene();
    }
  };

  return (
    <div className="p-3" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
      {/* Session restoration notice */}
      {hasActiveSession && sessionInfo && (
        <Alert variant="success" className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="fas fa-cloud-download-alt me-2"></i>
              <strong>Upload session restored!</strong> 
              <span className="ms-2">
                File: {sessionInfo.fileName}
                {sessionInfo.progress > 0 && ` (${sessionInfo.progress}% complete)`}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleClearSession}
            >
              Clear Session
            </button>
          </div>
        </Alert>
      )}
      
      {/* Debug Storage Component */}
      <DebugStorage />
      
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