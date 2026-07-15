import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HiOutlineClipboardDocumentList, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineExclamationTriangle, HiOutlineCalendar, HiOutlineBriefcase,
  HiOutlineBugAnt, HiOutlineArrowTrendingUp, HiOutlineSparkles,
} from 'react-icons/hi2'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm shadow-2xl">
        <p className="text-gray-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function DeveloperDashboard({ stats, charts }) {
  const priorityData = charts?.my_priorities
    ? Object.entries(charts.my_priorities).map(([name, value]) => ({ name, value }))
    : []

  const taskProgressData = charts?.task_progress
    ? Object.entries(charts.task_progress).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
      }))
    : []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="page-container">
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <HiOutlineClipboardDocumentList size={28} className="text-blue-400" />
            My Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Track your personal tasks, bugs, and productivity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tasks" className="btn-secondary flex items-center gap-2">
            <HiOutlineClipboardDocumentList size={18} />
            My Tasks
          </Link>
          <Link to="/bugs" className="btn-primary flex items-center gap-2">
            <HiOutlineBugAnt size={18} />
            Report Bug
          </Link>
        </div>
      </motion.div>

      {/* Personal Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Tasks', value: stats?.total_my_tasks, icon: HiOutlineClipboardDocumentList, color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: stats?.completed_my_tasks, icon: HiOutlineCheckCircle, color: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'In Progress', value: stats?.in_progress_my_tasks, icon: HiOutlineClock, color: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Overdue', value: stats?.overdue_my_tasks, icon: HiOutlineExclamationTriangle, color: 'from-red-500/20 to-red-600/10', text: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'To Do', value: stats?.todo_my_tasks, icon: HiOutlineClipboardDocumentList, color: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'My Projects', value: stats?.my_project_count, icon: HiOutlineBriefcase, color: 'from-primary-500/20 to-primary-600/10', text: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'My Bugs', value: stats?.total_my_bugs, icon: HiOutlineBugAnt, color: 'from-red-500/20 to-red-600/10', text: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'This Week', value: stats?.this_week_completed, icon: HiOutlineArrowTrendingUp, color: 'from-teal-500/20 to-teal-600/10', text: 'text-teal-400', bg: 'bg-teal-500/10', suffix: 'done' },
        ].map((card) => (
          <motion.div key={card.label} variants={itemVariants} className="stat-card group hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value ?? 0}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                <card.icon size={20} className={card.text} />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-full`} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Task Progress */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineClipboardDocumentList size={20} className="text-primary-400" />
            My Task Progress
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskProgressData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  paddingAngle={4} dataKey="value">
                  {taskProgressData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-gray-400 text-sm">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* My Priority Distribution */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineExclamationTriangle size={20} className="text-amber-400" />
            Open Tasks by Priority
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={
                      entry.name === 'critical' ? '#ef4444' :
                      entry.name === 'high' ? '#f59e0b' :
                      entry.name === 'medium' ? '#6366f1' : '#10b981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Tasks + Weekly Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineCalendar size={20} className="text-amber-400" />
            Upcoming Deadlines
          </h3>
          {stats?.upcoming_tasks?.length > 0 ? (
            <div className="space-y-3">
              {stats.upcoming_tasks.map((task) => {
                const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <Link key={task.id} to={`/tasks`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{task.project_name}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs font-medium ${daysLeft <= 2 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {daysLeft <= 0 ? 'Overdue!' : `${daysLeft}d left`}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HiOutlineCalendar size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          )}
        </motion.div>

        {/* Weekly Productivity */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineArrowTrendingUp size={20} className="text-emerald-400" />
            My Weekly Productivity
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.weekly_productivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Quick Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineSparkles size={20} className="text-purple-400" />
          AI Assistant
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/ai-features" className="p-4 bg-purple-500/10 rounded-xl hover:bg-purple-500/20 transition-colors text-center group">
            <HiOutlineSparkles size={24} className="text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Generate Standup</p>
            <p className="text-xs text-gray-400 mt-1">AI writes your daily standup</p>
          </Link>
          <Link to="/ai-features" className="p-4 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-colors text-center group">
            <HiOutlineClipboardDocumentList size={24} className="text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Estimate Task</p>
            <p className="text-xs text-gray-400 mt-1">AI estimates complexity</p>
          </Link>
          <Link to="/ai-features" className="p-4 bg-amber-500/10 rounded-xl hover:bg-amber-500/20 transition-colors text-center group">
            <HiOutlineBugAnt size={24} className="text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Rewrite Bug Report</p>
            <p className="text-xs text-gray-400 mt-1">AI improves bug reports</p>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
