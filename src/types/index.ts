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
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  type: string;
  analysisStatus: 'pending' | 'in-progress' | 'completed' | 'error';
  lastOpened: string | null;
  thumbnail?: string;
  tags: string[];
}

export interface AppState {
  leftDockExpanded: boolean;
  isTyping: boolean;
  chatMessages: ChatMessage[];
  selectedAiModel: string;
  uploadedFiles: FileData[];
  status: string;
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  currentModel?: UploadedModel;
  view: 'main' | 'models-list';
}

export interface ThreeJSActions {
  loadFile: (file: File) => void;
  processMessage: (data: { message: string; file?: File }) => void;
  resetCamera: () => void;
  toggleGrid: () => void;
  toggleAutoRotate: () => void;
  takeScreenshot: () => void;
}

