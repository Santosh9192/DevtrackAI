import api from './api'

const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats'),

  getCharts: () => api.get('/api/dashboard/charts'),
}

export default dashboardService
