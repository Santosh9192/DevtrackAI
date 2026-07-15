import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  HiOutlinePencilSquare, HiOutlineCamera, HiOutlineCalendar,
  HiOutlineEnvelope, HiOutlinePhone, HiOutlineBuildingOffice,
  HiOutlineBriefcase,
} from 'react-icons/hi2'

export default function Profile() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '', bio: '', phone: '', department: '', designation: '',
  })
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const [profileRes, activityRes] = await Promise.all([
        api.get('/api/profile/'),
        api.get('/api/profile/activity'),
      ])
      setProfile(profileRes.data)
      setActivity(activityRes.data.activities)
      setFormData({
        full_name: profileRes.data.full_name || '',
        bio: profileRes.data.bio || '',
        phone: profileRes.data.phone || '',
        department: profileRes.data.department || '',
        designation: profileRes.data.designation || '',
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await api.put('/api/profile/', formData)
      setProfile(res.data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile({ ...profile, avatar_url: res.data.avatar_url })
      toast.success('Avatar updated!')
    } catch (error) {
      toast.error('Failed to upload avatar')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-64 mb-6" />
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {(profile?.full_name || 'U')[0].toUpperCase()}
              </span>
            </div>
            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <HiOutlineCamera size={24} className="text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-between mb-2">
              <h1 className="text-2xl font-bold text-white">{profile?.full_name}</h1>
              <button onClick={() => setEditing(!editing)}
                className="btn-ghost hidden md:flex items-center gap-2">
                <HiOutlinePencilSquare size={18} />
                Edit Profile
              </button>
            </div>
            <p className="text-gray-400 mb-1">@{profile?.username}</p>
            <p className="text-sm text-gray-500 capitalize mb-4">{profile?.role} • {profile?.department}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><HiOutlineEnvelope size={16} />{profile?.email}</span>
              {profile?.phone && <span className="flex items-center gap-1"><HiOutlinePhone size={16} />{profile.phone}</span>}
              <span className="flex items-center gap-1"><HiOutlineBriefcase size={16} />{profile?.designation}</span>
              <span className="flex items-center gap-1"><HiOutlineCalendar size={16} />Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-white/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input type="text" value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <input type="text" value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Designation</label>
                <input type="text" value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="glass-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="glass-input min-h-[80px]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">Save Changes</button>
            </div>
          </motion.div>
        )}

        {/* Mobile edit button */}
        <div className="md:hidden mt-4">
          <button onClick={() => setEditing(!editing)} className="btn-secondary w-full flex items-center justify-center gap-2">
            <HiOutlinePencilSquare size={18} />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mt-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Activity History</h2>
        <div className="space-y-3">
          {activity.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-300">{a.description}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-gray-500 text-center py-4">No activity yet</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
