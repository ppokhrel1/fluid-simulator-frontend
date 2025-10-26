// types/index.ts
export interface UploadedModel {
  id: number;
  name: string;
  file_name: string;
  file_size: string;
  file_type: string;
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
  analysis_status: string;
  last_opened?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id: number;
}

export interface Component {
  id: number;
  model_id: number;
  name: string;
  component_type: string;
  material?: string;
  color?: string;
  dimensions?: string;
  properties?: Record<string, any>;
  created_at: string;
}

export interface AnalysisResult {
  id: number;
  component_id: number;
  analysis_type: string;
  result_data: Record<string, any>;
  status: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

export interface AppState {
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  chatMessages: any[];
  leftDockExpanded: boolean;
  selectedAiModel: string;
  status: string;
  uploadedFiles: UploadedModel[];
  isTyping: boolean;
  view: string;
  user?: User;
}