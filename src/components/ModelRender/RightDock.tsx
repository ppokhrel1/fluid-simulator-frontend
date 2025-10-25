import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';

interface RightDockProps {
  chatMessages: ChatMessage[];
  selectedAiModel: string;
  isTyping: boolean;
  onSendMessage: (message: string, file?: File) => void;
  onModelChange: (model: string) => void;
  onFileUpload: (file: File) => void;
}

const RightDock: React.FC<RightDockProps> = ({
  chatMessages,
  selectedAiModel,
  isTyping,
  onSendMessage,
  onModelChange,
  onFileUpload
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim() && !isTyping) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      onSendMessage(`Analyze ${file.name}`, file);
    }
  };

  return (
    <div className="h-100 bg-dark border-0 rounded-0 d-flex flex-column">
      {/* Chat Header */}
      <div className="bg-dark border-secondary d-flex align-items-center py-3 px-3 border-bottom">
        <div className="d-flex align-items-center">
          <div className="bg-primary rounded-circle p-2 me-2">
            <i className="fas fa-robot text-white"></i>
          </div>
          <div>
            <h6 className="text-white mb-0">CURFD Assistant</h6>
            <small className="text-muted">AI CFD Analysis</small>
          </div>
        </div>
        <div className="ms-auto">
          <select 
            value={selectedAiModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="form-select form-select-sm bg-dark text-white border-secondary"
          >
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="claude-3.5">Claude 3.5</option>
            <option value="openfoam">OpenFOAM</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-grow-1 p-3 custom-scrollbar" style={{ overflowY: 'auto' }}>
        {chatMessages.map((msg, index) => (
          <div key={index} className={`mb-3 ${msg.type === 'user' ? 'text-end' : 'text-start'}`}>
            {msg.type === 'ai' && (
              <div className="d-flex align-items-center mb-1">
                <div className="bg-primary rounded-circle p-1 me-2">
                  <i className="fas fa-robot text-white" style={{ fontSize: '12px' }}></i>
                </div>
                <small className="text-primary">CURFD AI</small>
              </div>
            )}
            
            <div 
              className={`d-inline-block p-3 rounded ${
                msg.type === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary bg-opacity-25 text-white border border-secondary'
              }`}
              style={{ maxWidth: '90%' }}
            >
              {msg.content}
            </div>
            
            <small className="text-muted d-block mt-1">
              {msg.time}
            </small>
          </div>
        ))}
        
        {isTyping && (
          <div className="text-start mb-3">
            <div className="d-flex align-items-center mb-1">
              <div className="bg-primary rounded-circle p-1 me-2">
                <i className="fas fa-robot text-white" style={{ fontSize: '12px' }}></i>
              </div>
              <small className="text-primary">CURFD AI</small>
            </div>
            <div className="bg-secondary bg-opacity-25 text-white p-3 rounded d-inline-block border border-secondary">
              <div className="d-flex align-items-center gap-2 text-muted">
                <span>Typing</span>
                <div className="d-flex gap-1">
                  <div className="typing-dot bg-primary rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                  <div className="typing-dot bg-primary rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                  <div className="typing-dot bg-primary rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="bg-dark border-secondary p-3 border-top">
        <div className="input-group">
          <input
            type="file"
            className="d-none"
            id="chatFileInput"
            accept=".stl,.obj,.step,.stp,.iges,.glb"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            className="btn btn-outline-secondary border-secondary"
            onClick={() => document.getElementById('chatFileInput')?.click()}
            title="Upload file"
          >
            <i className="fas fa-paperclip"></i>
          </button>
          
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightDock;