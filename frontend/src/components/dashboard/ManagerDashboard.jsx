import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineExclamationTriangle, HiOutlineUsers, HiOutlineClipboardDocumentList,
  HiOutlineArrowTrendingUp, HiOutlineUserGroup, HiOutlineChartBar,
  HiOutlinePlus,
} from 'react-icons/hi2'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
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

export default function ManagerDashboard({ stats, charts }) {
  const taskProgressData = charts?.task_progress
    ? Object.entries(charts.task_progress).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
      }))
    : []

  const projectDistData = charts?.project_distribution
    ? Object.entries(charts.project_distribution).map(([name, value]) => ({
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
            <HiOutlineChartBar size={28} className="text-emerald-400" />
            Manager Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Oversee your projects, team workload, and delivery health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/team" className="btn-secondary flex items-center gap-2">
            <HiOutlineUsers size={18} />
            Team ({stats?.team_size})
          </Link>
          <Link to="/projects" className="btn-primary flex items-center gap-2">
            <HiOutlinePlus size={18} />
            New Project
          </Link>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Managing', value: stats?.total_managed, icon: HiOutlineBriefcase, color: 'from-primary-500/20 to-primary-600/10', text: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Team Size', value: stats?.team_size, icon: HiOutlineUserGroup, color: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Team Tasks', value: stats?.total_team_tasks, icon: HiOutlineClipboardDocumentList, color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: stats?.completed_team_tasks, icon: HiOutlineCheckCircle, color: 'from-teal-500/20 to-teal-600/10', text: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'In Progress', value: stats?.in_progress_managed, icon: HiOutlineClock, color: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Overdue Tasks', value: stats?.overdue_team_tasks, icon: HiOutlineExclamationTriangle, color: 'from-red-500/20 to-red-600/10', text: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Pending', value: stats?.pending_projects, icon: HiOutlineClock, color: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'To Do Tasks', value: stats?.todo_tasks, icon: HiOutlineClipboardDocumentList, color: 'from-slate-500/20 to-slate-600/10', text: 'text-slate-400', bg: 'bg-slate-500/10' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineClipboardDocumentList size={20} className="text-primary-400" />
            Team Task Status
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskProgressData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  paddingAngle={4} dataKey="value">
                  {taskProgressData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-gray-400 text-sm">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Status */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineBriefcase size={20} className="text-purple-400" />
            Project Health
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Team Workload + Weekly Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineUsers size={20} className="text-amber-400" />
            Team Workload (Open Tasks)
          </h3>
          {stats?.workload && stats.workload.length > 0 ? (
            <div className="space-y-3">
              {stats.workload.map((member, i) => {
                const maxTasks = Math.max(...stats.workload.map(w => w.tasks))
                const pct = (member.tasks / maxTasks) * 100
                return (
                  <div key={member.user_id} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{member.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white truncate">{member.name}</span>
                        <span className="text-gray-400 ml-2">{member.tasks} tasks</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="h-full rounded-full transition-all duration-500" style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, #6366f1${pct > 70 ? ', #ef4444' : ''})`
                        }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No workload data yet</p>
          )}
        </motion.div>

        {/* Weekly Productivity */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineArrowTrendingUp size={20} className="text-emerald-400" />
            Team Weekly Productivity
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.weekly_productivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Link to="/projects" className="p-4 bg-primary-500/10 rounded-xl hover:bg-primary-500/20 transition-colors text-center group">
            <HiOutlinePlus size={24} className="text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Create Project</p>
          </Link>
          <Link to="/tasks" className="p-4 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/20 transition-colors text-center group">
            <HiOutlineClipboardDocumentList size={24} className="text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Assign Tasks</p>
          </Link>
          <Link to="/team" className="p-4 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-colors text-center group">
            <HiOutlineUsers size={24} className="text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">View Team</p>
          </Link>
          <Link to="/ai-features" className="p-4 bg-purple-500/10 rounded-xl hover:bg-purple-500/20 transition-colors text-center group">
            <HiOutlineChartBar size={24} className="text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">AI Reports</p>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
