// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  picture?: string; // For Google OAuth
  role?: 'user' | 'admin';
  totalSessions?: number;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

// Session Types
export interface Session {
  id: string;
  status: 'active' | 'completed';
  startedAt: string;
  endedAt?: string;
  totalDuration?: number;
  recordingUrl?: string;
  recordingSize?: number;
  conversationCount?: number;
  metadata?: {
    screenResolution?: string;
    deviceType?: string;
    browserName?: string;
  };
}

// Activity Types
export type ActivityEventType = 
  | 'session_start'
  | 'session_end'
  | 'voice_input_start'
  | 'voice_input_end'
  | 'camera_permission_granted'
  | 'camera_permission_denied'
  | 'microphone_permission_granted'
  | 'microphone_permission_denied'
  | 'tab_switch'
  | 'focus_loss'
  | 'focus_gain'
  | 'copy_paste'
  | 'keyboard_shortcut'
  | 'mouse_movement'
  | 'page_visibility_change'
  | 'recording_start'
  | 'recording_stop'
  | 'upload_start'
  | 'upload_complete'
  | 'error_occurred';

export interface ActivityEvent {
  id: string;
  sessionId: string;
  userId: string;
  eventType: ActivityEventType;
  eventData?: any;
  timestamp: string;
  videoTimestamp: number;
  clientTimestamp?: string;
}

// AI Conversation Types
export interface Conversation {
  id: string;
  sessionId: string;
  question: string;
  response: string;
  transcriptionConfidence?: number;
  speechDuration?: number;
  timestamp: string;
  metadata?: {
    conversationId: string;
    responseTime: number;
    tokenCount: {
      input: number;
      output: number;
    };
    processingTime: number;
  };
}

// Media Types
export interface PresignedPost {
  url: string;
  fields: Record<string, string>;
}

export interface MediaUpload {
  sessionId: string;
  fileUrl: string;
  fileSize: number;
  fileName: string;
}

// Theme Types
export type ThemeMode = 'light' | 'dark';
