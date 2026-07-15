import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineEnvelope } from 'react-icons/hi2'
import api from '../services/api'
import toast from 'react-hot-toast'

const roleColors = {
  admin: 'badge-danger',
  superadmin: 'badge-danger',
  project_manager: 'badge-primary',
  manager: 'badge-primary',
  developer: 'badge-info',
}

const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']

export default function Team() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadRoles()
    loadUsers()
  }, [page, roleFilter, deptFilter])

  const loadRoles = async () => {
    try {
      const res = await api.get('/api/users/roles')
      setRoles(res.data.roles)
    } catch (error) {}
  }

  const loadUsers = async () => {
    try {
      const params = { page, per_page: 12 }
      if (roleFilter) params.role_id = parseInt(roleFilter)
      if (deptFilter) params.department = deptFilter
      if (search) params.search = search

      const res = await api.get('/api/users/', { params })
      setUsers(res.data.users)
      setTotal(res.data.total)
    } catch (error) {
      toast.error('Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="text-gray-400 mt-1">{total} team members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            className="glass-input pl-10" placeholder="Search team members..." />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className="glass-select w-full sm:w-40">
          <option value="">All Roles</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }} className="glass-select w-full sm:w-40">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-hover p-6 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">{user.full_name?.[0]?.toUpperCase()}</span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{user.full_name}</h3>
              <p className="text-sm text-gray-400 mb-2">@{user.username}</p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={roleColors[user.role] || 'badge'}>{user.role?.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">{user.department}</p>
              <div className="flex items-center justify-center gap-2">
                <a href={`mailto:${user.email}`} className="btn-ghost text-xs flex items-center gap-1">
                  <HiOutlineEnvelope size={14} />
                  Email
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
