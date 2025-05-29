import api from './api';
import {ActivityEventType } from '../types';

export const getSessions = async (page = 1, limit = 10, status?: string) => {
  const params = { page, limit, ...(status && { status }) };
  const response = await api.get('/sessions', { params });
  return response.data;
};

export const getSession = async (sessionId: string) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data.session;
};

export const getSessionActivity = async (sessionId: string) => {
  const response = await api.get(`/sessions/${sessionId}/activity`);
  return response.data.activities;
};

export const deleteSession = async (sessionId: string) => {
  const response = await api.delete(`/sessions/${sessionId}`);
  return response.data;
};

export const startSession = async (metadata: any) => {
  const response = await api.post('/sessions/start', {
    metadata,
    clientTimestamp: new Date().toISOString(),
  });
  return response.data.session;
};

export const endSession = async (
  sessionId: string,
  recordingUrl?: string,
  recordingSize?: number,
  totalDuration?: number
) => {
  const response = await api.put(`/sessions/${sessionId}/end`, {
    recordingUrl,
    recordingSize,
    totalDuration,
    clientTimestamp: new Date().toISOString(),
  });
  return response.data.session;
};

export const logActivity = async (
  sessionId: string,
  eventType: ActivityEventType,
  eventData: any = {},
  videoTimestamp?: number
) => {
  const response = await api.post(`/sessions/${sessionId}/activity`, {
    eventType,
    eventData,
    videoTimestamp,
    clientTimestamp: new Date().toISOString(),
  });
  return response.data.event;
};
