// Enhanced Backend Type Definitions - Generated from Backend AI
// These types match the actual backend implementation

import type { UploadedModel } from './auth';

// Commerce System Types
export interface DesignAsset {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  status: 'active' | 'draft' | 'sold' | 'paused';
  sales: number;
  revenue: number;
  views: number;
  likes: number;
  seller_id: number;
  file_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: number;
  design_id: string;
  name: string;
  price: number;
  original_price?: number;
  size: string;
  color: string;
  icon: string;
  quantity: number;
  added_at: string;
}

export interface SalesTransaction {
  id: string;
  buyer_id: number;
  seller_id: number;
  design_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  payment_method: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface Payout {
  id: string;
  user_id: number;
  amount: number;
  method: 'paypal' | 'stripe' | 'bank_transfer';
  net_amount: number;
  payout_account: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  processed_at?: string;
}

// AI Chatbot System Types
export interface ChatSession {
  id: string;
  user_id: number;
  model_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'assistant';
  content: string;
  file_name?: string;
  file_data?: string;
  timestamp: string;
}

export interface ChatResponse {
  session_id: string;
  user_message: ChatMessage;
  ai_response: ChatMessage;
  message: string;
}

// 3D Labeling System Types
export interface AssetLabel {
  id: string;
  model_id: number;
  position_x?: number;
  position_y?: number;
  position_z?: number;
  text: string;
  category?: 'Material' | 'Part' | 'Function' | 'Texture' | 'Dimension' | 'Other';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface LabelPosition {
  x: number;
  y: number;
  z: number;
}

export interface AILabelSuggestion {
  label_text: string;
  category: string;
  confidence: number;
  suggested_position: LabelPosition;
  description: string;
}

// Enhanced User Types (Backend Compatible)
export interface EnhancedUser {
  id: number;
  email: string;
  full_name: string;  // Backend maps to 'name' field
  is_superuser: boolean;
  is_active: boolean;
  profile_image_url?: string;
  tier_id?: number | null;
}

// Registration Data for Enhanced Backend
export interface EnhancedRegistrationData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
}

export interface APIResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Commerce Filter Types
export interface DesignFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  sort_by?: 'price' | 'popularity' | 'recent' | 'sales';
  limit?: number;
  offset?: number;
}

// Cart Management Types
export interface AddToCartRequest {
  design_id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  icon: string;
  quantity?: number;
}

export interface UpdateCartRequest {
  quantity?: number;
  size?: string;
  color?: string;
}

// Chat Management Types
export interface CreateChatSessionRequest {
  model_id?: number;
}

export interface SendMessageRequest {
  message: string;
  message_type?: 'text' | 'file';
  file_name?: string;
  file_data?: string;
}

// Label Management Types
export interface CreateLabelRequest {
  position_x?: number;
  position_y?: number;
  position_z?: number;
  text: string;
  category?: AssetLabel['category'];
}

export interface UpdateLabelRequest {
  position_x?: number;
  position_y?: number;
  position_z?: number;
  text?: string;
  category?: AssetLabel['category'];
}

// Enhanced Application State
export interface EnhancedAppState {
  // Existing state
  gridVisible: boolean;
  autoRotateEnabled: boolean;
  leftDockExpanded: boolean;
  selectedAiModel: string;
  status: string;
  isTyping: boolean;
  view: string;
  
  // Enhanced Commerce State
  cart: CartItem[];
  marketplace: DesignAsset[];
  userDesigns: DesignAsset[];
  purchaseHistory: SalesTransaction[];
  sellerSales: SalesTransaction[];
  payouts: Payout[];
  
  // Enhanced Chat State
  chatSessions: ChatSession[];
  activeChatSession?: ChatSession;
  chatMessages: ChatMessage[];
  
  // Enhanced Labeling State
  modelLabels: Record<number, AssetLabel[]>;
  labelCategories: AssetLabel['category'][];
  aiSuggestions: AILabelSuggestion[];
  
  // Enhanced User State
  user?: EnhancedUser;
  isAuthenticated: boolean;
  
  // Enhanced Model State
  uploadedFiles: UploadedModel[];
  selectedModel?: UploadedModel;
}

// Error Handling Types
export interface APIError {
  detail: string;
  status_code: number;
  error_type?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Commerce Event Types
export interface DesignLikedEvent {
  design_id: string;
  user_id: number;
  timestamp: string;
}

export interface CheckoutCompletedEvent {
  transaction_id: string;
  items: CartItem[];
  total_amount: number;
  timestamp: string;
}

// Chat Event Types
export interface MessageSentEvent {
  session_id: string;
  message_id: string;
  user_id: number;
  timestamp: string;
}

// Label Event Types
export interface LabelCreatedEvent {
  label_id: string;
  model_id: number;
  user_id: number;
  timestamp: string;
}

export interface LabelPositionUpdatedEvent {
  label_id: string;
  old_position: LabelPosition;
  new_position: LabelPosition;
  timestamp: string;
}