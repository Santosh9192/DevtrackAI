import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import dashboardService from '../services/dashboardService'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import ManagerDashboard from '../components/dashboard/ManagerDashboard'
import DeveloperDashboard from '../components/dashboard/DeveloperDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
      ])
      setStats(statsRes.data)
      setCharts(chartsRes.data)
    } catch (error) {
      console.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      </div>
    )
  }

  const role = user?.role || 'developer'

  // Render role-specific dashboard
  switch (role) {
    case 'admin':
    case 'superadmin':
      return <AdminDashboard stats={stats} charts={charts} />
    case 'project_manager':
    case 'manager':
      return <ManagerDashboard stats={stats} charts={charts} />
    default:
      return <DeveloperDashboard stats={stats} charts={charts} />
  }
}
