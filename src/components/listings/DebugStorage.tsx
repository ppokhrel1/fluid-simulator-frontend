import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

const DebugStorage: React.FC = () => {
  const [storageData, setStorageData] = useState<string>('');

  useEffect(() => {
    const checkStorage = () => {
      try {
        const keys = Object.keys(localStorage);
        const data = keys.map(key => ({
          key,
          value: localStorage.getItem(key),
          size: localStorage.getItem(key)?.length || 0
        }));
        
        setStorageData(JSON.stringify(data, null, 2));
        console.log('📊 localStorage contents:', data);
      } catch (error) {
        console.error('❌ Error reading localStorage:', error);
        setStorageData('Error reading localStorage: ' + error);
      }
    };

    checkStorage();
    
    // Check every 5 seconds
    const interval = setInterval(checkStorage, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-3">
      <h4>🔍 localStorage Debug</h4>
      <Alert variant="info">
        <h6>localStorage Contents:</h6>
        <pre style={{ fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
          {storageData}
        </pre>
      </Alert>
    </div>
  );
};

export default DebugStorage;