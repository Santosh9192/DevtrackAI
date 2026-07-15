import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import bugService from '../services/bugService'
import projectService from '../services/projectService'
import {
  HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineBugAnt,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineCalendar,
  HiOutlineUserCircle,
} from 'react-icons/hi2'

const severityStyles = {
  critical: 'badge-danger',
  high: 'badge-warning',
  medium: 'badge-info',
  low: 'badge-success',
}

const statusStyles = {
  open: 'badge-danger',
  in_progress: 'badge-warning',
  resolved: 'badge-success',
  closed: 'badge',
  reopened: 'badge-danger',
}

export default function Bugs() {
  const [bugs, setBugs] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', project_id: '', severity: 'medium',
    priority: 'medium', steps_to_reproduce: '',
  })

  useEffect(() => {
    loadProjects()
    loadBugs()
  }, [page, statusFilter, severityFilter, projectFilter])

  const loadProjects = async () => {
    try {
      const res = await projectService.getAll({ per_page: 100 })
      setProjects(res.data.projects)
    } catch (error) {}
  }

  const loadBugs = async () => {
    try {
      const params = { page, per_page: 15 }
      if (statusFilter) params.status = statusFilter
      if (severityFilter) params.severity = severityFilter
      if (projectFilter) params.project_id = parseInt(projectFilter)
      if (search) params.search = search

      const res = await bugService.getAll(params)
      setBugs(res.data.bugs)
      setTotal(res.data.total)
    } catch (error) {
      toast.error('Failed to load bugs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await bugService.create(formData)
      toast.success('Bug reported!')
      setShowCreate(false)
      setFormData({ title: '', description: '', project_id: '', severity: 'medium', priority: 'medium', steps_to_reproduce: '' })
      loadBugs()
    } catch (error) {
      toast.error('Failed to report bug')
    }
  }

  const handleStatusChange = async (bugId, status) => {
    try {
      await bugService.update(bugId, { status })
      toast.success(`Bug status updated to ${status}`)
      loadBugs()
    } catch (error) {
      toast.error('Failed to update bug')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bug Tracker</h1>
          <p className="text-gray-400 mt-1">{total} total bugs</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus size={18} />
          Report Bug
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBugs()}
            className="glass-input pl-10" placeholder="Search bugs..." />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="glass-select w-full sm:w-32">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1) }} className="glass-select w-full sm:w-32">
          <option value="">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Bug List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {bugs.map((bug) => (
            <motion.div
              key={bug.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <HiOutlineBugAnt size={18} className="text-red-400 flex-shrink-0" />
                    <h3 className="font-medium text-white">{bug.title}</h3>
                    <span className={severityStyles[bug.severity]}>{bug.severity}</span>
                    <span className={statusStyles[bug.status]}>{bug.status?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{bug.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Project: {bug.project_id}</span>
                    {bug.assigned_to && <span>Assigned to: User #{bug.assigned_to}</span>}
                    <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <select
                  value={bug.status}
                  onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-gray-300 focus:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="btn-secondary p-2 disabled:opacity-50">
          <HiOutlineChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-400">Page {page}</span>
        <button onClick={() => setPage(page + 1)} className="btn-secondary p-2 disabled:opacity-50">
          <HiOutlineChevronRight size={18} />
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Report Bug</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="glass-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="glass-input min-h-[80px]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Steps to Reproduce</label>
                <textarea value={formData.steps_to_reproduce} onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })} className="glass-input min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
                  <select value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className="glass-select" required>
                    <option value="">Select project</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                  <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="glass-select">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Report Bug</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
