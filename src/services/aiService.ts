import api from './api';

export const askAI = async (
  question: string,
  sessionId: string,
  transcriptionConfidence?: number,
  speechDuration?: number
) => {
  const response = await api.post('/ai/ask', {
    question,
    sessionId,
    transcriptionConfidence,
    speechDuration,
    clientTimestamp: new Date().toISOString(),
  });
  return response.data;
};

export const getConversationHistory = async (sessionId: string, page = 1, limit = 20) => {
  const response = await api.get(`/ai/history/${sessionId}`, {
    params: { page, limit }
  });
  return response.data;
};

export const getAllConversations = async (page = 1, limit = 20, sessionId?: string) => {
  const params = { page, limit, ...(sessionId && { sessionId }) };
  const response = await api.get('/ai/conversations', { params });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/ai/analytics');
  return response.data.analytics;
};
