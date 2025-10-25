import React, { useState, useRef } from 'react';
import ThreeJSCanvas from '../ModelRender/ThreeJSCanvas';
import Header from '../ModelRender/Header';
import LeftDock from '../ModelRender/LeftDock';
import Chatbot from '../ai_system/chatbot';
import BottomControlDock from '../ModelRender/BottomControlDock';
import PressureLegend from '../ModelRender/PressureLegend';
import type { AppState, ThreeJSActions, FileData, ChatMessage } from '../../types';
import { sendMessageToAI } from '../ai_system/aiAdapter';
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

  const handleSendMessage = async (message: string, file?: File) => {
    const newMessage: ChatMessage = {
      type: 'user',
      content: message || (file ? `Uploaded ${file.name}` : ''),
      time: new Date().toLocaleTimeString()
    };

    // optimistically add user message and show typing
    updateAppState({
      chatMessages: [...appState.chatMessages, newMessage],
      isTyping: true
    });

    // forward to ThreeJS processor if a file was uploaded or the message relates to the scene
    if (file) {
      handleThreeAction('loadFile', file);
    }
    handleThreeAction('processMessage', { message, file });

    // call AI adapter (pluggable). If no API configured the adapter returns a helpful placeholder reply.
    let aiReplyText = '';
    try {
      aiReplyText = await sendMessageToAI(message, file, appState.selectedAiModel);
    } catch (err: any) {
      aiReplyText = `[AI error] ${err?.message || String(err)}`;
    }

    const aiResponse: ChatMessage = {
      type: 'ai',
      content: aiReplyText,
      time: new Date().toLocaleTimeString()
    };

    updateAppState({
      chatMessages: [...appState.chatMessages, newMessage, aiResponse],
      isTyping: false
    });
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
    <div className="app vh-100 vw-100 p-0 m-0 bg-dark overflow-hidden">
      {/* Header with CURFD branding */}
      <div className="fixed-top d-flex align-items-center px-4 py-2" style={{ 
        zIndex: 1050, 
        background: 'var(--chat-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--chat-border)'
      }}>
        <div className="d-flex align-items-center gap-3">
          <img src="/curfdlogo.png" alt="CURFD" style={{ height: '40px', filter: 'brightness(1.2) contrast(1.1)' }} />
          <div className="d-flex flex-column">
            <strong className="text-white" style={{ fontSize: '1.2rem' }}>CURFD</strong>
            <small className="text-white-50">V3 - Advanced AI CFD Engine</small>
          </div>
        </div>
        <div className="ms-auto">
          <span className="text-white-50">{appState.status}</span>
        </div>
      </div>

      {/* Main Content - Fullscreen 3D */}
      <div className="position-fixed inset-0 w-100 h-100" style={{ top: '60px' }}>
        <ThreeJSCanvas 
          ref={threeRef}
          onStateUpdate={updateAppState}
          appState={appState}
        />
      </div>

      {/* Floating Chatbot Panel */}
      <div className="position-fixed" style={{ top: '76px', right: '16px', width: '400px', zIndex: 1040 }}>
        <Chatbot 
          onSendMessage={handleSendMessage}
          selectedModel={appState.selectedAiModel}
          onModelChange={(model) => updateAppState({ selectedAiModel: model })}
        />
      </div>

      {/* Floating Action Buttons */}
      <div className="fab-container">
        <button
          className={`fab-button ${appState.gridVisible ? 'active' : ''}`}
          onClick={handleToggleGrid}
        >
          Grid
        </button>

        <button
          className={`fab-button ${appState.autoRotateEnabled ? 'active' : ''}`}
          onClick={handleAutoRotate}
        >
          Auto Rotate
        </button>

        <button
          className="fab-button"
          onClick={handleResetView}
        >
          Reset View
        </button>

        <button
          className="fab-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </button>

          <button
            className="fab-button"
            onClick={() => handleThreeAction('takeScreenshot')}
          >
            Screenshot
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            accept=".stl,.obj,.step,.stp,.iges,.glb"
            onChange={handleFileInputChange}
          />
        </div>

        {/* Pressure Distribution Legend */}
        <div className="position-fixed start-0 ms-4 rounded chat-container" 
             style={{ 
               zIndex: 1040, 
               top: '50%', 
               transform: 'translateY(-50%)',
               padding: '1rem',
               background: 'rgba(0, 0, 0, 0.7)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255, 255, 255, 0.1)'
             }}>
            <div className="d-flex flex-column align-items-center gap-2">
              <div className="text-white small mb-1 fw-bold">
                High
              </div>

              <div
                style={{
                  width: '28px',
                  height: '220px',
                  background: 'linear-gradient(to bottom, #F44336, #FFC107, #4CAF50)',
                  borderRadius: '14px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4) inset, 0 4px 12px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.04)'
                }}
              />

              <div className="text-white small mt-1 fw-bold">
                Low
              </div>

              {/* Horizontal caption for easier reading */}
              <div className="text-white-50 small text-center mt-2" style={{ width: '140px' }}>
                Pressure Distribution
              </div>
            </div>
        </div>
      </div>
    );
  };export default MainPageApp;