import React from 'react';
import ModelsListPage from './ModelsListing';

const ModelsListDemo: React.FC = () => {
  const handleModelSelect = (model: any) => {
    console.log('Model selected:', model);
    alert(`Selected: ${model.name}`);
  };

  const handleBackToMain = () => {
    console.log('Back to main');
    alert('Going back to main page');
  };

  return (
    <ModelsListPage 
      onModelSelect={handleModelSelect}
      onBackToMain={handleBackToMain}
    />
  );
};

export default ModelsListDemo;