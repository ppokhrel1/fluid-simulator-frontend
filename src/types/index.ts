export interface FileData {
  name: string;
  color: string;
  icon: string;
  size?: string;
  file?: File;
}

export interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  time: string;
  file?: FileData;
}

export interface AIModel {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface UploadedModel {
  id: number;
  name: string;
  file_name: string;  // snake_case to match backend
  file_size: string;  // snake_case to match backend
  file_type: string;  // snake_case to match backend
  description?: string;
  web_link?: string;
  tags: string[];
  thumbnail?: string;
  project_name?: string;
  designer?: string;
  revision?: string;
  units: string;
  scale_factor: number;
  fluid_density: number;
  fluid_viscosity: number;
  velocity_inlet?: number;
  temperature_inlet?: number;
  pressure_outlet?: number;
  analysis_status: string;  // snake_case to match backend
  last_opened?: string;     // snake_case to match backend
  created_at: string;       // snake_case to match backend
  updated_at: string;
  created_by_user_id: number;
}

export interface UploadedModelCamelCase {
  id: number;
  name: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  description?: string;
  webLink?: string;
  tags: string[];
  thumbnail?: string;
  projectName?: string;
  designer?: string;
  revision?: string;
  units: string;
  scaleFactor: number;
  fluidDensity: number;
  fluidViscosity: number;
  velocityInlet?: number;
  temperatureInlet?: number;
  pressureOutlet?: number;
  analysisStatus: string;
  lastOpened?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
}

export interface AppState {
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  chatMessages: ChatMessage[];
  leftDockExpanded: boolean;
  selectedAiModel: string;
  status: string;
  uploadedFiles: (FileData | UploadedModel)[]; // <- allow both
  isTyping: boolean;
  view: 'main' | 'models-list' | 'store';
}


export interface ThreeJSActions {
  loadFile: (file: File) => void;
  processMessage: (data: { message: string; file?: File }) => void;
  resetCamera: () => void;
  toggleGrid: () => void;
  toggleAutoRotate: () => void;
  takeScreenshot: () => void;
  isolatePart?: (id: string) => void;
  clearIsolation?: () => void;
}