import React, { useState, useRef } from 'react';
import ThreeJSCanvas from '../ModelRender/ThreeJSCanvas';
import Header from '../ModelRender/Header';
import LeftDock from '../ModelRender/LeftDock';
import RightDock from '../ModelRender/RightDock';
import BottomControlDock from '../ModelRender/BottomControlDock';
import PressureLegend from '../ModelRender/PressureLegend';
import type { AppState, ThreeJSActions, FileData, ChatMessage } from '../../types';
import 'bootstrap/dist/css/bootstrap.min.css';

export const MainPageApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    leftDockExpanded: false,
    isTyping: false,
    chatMessages: [
      {
        type: 'ai',
        content: 'Hello! I\'m CURFD AI. Upload a 3D model to begin CFD analysis.',
        time: new Date().toLocaleTimeString()
      }
    ],
    selectedAiModel: 'gpt-4-turbo',
    uploadedFiles: [],
    status: 'Ready for analysis',
    gridVisible: true,
    autoRotateEnabled: false,
    view: 'main'
  });

  const threeRef = useRef<ThreeJSActions>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const handleThreeAction = (action: keyof ThreeJSActions, data?: any) => {
    console.log(`Three action: ${action}`, data);
    if (threeRef.current && threeRef.current[action]) {
      (threeRef.current[action] as Function)(data);
    } else {
      console.warn(`Three action ${action} not available`);
    }
  };

  const handleSendMessage = (message: string, file?: File) => {
    const newMessage: ChatMessage = {
      type: 'user',
      content: message,
      time: new Date().toLocaleTimeString()
    };

    updateAppState({
      chatMessages: [...appState.chatMessages, newMessage],
      isTyping: true
    });

    handleThreeAction('processMessage', { message, file });

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        type: 'ai',
        content: `I've processed your request: "${message}". The 3D model shows optimal pressure distribution with peak values at the frontal surfaces.`,
        time: new Date().toLocaleTimeString()
      };
      updateAppState({ 
        chatMessages: [...appState.chatMessages, newMessage, aiResponse],
        isTyping: false 
      });
    }, 2000);
  };

  const handleFileSelect = (file: FileData) => {
    updateAppState({ status: `Loading ${file.name}...` });
    setTimeout(() => {
      updateAppState({ status: `${file.name} loaded - Analysis ready` });
    }, 1000);
  };

  const handleUploadModel = () => {
    console.log('Upload button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed', e.target.files);
    if (e.target.files?.[0]) {
      handleThreeAction('loadFile', e.target.files[0]);
      // Reset the input to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleResetView = () => {
    console.log('Reset view called');
    handleThreeAction('resetCamera');
  };

  const handleToggleGrid = () => {
    const newGridVisible = !appState.gridVisible;
    updateAppState({ gridVisible: newGridVisible });
    handleThreeAction('toggleGrid');
  };

  const handleAutoRotate = () => {
    const newAutoRotate = !appState.autoRotateEnabled;
    updateAppState({ autoRotateEnabled: newAutoRotate });
    handleThreeAction('toggleAutoRotate');
  };

  return (
    <div className="app container-fluid vh-100 vw-100 p-0 m-0 bg-light">
      {/* Header */}
      <div className="fixed-top bg-dark border-bottom border-secondary" style={{ zIndex: 1050, height: '60px' }}>
        <Header status={appState.status} />
      </div>

      {/* Main Content */}
      <div className="d-flex h-100 w-100" style={{ paddingTop: '60px' }}>
        {/* Left Dock */}
        <div className="h-100" style={{ width: '16.666%' }}>
          <LeftDock 
            expanded={appState.leftDockExpanded}
            onToggle={(expanded) => updateAppState({ leftDockExpanded: expanded })}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Three.js Center Area */}
        <div className="h-100" style={{ width: '66.666%' }}>
          <div className="threejs-container h-100 w-100 bg-secondary bg-opacity-10">
            <ThreeJSCanvas 
              ref={threeRef}
              onStateUpdate={updateAppState}
              appState={appState}
            />
          </div>
        </div>

        {/* Right Dock - Standard Chatbot Interface */}
        <div className="h-100 border-start border-secondary" style={{ width: '16.666%' }}>
          <RightDock
            chatMessages={appState.chatMessages}
            selectedAiModel={appState.selectedAiModel}
            isTyping={appState.isTyping}
            onSendMessage={handleSendMessage}
            onModelChange={(model) => updateAppState({ selectedAiModel: model })}
            onFileUpload={(file) => handleThreeAction('loadFile', file)}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed-bottom bg-dark" style={{ zIndex: 1040 }}>
        <div className="d-flex justify-content-center py-2">
          <BottomControlDock
            onUploadModel={handleUploadModel}
            onResetView={handleResetView}
            onToggleGrid={handleToggleGrid}
            onAutoRotate={handleAutoRotate}
            onScreenshot={() => handleThreeAction('takeScreenshot')}
            gridVisible={appState.gridVisible}
            autoRotateEnabled={appState.autoRotateEnabled}
          />
        </div>
      </div>

      {/* Hidden file input with GLB support */}
      <input 
        ref={fileInputRef}
        type="file" 
        id="fileInput" 
        accept=".stl,.obj,.step,.stp,.iges,.glb" 
        className="d-none" 
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default MainPageApp;