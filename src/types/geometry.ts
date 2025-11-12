export interface Geometry {
  id: string;
  name: string;
  description: string;
  vertices: number[];
  faces: number[];
  normals?: number[];
  bounds: number[][];
  centroid?: number[];
  fileType: string;
  createdAt: string;
  fileSize: number;
}

export interface FlowConditions {
  velocity: number;
  direction: [number, number, number];
  viscosity?: number;
  density?: number;
  resolution: number;
}

export interface VelocityField {
  points: number[][];
  vectors: number[][];
  magnitude: number[];
}

export interface SimulationResult {
  simulationId: string;
  geometryId: string;
  velocityField: VelocityField;
  pressureField: number[];
  streamlines: number[][][];
  domain: any;
  sdf?: number[];
  performance?: {
    dragCoefficient: number;
    liftCoefficient: number;
    efficiency: number;
  };
  timestamp: string;
}

export interface UploadResponse {
  geometry_id: string;
  geometry: {
    vertices: number[];
    faces: number[];
    normals?: number[];
    bounds: number[][];
    centroid: number[];
  };
}

export interface SimulationResponse {
  simulation_id: string;
  status: string;
  geometry: {
    vertices: number[];
    faces: number[];
    normals?: number[];
    bounds: number[][];
    centroid: number[];
  };
  flow_data: {
    velocity_field: VelocityField;
    pressure_field: number[];
    streamlines: number[][][];
    domain: any;
    sdf: number[];
  };
  message?: string;
}