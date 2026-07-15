import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import projectService from '../services/projectService'
import taskService from '../services/taskService'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineArrowLeft, HiOutlinePlus,
  HiOutlineCalendar, HiOutlineUserGroup, HiOutlineChartBar,
  HiOutlineUserCircle, HiOutlineClock,
} from 'react-icons/hi2'

const kanbanColumns = [
  { id: 'todo', title: 'To Do', color: 'border-t-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-amber-500' },
  { id: 'review', title: 'Review', color: 'border-t-purple-500' },
  { id: 'completed', title: 'Completed', color: 'border-t-emerald-500' },
]

const priorityStyles = {
  low: 'text-blue-400 bg-blue-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-red-400 bg-red-500/10',
  critical: 'text-red-400 bg-red-500/10',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', assignee_id: '',
    deadline: '', estimated_hours: '',
  })

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [projectRes, boardRes] = await Promise.all([
        projectService.getById(id),
        taskService.getKanban(id),
      ])
      setProject(projectRes.data)
      setBoard(boardRes.data)
    } catch (error) {
      toast.error('Failed to load project')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { draggableId, source, destination } = result
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // Update local state
    const newBoard = { ...board }
    const sourceCol = [...newBoard[source.droppableId]]
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...newBoard[destination.droppableId]]
    const [movedTask] = sourceCol.splice(source.index, 1)

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, movedTask)
    } else {
      destCol.splice(destination.index, 0, { ...movedTask, status: destination.droppableId })
    }

    newBoard[source.droppableId] = sourceCol
    newBoard[destination.droppableId] = destCol
    setBoard(newBoard)

    // Update backend
    try {
      await taskService.update(draggableId, { status: destination.droppableId, board_order: destination.index })
    } catch (error) {
      toast.error('Failed to update task')
      loadData()
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      await taskService.create({
        ...taskForm,
        project_id: parseInt(id),
        assignee_id: taskForm.assignee_id ? parseInt(taskForm.assignee_id) : null,
        estimated_hours: taskForm.estimated_hours ? parseFloat(taskForm.estimated_hours) : null,
      })
      toast.success('Task created!')
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', priority: 'medium', assignee_id: '', deadline: '', estimated_hours: '' })
      loadData()
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-32 mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-96" />)}
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors mt-1">
            <HiOutlineArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <span className={`badge ${project.status === 'completed' ? 'badge-success' : project.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}>
                {project.status?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-400 mt-1">{project.description}</p>
          </div>
        </div>
      </div>

      {/* Project Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <HiOutlineCalendar size={20} className="text-primary-400" />
          <div>
            <p className="text-xs text-gray-400">Deadline</p>
            <p className="text-sm font-medium text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <HiOutlineUserGroup size={20} className="text-emerald-400" />
          <div>
            <p className="text-xs text-gray-400">Members</p>
            <p className="text-sm font-medium text-white">{project.member_count}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <HiOutlineChartBar size={20} className="text-purple-400" />
          <div>
            <p className="text-xs text-gray-400">Tasks</p>
            <p className="text-sm font-medium text-white">{project.task_count}</p>
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/5 rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
            <span className="text-sm font-medium text-white">{project.progress}%</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Board</h2>
        <button onClick={() => setShowTaskModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus size={18} />
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((column) => (
            <div key={column.id} className={`kanban-column border-t-2 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{column.title}</h3>
                <span className="text-sm text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {board?.[column.id]?.length || 0}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary-500/5 rounded-xl' : ''}`}
                  >
                    {board?.[column.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'rotate-2 shadow-2xl' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-white">{task.title}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyles[task.priority] || 'text-gray-400 bg-white/5'}`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.assignee && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{task.assignee.full_name?.[0]}</span>
                                </div>
                                <span className="text-xs text-gray-400">{task.assignee.full_name}</span>
                              </div>
                            )}
                            {task.deadline && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <HiOutlineCalendar size={12} />
                                {new Date(task.deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Add Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="glass-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="glass-input min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="glass-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assignee</label>
                  <input type="number" value={taskForm.assignee_id} onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })} className="glass-input" placeholder="User ID" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                  <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Est. Hours</label>
                  <input type="number" value={taskForm.estimated_hours} onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })} className="glass-input" step="0.5" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
