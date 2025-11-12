// frontend/src/components/3dShapes/AIShapeGenerator.tsx
import React, { useState } from 'react';
import { useObjectStudio } from '../../hooks/useObjectStudio'; // Fixed import path

interface AIShapeGeneratorProps {
  selectedObjectId: string | null;
}

const AIShapeGenerator: React.FC<AIShapeGeneratorProps> = ({ selectedObjectId }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateAIShape } = useObjectStudio(); // Fixed function name

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await generateAIShape(prompt, selectedObjectId || undefined);
      setPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Generation failed. Please try a different prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickPrompts = [
    "add a rectangular block to the side",
    "create a cylindrical extrusion",
    "add decorative patterns",
    "make it more organic",
    "add mechanical details"
  ];

  return (
    <div className="ai-generator-panel">
      <h3>AI Shape Assistant</h3>
      
      <div className="prompt-input">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what to add or modify... (e.g., 'add a rectangular block to the right side')"
          rows={3}
        />
      </div>

      <div className="quick-prompts">
        <h4>Quick Suggestions:</h4>
        {quickPrompts.map((quickPrompt, index) => (
          <button
            key={index}
            className="quick-prompt-btn"
            onClick={() => setPrompt(quickPrompt)}
          >
            {quickPrompt}
          </button>
        ))}
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="generate-btn"
      >
        {isGenerating ? 'Generating...' : 'Generate & Add'}
      </button>

      <div className="ai-tips">
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Be specific about location ("on top", "to the left side")</li>
          <li>Mention size ("small block", "large cylinder")</li>
          <li>Describe shape type ("organic", "mechanical", "decorative")</li>
        </ul>
      </div>
    </div>
  );
};

export default AIShapeGenerator;