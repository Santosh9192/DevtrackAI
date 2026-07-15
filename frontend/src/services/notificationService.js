import api from './api'

const notificationService = {
  getAll: (params = {}) => api.get('/api/notifications/', { params }),

  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.put('/api/notifications/read-all'),

  delete: (id) => api.delete(`/api/notifications/${id}`),
}

export default notificationService
