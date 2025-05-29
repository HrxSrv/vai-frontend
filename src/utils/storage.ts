// utils/storage.ts
import { AuthState } from '../types';

const AUTH_STORAGE_KEY = 'vai_auth';

export const storeAuth = (authState: AuthState): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    user: authState.user,
    token: authState.token,
  }));
};

export const getStoredAuth = (): Partial<AuthState> | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
     
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored auth:', error);
    return null;
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getSessionVideoKey = (sessionId: string): string => {
  return `vai_session_recording_${sessionId}`;
};

export const storeSessionVideo = (sessionId: string, blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  localStorage.setItem(getSessionVideoKey(sessionId), url);
};

export const getSessionVideo = (sessionId: string): string | null => {
  return localStorage.getItem(getSessionVideoKey(sessionId));
};
