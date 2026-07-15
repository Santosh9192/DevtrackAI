import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import taskService from '../services/taskService'
import projectService from '../services/projectService'
import {
  HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineCalendar,
  HiOutlineUserCircle, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

const statusStyles = {
  todo: 'border-l-blue-500',
  in_progress: 'border-l-amber-500',
  review: 'border-l-purple-500',
  completed: 'border-l-emerald-500',
}

const priorityStyles = {
  low: 'text-blue-400 bg-blue-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-red-400 bg-red-500/10',
  critical: 'text-red-400 bg-red-500/10',
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', project_id: '',
    assignee_id: '', deadline: '', estimated_hours: '',
  })

  useEffect(() => {
    loadProjects()
    loadTasks()
  }, [page, statusFilter, projectFilter])

  const loadProjects = async () => {
    try {
      const res = await projectService.getAll({ per_page: 100 })
      setProjects(res.data.projects)
    } catch (error) {}
  }

  const loadTasks = async () => {
    try {
      const params = { page, per_page: 15 }
      if (statusFilter) params.status = statusFilter
      if (projectFilter) params.project_id = parseInt(projectFilter)
      if (search) params.search = search

      const res = await taskService.getAll(params)
      setTasks(res.data.tasks)
      setTotal(res.data.total)
      setTotalPages(Math.ceil(res.data.total / 15))
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await taskService.create({
        ...formData,
        project_id: parseInt(formData.project_id),
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
      })
      toast.success('Task created!')
      setShowCreate(false)
      setFormData({ title: '', description: '', priority: 'medium', project_id: '', assignee_id: '', deadline: '', estimated_hours: '' })
      loadTasks()
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus })
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`)
      loadTasks()
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-gray-400 mt-1">{total} total tasks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus size={18} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadTasks()}
            className="glass-input pl-10" placeholder="Search tasks..." />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="glass-select w-full sm:w-36">
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setPage(1) }} className="glass-select w-full sm:w-44">
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-4 border-l-4 ${statusStyles[task.status]} hover:bg-white/10 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-white">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <HiOutlineUserCircle size={14} />
                        {task.assignee.full_name}
                      </span>
                    )}
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <HiOutlineCalendar size={14} />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {task.is_overdue ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <HiOutlineExclamationTriangle size={14} />
                        Overdue
                      </span>
                    ) : null}
                  </div>
                </div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-gray-300 focus:outline-none focus:border-primary-500/50"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="btn-secondary p-2 disabled:opacity-50">
            <HiOutlineChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="btn-secondary p-2 disabled:opacity-50">
            <HiOutlineChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="glass-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="glass-input min-h-[80px]" />
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="glass-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Est. Hours</label>
                  <input type="number" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} className="glass-input" step="0.5" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
