import React, { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext()

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

function hashPassword(password) {
  // Simple hash for demo - in production use bcrypt on backend
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage('cursohub_users', [])
  const [currentUser, setCurrentUser] = useLocalStorage('cursohub_current_user', null)
  const [notifications, setNotifications] = useLocalStorage('cursohub_notifications', [])

  // Register new user
  function register(email, password, name, role) {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, error: 'Email já cadastrado' }
    }

    const newUser = {
      id: uid(),
      email: email.toLowerCase(),
      password: hashPassword(password),
      name,
      role, // 'professor' | 'aluno'
      enrolledRooms: [],
      watchedVideos: [], // { videoId, roomId, playlistId, watchedAt, progress }
      createdAt: new Date().toISOString(),
      avatar: role === 'professor' ? '👨‍🏫' : '🎓'
    }

    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    
    // Add welcome notification
    addNotification(newUser.id, {
      type: 'welcome',
      title: 'Bem-vindo ao CursoHub!',
      message: role === 'professor' 
        ? 'Comece criando sua primeira sala de aula.' 
        : 'Explore as salas disponíveis e matricule-se.',
      read: false
    })

    return { success: true, user: newUser }
  }

  // Login
  function login(email, password) {
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === hashPassword(password)
    )

    if (!user) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    setCurrentUser(user)
    return { success: true, user }
  }

  // Logout
  function logout() {
    setCurrentUser(null)
  }

  // Update user profile
  function updateProfile(updates) {
    if (!currentUser) return

    const updatedUser = { ...currentUser, ...updates }
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
  }

  // Change password
  function changePassword(oldPassword, newPassword) {
    if (!currentUser) return { success: false, error: 'Não autenticado' }

    if (currentUser.password !== hashPassword(oldPassword)) {
      return { success: false, error: 'Senha atual incorreta' }
    }

    const updatedUser = { ...currentUser, password: hashPassword(newPassword) }
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))

    return { success: true }
  }

  // Password recovery (simulated - would need email in production)
  function requestPasswordReset(email) {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { success: false, error: 'Email não encontrado' }
    }

    // In production, send email with reset link
    // For demo, we'll create a reset token stored in localStorage
    const resetToken = uid()
    const resetData = {
      token: resetToken,
      email: user.email,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    }
    localStorage.setItem('cursohub_reset_token', JSON.stringify(resetData))

    return { success: true, token: resetToken, message: 'Token de recuperação gerado' }
  }

  function resetPassword(token, newPassword) {
    const resetDataStr = localStorage.getItem('cursohub_reset_token')
    if (!resetDataStr) {
      return { success: false, error: 'Token inválido' }
    }

    const resetData = JSON.parse(resetDataStr)
    if (resetData.token !== token || new Date(resetData.expiresAt) < new Date()) {
      return { success: false, error: 'Token expirado ou inválido' }
    }

    const user = users.find(u => u.email === resetData.email)
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    const updatedUser = { ...user, password: hashPassword(newPassword) }
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u))
    localStorage.removeItem('cursohub_reset_token')

    return { success: true }
  }

  // Mark video as watched
  function markVideoWatched(videoId, roomId, playlistId, progress = 100) {
    if (!currentUser) return

    const watchEntry = {
      videoId,
      roomId,
      playlistId,
      watchedAt: new Date().toISOString(),
      progress
    }

    const existingIndex = currentUser.watchedVideos?.findIndex(w => w.videoId === videoId) ?? -1
    let updatedWatched

    if (existingIndex >= 0) {
      updatedWatched = [...currentUser.watchedVideos]
      updatedWatched[existingIndex] = watchEntry
    } else {
      updatedWatched = [...(currentUser.watchedVideos || []), watchEntry]
    }

    const updatedUser = { ...currentUser, watchedVideos: updatedWatched }
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
  }

  function isVideoWatched(videoId) {
    return currentUser?.watchedVideos?.some(w => w.videoId === videoId && w.progress >= 90) ?? false
  }

  function getVideoProgress(videoId) {
    return currentUser?.watchedVideos?.find(w => w.videoId === videoId)?.progress ?? 0
  }

  // Notifications
  function addNotification(userId, notification) {
    const newNotification = {
      id: uid(),
      userId,
      ...notification,
      createdAt: new Date().toISOString()
    }
    setNotifications(prev => [newNotification, ...prev])
    return newNotification
  }

  function getMyNotifications() {
    if (!currentUser) return []
    return notifications.filter(n => n.userId === currentUser.id).slice(0, 50)
  }

  function markNotificationRead(notificationId) {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  function markAllNotificationsRead() {
    if (!currentUser) return
    setNotifications(prev => prev.map(n => 
      n.userId === currentUser.id ? { ...n, read: true } : n
    ))
  }

  function getUnreadCount() {
    return getMyNotifications().filter(n => !n.read).length
  }

  // Enrolled rooms management
  function enrollInRoom(roomId) {
    if (!currentUser) return

    const updatedUser = {
      ...currentUser,
      enrolledRooms: currentUser.enrolledRooms.includes(roomId) 
        ? currentUser.enrolledRooms 
        : [...currentUser.enrolledRooms, roomId]
    }
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
  }

  function unenrollFromRoom(roomId) {
    if (!currentUser) return

    const updatedUser = {
      ...currentUser,
      enrolledRooms: currentUser.enrolledRooms.filter(id => id !== roomId)
    }
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
  }

  // Get user by ID (for displaying student info)
  function getUserById(userId) {
    return users.find(u => u.id === userId)
  }

  function getAllStudents() {
    return users.filter(u => u.role === 'aluno')
  }

  const value = {
    // Auth state
    currentUser,
    isAuthenticated: !!currentUser,
    isProfessor: currentUser?.role === 'professor',
    isAluno: currentUser?.role === 'aluno',

    // Auth actions
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,

    // Video progress
    markVideoWatched,
    isVideoWatched,
    getVideoProgress,

    // Notifications
    addNotification,
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount,

    // Enrollment
    enrollInRoom,
    unenrollFromRoom,

    // Users
    getUserById,
    getAllStudents,
    users
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
