import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HiOutlineBriefcase, HiOutlineUsers, HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle, HiOutlineBugAnt, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineChartBar, HiOutlineShieldCheck,
  HiOutlineArrowTrendingUp, HiOutlineCog, HiOutlineCalendar,
  HiOutlineUserGroup, HiOutlineSparkles,
} from 'react-icons/hi2'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const BUG_COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' }

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
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AdminDashboard({ stats, charts }) {
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

  const bugSeverityData = charts?.bug_severity
    ? Object.entries(charts.bug_severity).map(([name, value]) => ({ name, value }))
    : []

  const roleDistData = stats?.role_distribution
    ? Object.entries(stats.role_distribution).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    : []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="page-container">
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <HiOutlineShieldCheck size={28} className="text-red-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Full system overview — users, projects, tasks, bugs, and health metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/team" className="btn-secondary flex items-center gap-2">
            <HiOutlineUsers size={18} />
            Manage Users
          </Link>
          <Link to="/settings" className="btn-primary flex items-center gap-2">
            <HiOutlineCog size={18} />
            System Settings
          </Link>
        </div>
      </motion.div>

      {/* System Health Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.total_users, sub: `${stats?.active_users ?? 0} active`, icon: HiOutlineUsers, color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Projects', value: stats?.total_projects, sub: `${stats?.completed_projects ?? 0} completed`, icon: HiOutlineBriefcase, color: 'from-primary-500/20 to-primary-600/10', text: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Total Tasks', value: stats?.total_tasks, sub: `${stats?.completed_tasks ?? 0} done`, icon: HiOutlineClipboardDocumentList, color: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Open Bugs', value: stats?.open_bugs, sub: `${stats?.critical_bugs ?? 0} critical`, icon: HiOutlineBugAnt, color: 'from-red-500/20 to-red-600/10', text: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((card) => (
          <div key={card.label} className="stat-card group hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value ?? 0}</p>
                {card.sub && <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>}
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                <card.icon size={20} className={card.text} />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-full`} />
          </div>
        ))}
      </motion.div>

      {/* Project Health Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: stats?.in_progress_projects, icon: HiOutlineClock, color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Overdue Tasks', value: stats?.overdue_tasks, icon: HiOutlineExclamationTriangle, color: 'from-red-500/20 to-red-600/10', text: 'text-red-400', bg: 'bg-red-500/10', pulse: true },
          { label: 'Healthy Projects', value: stats?.healthy_projects, icon: HiOutlineCheckCircle, color: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'At Risk', value: stats?.at_risk_projects, icon: HiOutlineExclamationTriangle, color: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((card) => (
          <div key={card.label} className={`stat-card group hover:scale-[1.02] transition-transform ${card.pulse && (stats?.overdue_tasks > 0) ? 'animate-pulse-slow' : ''}`}>
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
          </div>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineClipboardDocumentList size={20} className="text-primary-400" />
            Global Task Progress
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

        {/* Bug Severity */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineBugAnt size={20} className="text-red-400" />
            Bug Severity Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bugSeverityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {bugSeverityData.map((entry) => (
                    <Cell key={entry.name} fill={BUG_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineUserGroup size={20} className="text-purple-400" />
            User Role Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleDistData} cx="50%" cy="50%" outerRadius={100}
                  paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roleDistData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Status */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineBriefcase size={20} className="text-primary-400" />
            Project Status Overview
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Productivity + Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineArrowTrendingUp size={20} className="text-emerald-400" />
            Weekly Productivity (All Teams)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.weekly_productivity || []}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineCalendar size={20} className="text-purple-400" />
            Monthly Completion Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.monthly_completion || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Features Promo */}
      <motion.div variants={itemVariants} className="glass-card p-6 bg-gradient-to-r from-purple-500/5 to-primary-500/5 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <HiOutlineSparkles size={28} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
              <p className="text-sm text-gray-400">Generate sprint summaries, weekly reports, and estimate project timelines with AI.</p>
            </div>
          </div>
          <Link to="/ai-features" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <HiOutlineSparkles size={18} />
            Try AI Features
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
