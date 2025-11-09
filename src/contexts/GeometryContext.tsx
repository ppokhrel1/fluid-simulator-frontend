import React, { createContext, useState, useContext, useCallback } from 'react';
import { geometryAPI } from '~/services/geometry';
import { simulationAPI } from '~/services/simulation';

// Types
export interface Geometry {
  id: string;
  name: string;
  description: string;
  vertices: number[];
  faces: number[];
  normals?: number[];
  bounds: number[][];
  centroid: number[];
  fileType: string;
  createdAt: string;
  fileSize: number;
}

export interface SimulationResult {
  simulationId: string;
  geometryId: string;
  velocityField: any;
  pressureField: any;
  streamlines: any;
  domain: any;
  sdf: any;
  performance?: {
    dragCoefficient: number;
    liftCoefficient: number;
    efficiency: number;
  };
  timestamp: string;
}

export interface FlowConditions {
  velocity: number;
  direction: [number, number, number];
  resolution: number;
}

interface GeometryContextType {
  // State
  currentGeometry: Geometry | null;
  simulationResult: SimulationResult | null;
  geometries: Geometry[];
  loading: boolean;
  simulating: boolean;
  error: string | null;
  progress: number;
  
  // Geometry Actions
  uploadGeometry: (file: File, name: string, description?: string) => Promise<void>;
  runFlowSimulation: (file: File, flowConditions: FlowConditions) => Promise<void>;
  runQuickDemo: (geometryType: string, flowConditions: FlowConditions) => Promise<void>;
  loadGeometry: (geometryId: string) => Promise<void>;
  clearGeometry: () => void;
  deleteGeometry: (geometryId: string) => Promise<void>;
  
  // Simulation Actions
  clearSimulation: () => void;
  
  // Utility
  clearError: () => void;
  setProgress: (progress: number) => void;
}

const GeometryContext = createContext<GeometryContextType | undefined>(undefined);

export const GeometryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGeometry, setCurrentGeometry] = useState<Geometry | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [geometries, setGeometries] = useState<Geometry[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Error handling utility
  const handleError = useCallback((err: any, defaultMessage: string) => {
    console.error(`❌ ${defaultMessage}:`, err);
    const message = err.response?.data?.detail || err.message || defaultMessage;
    setError(message);
    throw err;
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Upload geometry without simulation
  const uploadGeometry = useCallback(async (file: File, name: string, description: string = '') => {
    setLoading(true);
    clearError();
    setProgress(0);
    
    try {
      console.log('📁 Uploading geometry file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);

    //   const response = await fetch('/api/v1/simulations/upload-geometry', {
    //     method: 'POST',
    //     body: formData,
    //   });
      const response = await geometryAPI.uploadGeometry(file, name, description)

    //   if (!response.ok) {
    //     const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    //     throw new Error(error.detail || `HTTP ${response.status}`);
    //   }

      const data =  response
      
      const newGeometry: Geometry = {
        id: data.geometry_id,
        name,
        description,
        vertices: data.geometry.vertices,
        faces: data.geometry.faces,
        normals: data.geometry.normals,
        bounds: data.geometry.bounds,
        centroid: data.geometry.centroid,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'STL',
        createdAt: new Date().toISOString(),
        fileSize: file.size
      };
      
      setCurrentGeometry(newGeometry);
      setGeometries(prev => [newGeometry, ...prev]);
      setSimulationResult(null);
      setProgress(100);
      
      console.log('✅ Geometry uploaded successfully:', newGeometry);
    } catch (err) {
      handleError(err, 'Geometry upload failed');
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Main flow simulation
  const runFlowSimulation = useCallback(async (file: File, flowConditions: FlowConditions) => {
    setSimulating(true);
    setProgress(0);
    clearError();
    
    try {
      console.log('🌊 Running flow simulation:', flowConditions);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('velocity', flowConditions.velocity.toString());
      formData.append('direction_x', flowConditions.direction[0].toString());
      formData.append('direction_y', flowConditions.direction[1].toString());
      formData.append('direction_z', flowConditions.direction[2].toString());
      formData.append('resolution', flowConditions.resolution.toString());

      const response = await fetch('/api/v1/simulations/simulate-flow', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Simulation failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setProgress(100);
      
      // Create geometry from response
      const simulationGeometry: Geometry = {
        id: data.simulation_id,
        name: `Simulation: ${file.name}`,
        description: `Flow simulation with v=${flowConditions.velocity}m/s`,
        vertices: data.geometry.vertices,
        faces: data.geometry.faces,
        normals: data.geometry.normals,
        bounds: data.geometry.bounds,
        centroid: data.geometry.centroid,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'STL',
        createdAt: new Date().toISOString(),
        fileSize: file.size
      };
      
      // Create simulation result
      const result: SimulationResult = {
        simulationId: data.simulation_id,
        geometryId: data.simulation_id,
        velocityField: data.flow_data.velocity_field,
        pressureField: data.flow_data.pressure_field,
        streamlines: data.flow_data.streamlines,
        domain: data.flow_data.domain,
        sdf: data.flow_data.sdf,
        performance: {
          dragCoefficient: 0.15,
          liftCoefficient: 0.6,
          efficiency: 0.75
        },
        timestamp: new Date().toISOString()
      };
      
      setCurrentGeometry(simulationGeometry);
      setSimulationResult(result);
      setGeometries(prev => [simulationGeometry, ...prev]);
      
      console.log('✅ Flow simulation completed successfully');
    } catch (err) {
      handleError(err, 'Flow simulation failed');
    } finally {
      setSimulating(false);
    }
  }, [handleError, clearError]);

  // Quick demo simulation
  const runQuickDemo = useCallback(async (geometryType: string, flowConditions: FlowConditions) => {
    setSimulating(true);
    setProgress(0);
    clearError();
    
    try {
      console.log('⚡ Running quick demo:', { geometryType, flowConditions });
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const response = await simulationAPI.quickDemo(
        geometryType,
        flowConditions.velocity,
        flowConditions.resolution,
      )

    //   const response = await fetch('/api/v1/simulations/quick-demo', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: new URLSearchParams({
    //       geometry_type: geometryType,
    //       velocity: flowConditions.velocity.toString(),
    //       resolution: flowConditions.resolution.toString(),
    //     }),
    //   });

      clearInterval(progressInterval);


      const data = response;
      setProgress(100);
      
      // Create geometry from quick demo response
      const demoGeometry: Geometry = {
        id: data.simulation_id,
        name: `Demo: ${geometryType}`,
        description: `Quick demo ${geometryType} with v=${flowConditions.velocity}m/s`,
        vertices: data.geometry.vertices,
        faces: data.geometry.faces,
        normals: data.geometry.normals,
        bounds: data.geometry.bounds,
        centroid: data.geometry.centroid,
        fileType: 'DEMO',
        createdAt: new Date().toISOString(),
        fileSize: 0
      };
      
      // Create simulation result
      const result: SimulationResult = {
        simulationId: data.simulation_id,
        geometryId: data.simulation_id,
        velocityField: data.flow_data.velocity_field,
        pressureField: data.flow_data.pressure_field,
        streamlines: data.flow_data.streamlines,
        domain: data.flow_data.domain,
        sdf: data.flow_data.sdf,
        performance: {
          dragCoefficient: 0.15,
          liftCoefficient: 0.6,
          efficiency: 0.75
        },
        timestamp: new Date().toISOString()
      };
      
      setCurrentGeometry(demoGeometry);
      setSimulationResult(result);
      setGeometries(prev => [demoGeometry, ...prev]);
      
      console.log('✅ Quick demo completed successfully');
    } catch (err) {
      handleError(err, 'Quick demo failed');
    } finally {
      setSimulating(false);
    }
  }, [handleError, clearError]);

  const loadGeometry = useCallback(async (geometryId: string) => {
    setLoading(true);
    clearError();
    
    try {
      console.log('📥 Loading geometry:', geometryId);
      // For now, we'll find in local state since backend doesn't have GET geometry endpoint
      const geometry = geometries.find(geo => geo.id === geometryId);
      if (!geometry) {
        throw new Error('Geometry not found');
      }
      
      setCurrentGeometry(geometry);
      setSimulationResult(null);
      console.log('✅ Geometry loaded successfully:', geometry);
    } catch (err) {
      handleError(err, 'Failed to load geometry');
    } finally {
      setLoading(false);
    }
  }, [geometries, handleError, clearError]);

  const clearGeometry = useCallback(() => {
    setCurrentGeometry(null);
    setSimulationResult(null);
    console.log('🗑️ Geometry cleared');
  }, []);

  const deleteGeometry = useCallback(async (geometryId: string) => {
    clearError();
    
    try {
      console.log('🗑️ Deleting geometry:', geometryId);
      // For now, just remove from local state since backend doesn't have DELETE endpoint
      setGeometries(prev => prev.filter(geo => geo.id !== geometryId));
      
      if (currentGeometry?.id === geometryId) {
        setCurrentGeometry(null);
        setSimulationResult(null);
      }
      
      console.log('✅ Geometry deleted successfully');
    } catch (err) {
      handleError(err, 'Failed to delete geometry');
    }
  }, [currentGeometry, handleError, clearError]);

  const clearSimulation = useCallback(() => {
    setSimulationResult(null);
    console.log('🗑️ Simulation results cleared');
  }, []);

  const value: GeometryContextType = {
    // State
    currentGeometry,
    simulationResult,
    geometries,
    loading,
    simulating,
    error,
    progress,
    
    // Geometry Actions
    uploadGeometry,
    runFlowSimulation,
    runQuickDemo,
    loadGeometry,
    clearGeometry,
    deleteGeometry,
    
    // Simulation Actions
    clearSimulation,
    
    // Utility
    clearError,
    setProgress
  };

  return (
    <GeometryContext.Provider value={value}>
      {children}
    </GeometryContext.Provider>
  );
};

export const useGeometry = () => {
  const context = useContext(GeometryContext);
  if (context === undefined) {
    throw new Error('useGeometry must be used within a GeometryProvider');
  }
  return context;
};