import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import {
  HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineLanguage,
  HiOutlineEnvelope, HiOutlineShieldCheck, HiOutlineKey,
} from 'react-icons/hi2'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', confirm_password: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    try {
      const res = await api.get('/api/profile/settings')
      setSettings(res.data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key, value) => {
    setSaving(true)
    try {
      const res = await api.put('/api/profile/settings', { [key]: value })
      setSettings(res.data)
      toast.success('Setting updated')
    } catch (error) {
      toast.error('Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await api.post('/api/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })
      toast.success('Password changed!')
      setShowPasswordForm(false)
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    }
  }

  if (loading) {
    return <div className="page-container"><div className="skeleton h-96" /></div>
  }

  return (
    <div className="page-container max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title mb-6">Settings</h1>

        {/* Appearance */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineMoon size={20} className="text-primary-400" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Theme</p>
                <p className="text-xs text-gray-400">Choose between light and dark mode</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateSetting('theme', 'light')}
                  className={`p-2 rounded-lg transition-all ${settings?.theme === 'light' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <HiOutlineSun size={20} />
                </button>
                <button
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`p-2 rounded-lg transition-all ${settings?.theme === 'dark' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <HiOutlineMoon size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineBell size={20} className="text-primary-400" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            {[
              { key: 'notify_task_assigned', label: 'Task Assigned', desc: 'When a task is assigned to you' },
              { key: 'notify_task_completed', label: 'Task Completed', desc: 'When your task is completed' },
              { key: 'notify_project_deadline', label: 'Project Deadline', desc: 'When a project deadline is approaching' },
              { key: 'notify_bug_assigned', label: 'Bug Assigned', desc: 'When a bug is assigned to you' },
              { key: 'notify_ai_report', label: 'AI Report Ready', desc: 'When an AI report is generated' },
              { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive email notifications' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.[item.key] ?? true}
                    onChange={(e) => updateSetting(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineShieldCheck size={20} className="text-primary-400" />
            Security
          </h2>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
            <HiOutlineKey size={18} />
            Change Password
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input type="password" value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="glass-input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input type="password" value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="glass-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input type="password" value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="glass-input" required />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowPasswordForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Change Password</button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
