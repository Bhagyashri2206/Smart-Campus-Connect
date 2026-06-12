import api from './axios';

export const userApi = {
  getAll: (params = {}) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  getMe: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/update-profile', data),
};
