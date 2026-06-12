import api from './axios';

export const announcementApi = {
  getAll: () => api.get('/api/announcements'),
  create: (title, content) => api.post('/api/announcements', { title, content }),
};
