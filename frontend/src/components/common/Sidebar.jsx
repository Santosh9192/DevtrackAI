import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineBugAnt,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineSparkles,
  HiOutlineUserCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/projects', label: 'Projects', icon: HiOutlineBriefcase },
  { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardDocumentList },
  { path: '/team', label: 'Team', icon: HiOutlineUsers },
  { path: '/bugs', label: 'Bug Tracker', icon: HiOutlineBugAnt },
  { path: '/ai-features', label: 'AI Features', icon: HiOutlineSparkles },
  { path: '/notifications', label: 'Notifications', icon: HiOutlineBell },
  { path: '/profile', label: 'Profile', icon: HiOutlineUserCircle },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
]

export default function Sidebar({ open, onToggle }) {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 256 : 80 }}
      className="fixed left-0 top-0 h-screen bg-gray-900/80 backdrop-blur-xl border-r border-white/5 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {open && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-white whitespace-nowrap"
            >
              DevTrack
            </motion.span>
          )}
        </NavLink>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          {open ? <HiOutlineChevronLeft size={18} /> : <HiOutlineChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-transparent text-primary-400 border-l-2 border-primary-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {open && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {!open && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Info */}
      {open && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
