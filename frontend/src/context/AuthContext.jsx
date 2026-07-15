import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const setTokens = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }, [])

  const clearTokens = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete api.defaults.headers.common['Authorization']
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { access_token, refresh_token, user } = response.data
      setTokens(access_token, refresh_token)
      setUser(user)
      toast.success(`Welcome back, ${user.full_name}!`)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [navigate, setTokens])

  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData)
      toast.success('Registration successful! Please login.')
      navigate('/login')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [navigate])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }, [navigate, clearTokens])

  const refreshToken = useCallback(async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) return false

    try {
      const response = await api.post('/api/auth/refresh', { refresh_token })
      const { access_token } = response.data
      localStorage.setItem('access_token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      return true
    } catch (error) {
      clearTokens()
      setUser(null)
      return false
    }
  }, [clearTokens])

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await api.get('/api/auth/me')
        setUser(response.data)
      } catch (error) {
        // Try refreshing token
        const refreshed = await refreshToken()
        if (refreshed) {
          try {
            const response = await api.get('/api/auth/me')
            setUser(response.data)
          } catch {
            clearTokens()
          }
        } else {
          clearTokens()
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [refreshToken, clearTokens])

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          const refreshed = await refreshToken()
          if (refreshed) {
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`
            return api(originalRequest)
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [refreshToken])

  const hasRole = useCallback((...roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    hasRole,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
