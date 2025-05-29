import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session, ActivityEventType } from '../types';
import * as sessionService from '../services/sessionService';

interface SessionContextType {
  currentSession: Session | null;
  isRecording: boolean;
  startSession: () => Promise<Session>;
  endSession: (recordingUrl?: string, recordingSize?: number) => Promise<void>;
  logActivity: (eventType: ActivityEventType, eventData?:  Record<string, unknown>, videoTimestamp?: number) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  currentSession: null,
  isRecording: false,
  startSession: async () => ({ id: '', status: 'active', startedAt: '' }),
  endSession: async () => {},
  logActivity: async () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const startSession = async (): Promise<Session> => {
    // Prevent multiple concurrent session starts
    if (isStartingSession) {
      console.warn('Session start already in progress, ignoring duplicate request');
      throw new Error('Session start already in progress');
    }

    if (currentSession && currentSession.status === 'active') {
      console.warn('Active session already exists:', currentSession.id);
      return currentSession;
    }

    try {
      setIsStartingSession(true);
      console.log('Starting new session...');
      
      const metadata = {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browserName: getBrowserName(),
      };

      // Use the session service instead of direct API call
      const newSession = await sessionService.startSession(metadata);
      console.log('New session created:', newSession.id);
      
      setCurrentSession(newSession);
      setRecordStartTime(Date.now());
      
      return newSession;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    } finally {
      setIsStartingSession(false);
    }
  };

  const endSession = async (recordingUrl?: string, recordingSize?: number) => {
    if (!currentSession) {
      console.warn('No active session to end');
      return;
    }

    try {
      console.log('Ending session:', currentSession.id);
      
      const totalDuration = recordStartTime ? Math.floor((Date.now() - recordStartTime) / 1000) : undefined;
      
      // Log session end activity first
      await logActivity('session_end', {
        recordingUrl,
        recordingSize,
        totalDuration,
      });

      // Use the session service to end the session
      await sessionService.endSession(
        currentSession.id,
        recordingUrl,
        recordingSize,
        totalDuration
      );

      console.log('Session ended successfully:', currentSession.id);
      
      setCurrentSession(null);
      setIsRecording(false);
      setRecordStartTime(null);
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  };

  const logActivity = async (
    eventType: ActivityEventType,
    eventData:  Record<string, unknown> = {},
    videoTimestamp?: number
  ) => {
    if (!currentSession) {
      console.warn('No active session for activity logging:', eventType);
      return;
    }

    try {
      const timestamp = recordStartTime && !videoTimestamp 
        ? Math.floor((Date.now() - recordStartTime) / 1000)
        : videoTimestamp || 0;

      // Use the session service for logging activity
      await sessionService.logActivity(
        currentSession.id,
        eventType,
        eventData,
        timestamp
      );
    } catch (error) {
      console.error(`Failed to log activity (${eventType}):`, error);
    }
  };

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    else if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    else if (userAgent.indexOf("Safari") > -1) return "Safari";
    else if (userAgent.indexOf("Edge") > -1) return "Edge";
    else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
    return "Unknown";
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        isRecording,
        startSession,
        endSession,
        logActivity,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
