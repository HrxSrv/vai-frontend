import api from './api';

export const getConversations = async (sessionId: string, page = 1, limit = 20) => {
  const response = await api.get(`/conversations/session/${sessionId}`, {
    params: { page, limit }
  });
  return response.data;
};
