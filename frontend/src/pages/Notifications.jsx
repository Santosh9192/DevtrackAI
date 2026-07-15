import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import notificationService from '../services/notificationService'
import {
  HiOutlineBell, HiOutlineCheckCircle, HiOutlineTrash,
  HiOutlineExclamationTriangle, HiOutlineCalendar, HiOutlineBugAnt,
  HiOutlineSparkles, HiOutlineInformationCircle,
} from 'react-icons/hi2'

const typeIcons = {
  task_assigned: HiOutlineBell,
  task_completed: HiOutlineCheckCircle,
  project_deadline: HiOutlineCalendar,
  bug_assigned: HiOutlineBugAnt,
  ai_report: HiOutlineSparkles,
  info: HiOutlineInformationCircle,
}

const typeColors = {
  task_assigned: 'text-blue-400 bg-blue-500/10',
  task_completed: 'text-emerald-400 bg-emerald-500/10',
  project_deadline: 'text-amber-400 bg-amber-500/10',
  bug_assigned: 'text-red-400 bg-red-500/10',
  ai_report: 'text-purple-400 bg-purple-500/10',
  info: 'text-gray-400 bg-gray-500/10',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => { loadNotifications() }, [page])

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getAll({ page, per_page: 20 })
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unread_count)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id)
      setNotifications(notifications.filter(n => n.id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2">
            <HiOutlineCheckCircle size={18} />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.notification_type] || HiOutlineBell
            const colorClass = typeColors[notif.notification_type] || typeColors.info

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-4 flex items-start gap-4 transition-colors ${!notif.is_read ? 'bg-primary-500/5 border-l-2 border-primary-500' : 'hover:bg-white/5'}`}
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{notif.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {!notif.is_read && (
                        <button onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-primary-400 transition-colors"
                          title="Mark as read">
                          <HiOutlineCheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(notif.id)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete">
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {notifications.length === 0 && (
            <div className="text-center py-16">
              <HiOutlineBell size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
              <p className="text-gray-400">You're all caught up!</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">Previous</button>
        <span className="text-sm text-gray-400">Page {page}</span>
        <button onClick={() => setPage(page + 1)} className="btn-secondary text-sm px-4 py-2">Next</button>
      </div>
    </div>
  )
}
