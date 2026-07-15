import api from './api'

const taskService = {
  getAll: (params = {}) => api.get('/api/tasks/', { params }),

  getById: (id) => api.get(`/api/tasks/${id}`),

  create: (data) => api.post('/api/tasks/', data),

  update: (id, data) => api.put(`/api/tasks/${id}`, data),

  delete: (id) => api.delete(`/api/tasks/${id}`),

  getKanban: (projectId) => api.get(`/api/tasks/kanban/${projectId}`),
}

export default taskService
