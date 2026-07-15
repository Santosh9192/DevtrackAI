import api from './api'

const commentService = {
  getForTask: (taskId) => api.get(`/api/comments/task/${taskId}`),

  create: (taskId, data) => api.post(`/api/comments/task/${taskId}`, data),

  delete: (id) => api.delete(`/api/comments/${id}`),
}

export default commentService
