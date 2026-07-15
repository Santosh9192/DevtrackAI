import api from './api'

const projectService = {
  getAll: (params = {}) => api.get('/api/projects/', { params }),

  getById: (id) => api.get(`/api/projects/${id}`),

  create: (data) => api.post('/api/projects/', data),

  update: (id, data) => api.put(`/api/projects/${id}`, data),

  delete: (id) => api.delete(`/api/projects/${id}`),

  addMember: (projectId, data) => api.post(`/api/projects/${projectId}/members`, data),

  removeMember: (projectId, memberId) => api.delete(`/api/projects/${projectId}/members/${memberId}`),
}

export default projectService
