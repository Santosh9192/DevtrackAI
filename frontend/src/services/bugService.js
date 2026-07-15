import api from './api'

const bugService = {
  getAll: (params = {}) => api.get('/api/bugs/', { params }),

  getById: (id) => api.get(`/api/bugs/${id}`),

  create: (data) => api.post('/api/bugs/', data),

  update: (id, data) => api.put(`/api/bugs/${id}`, data),

  delete: (id) => api.delete(`/api/bugs/${id}`),
}

export default bugService
