import api from './axios';

export const messageApi = {
  getConversation: (userId) => api.get(`/api/messages/conversation/${userId}`),
  getUnreadCounts: () => api.get('/api/messages/unread-counts'),
  send: (receiverId, content) => api.post('/api/messages', { receiverId, content }),
  markAsRead: (messageId) => api.put(`/api/messages/${messageId}/read`),
  markAsDelivered: (messageId) => api.put(`/api/messages/${messageId}/delivered`),
};
