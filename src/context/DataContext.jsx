import React, { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DataContext = createContext()

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function DataProvider({ children }) {
  const [rooms, setRooms] = useLocalStorage('cursohub_rooms', [])
  const [currentUser, setCurrentUser] = useLocalStorage('cursohub_user', {
    id: 'prof1',
    name: 'Professor Demo',
    role: 'professor', // 'professor' | 'aluno'
    enrolledRooms: [] // for aluno
  })

  // Room management
  function createRoom(name, description = '') {
    const room = {
      id: uid(),
      name,
      description,
      professorId: currentUser.id,
      playlists: [],
      enrolledStudents: [],
      createdAt: new Date().toISOString()
    }
    setRooms(prev => [...prev, room])
    return room
  }

  function updateRoom(roomId, updates) {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r))
  }

  function deleteRoom(roomId) {
    setRooms(prev => prev.filter(r => r.id !== roomId))
  }

  // Playlist management
  function createPlaylist(roomId, name) {
    const playlist = { id: uid(), name, videos: [], createdAt: new Date().toISOString() }
    setRooms(prev => prev.map(r =>
      r.id === roomId ? { ...r, playlists: [...r.playlists, playlist] } : r
    ))
    return playlist
  }

  function updatePlaylist(roomId, playlistId, updates) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return {
        ...r,
        playlists: r.playlists.map(p => p.id === playlistId ? { ...p, ...updates } : p)
      }
    }))
  }

  function deletePlaylist(roomId, playlistId) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return { ...r, playlists: r.playlists.filter(p => p.id !== playlistId) }
    }))
  }

  // Video management
  function addVideo(roomId, playlistId, video) {
    const newVideo = { id: uid(), ...video, createdAt: new Date().toISOString() }
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return {
        ...r,
        playlists: r.playlists.map(p =>
          p.id === playlistId ? { ...p, videos: [...p.videos, newVideo] } : p
        )
      }
    }))
    return newVideo
  }

  function updateVideo(roomId, playlistId, videoId, updates) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return {
        ...r,
        playlists: r.playlists.map(p => {
          if (p.id !== playlistId) return p
          return { ...p, videos: p.videos.map(v => v.id === videoId ? { ...v, ...updates } : v) }
        })
      }
    }))
  }

  function deleteVideo(roomId, playlistId, videoId) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return {
        ...r,
        playlists: r.playlists.map(p => {
          if (p.id !== playlistId) return p
          return { ...p, videos: p.videos.filter(v => v.id !== videoId) }
        })
      }
    }))
  }

  // Student enrollment
  function enrollStudent(roomId) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      if (r.enrolledStudents.includes(currentUser.id)) return r
      return { ...r, enrolledStudents: [...r.enrolledStudents, currentUser.id] }
    }))
    setCurrentUser(prev => ({
      ...prev,
      enrolledRooms: prev.enrolledRooms.includes(roomId) ? prev.enrolledRooms : [...prev.enrolledRooms, roomId]
    }))
  }

  function unenrollStudent(roomId) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return { ...r, enrolledStudents: r.enrolledStudents.filter(id => id !== currentUser.id) }
    }))
    setCurrentUser(prev => ({
      ...prev,
      enrolledRooms: prev.enrolledRooms.filter(id => id !== roomId)
    }))
  }

  // User management
  function switchRole(role) {
    setCurrentUser(prev => ({ ...prev, role, id: role === 'professor' ? 'prof1' : 'aluno1' }))
  }

  function updateProfile(updates) {
    setCurrentUser(prev => ({ ...prev, ...updates }))
  }

  // Getters
  function getRoom(roomId) {
    return rooms.find(r => r.id === roomId)
  }

  function getPlaylist(roomId, playlistId) {
    const room = getRoom(roomId)
    return room?.playlists?.find(p => p.id === playlistId)
  }

  function getMyRooms() {
    if (currentUser.role === 'professor') {
      return rooms.filter(r => r.professorId === currentUser.id)
    }
    return rooms.filter(r => currentUser.enrolledRooms.includes(r.id))
  }

  function getAllRooms() {
    return rooms
  }

  const value = {
    rooms,
    currentUser,
    // Room
    createRoom,
    updateRoom,
    deleteRoom,
    getRoom,
    getMyRooms,
    getAllRooms,
    // Playlist
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylist,
    // Video
    addVideo,
    updateVideo,
    deleteVideo,
    // Student
    enrollStudent,
    unenrollStudent,
    // User
    switchRole,
    updateProfile
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
