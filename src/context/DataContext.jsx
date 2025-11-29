import React, { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from './AuthContext'

const DataContext = createContext()

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function DataProvider({ children }) {
  const { currentUser, getUserById, addNotification, enrollInRoom, unenrollFromRoom } = useAuth()
  const [rooms, setRooms] = useLocalStorage('cursohub_rooms', [])
  const [comments, setComments] = useLocalStorage('cursohub_comments', [])
  const [materials, setMaterials] = useLocalStorage('cursohub_materials', [])

  // ==================== ROOM MANAGEMENT ====================
  function createRoom(name, description = '') {
    if (!currentUser) return null

    const room = {
      id: uid(),
      name,
      description,
      professorId: currentUser.id,
      professorName: currentUser.name,
      inviteCode: generateInviteCode(),
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
    // Also delete related comments and materials
    setComments(prev => prev.filter(c => c.roomId !== roomId))
    setMaterials(prev => prev.filter(m => m.roomId !== roomId))
  }

  function regenerateInviteCode(roomId) {
    const newCode = generateInviteCode()
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, inviteCode: newCode } : r))
    return newCode
  }

  // ==================== PLAYLIST MANAGEMENT ====================
  function createPlaylist(roomId, name) {
    const playlist = { 
      id: uid(), 
      name, 
      videos: [], 
      order: 0,
      createdAt: new Date().toISOString() 
    }
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      const newPlaylist = { ...playlist, order: r.playlists.length }
      
      // Notify enrolled students
      r.enrolledStudents.forEach(studentId => {
        addNotification(studentId, {
          type: 'new_playlist',
          title: 'Nova playlist disponível',
          message: `"${name}" foi adicionada em ${r.name}`,
          roomId,
          read: false
        })
      })

      return { ...r, playlists: [...r.playlists, newPlaylist] }
    }))
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
    // Delete related materials
    setMaterials(prev => prev.filter(m => m.playlistId !== playlistId))
  }

  function reorderPlaylists(roomId, playlistIds) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      const reorderedPlaylists = playlistIds.map((id, index) => {
        const playlist = r.playlists.find(p => p.id === id)
        return { ...playlist, order: index }
      })
      return { ...r, playlists: reorderedPlaylists }
    }))
  }

  // ==================== VIDEO MANAGEMENT ====================
  function addVideo(roomId, playlistId, video) {
    const room = getRoom(roomId)
    const playlist = room?.playlists.find(p => p.id === playlistId)
    
    const newVideo = { 
      id: uid(), 
      ...video, 
      order: playlist?.videos.length || 0,
      createdAt: new Date().toISOString() 
    }
    
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      
      // Notify enrolled students
      r.enrolledStudents.forEach(studentId => {
        addNotification(studentId, {
          type: 'new_video',
          title: 'Nova videoaula disponível',
          message: `"${video.title}" foi adicionada em ${r.name}`,
          roomId,
          playlistId,
          videoId: newVideo.id,
          read: false
        })
      })

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
    // Delete related comments and materials
    setComments(prev => prev.filter(c => c.videoId !== videoId))
    setMaterials(prev => prev.filter(m => m.videoId !== videoId))
  }

  function reorderVideos(roomId, playlistId, videoIds) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return {
        ...r,
        playlists: r.playlists.map(p => {
          if (p.id !== playlistId) return p
          const reorderedVideos = videoIds.map((id, index) => {
            const video = p.videos.find(v => v.id === id)
            return { ...video, order: index }
          })
          return { ...p, videos: reorderedVideos }
        })
      }
    }))
  }

  // ==================== STUDENT MANAGEMENT ====================
  function addStudentToRoom(roomId, studentId) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      if (r.enrolledStudents.includes(studentId)) return r
      
      // Notify the student
      addNotification(studentId, {
        type: 'enrolled',
        title: 'Matrícula confirmada!',
        message: `Você foi matriculado em "${r.name}"`,
        roomId,
        read: false
      })

      return { ...r, enrolledStudents: [...r.enrolledStudents, studentId] }
    }))
  }

  function removeStudentFromRoom(roomId, studentId) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      return { ...r, enrolledStudents: r.enrolledStudents.filter(id => id !== studentId) }
    }))
  }

  function enrollByInviteCode(inviteCode) {
    if (!currentUser) return { success: false, error: 'Não autenticado' }

    const room = rooms.find(r => r.inviteCode === inviteCode.toUpperCase())
    if (!room) {
      return { success: false, error: 'Código de convite inválido' }
    }

    if (room.enrolledStudents.includes(currentUser.id)) {
      return { success: false, error: 'Você já está matriculado nesta sala' }
    }

    addStudentToRoom(room.id, currentUser.id)
    enrollInRoom(room.id)

    return { success: true, room }
  }

  function enrollStudent(roomId) {
    if (!currentUser) return
    addStudentToRoom(roomId, currentUser.id)
    enrollInRoom(roomId)
  }

  function unenrollStudent(roomId) {
    if (!currentUser) return
    removeStudentFromRoom(roomId, currentUser.id)
    unenrollFromRoom(roomId)
  }

  // ==================== COMMENTS/QUESTIONS ====================
  function addComment(videoId, roomId, playlistId, content, parentId = null) {
    if (!currentUser) return null

    const comment = {
      id: uid(),
      videoId,
      roomId,
      playlistId,
      parentId, // for replies
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      resolved: false
    }

    setComments(prev => [...prev, comment])

    // Notify professor if student asks question
    if (currentUser.role === 'aluno' && !parentId) {
      const room = getRoom(roomId)
      if (room) {
        addNotification(room.professorId, {
          type: 'new_question',
          title: 'Nova dúvida',
          message: `${currentUser.name} fez uma pergunta`,
          roomId,
          videoId,
          commentId: comment.id,
          read: false
        })
      }
    }

    // Notify student if professor replies
    if (currentUser.role === 'professor' && parentId) {
      const parentComment = comments.find(c => c.id === parentId)
      if (parentComment && parentComment.userId !== currentUser.id) {
        addNotification(parentComment.userId, {
          type: 'comment_reply',
          title: 'Nova resposta',
          message: `Professor respondeu sua dúvida`,
          roomId,
          videoId,
          commentId: comment.id,
          read: false
        })
      }
    }

    return comment
  }

  function getVideoComments(videoId) {
    return comments
      .filter(c => c.videoId === videoId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  function markCommentResolved(commentId) {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ))
  }

  function deleteComment(commentId) {
    // Delete comment and all replies
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId))
  }

  // ==================== MATERIALS ====================
  function addMaterial(videoId, roomId, playlistId, material) {
    const newMaterial = {
      id: uid(),
      videoId,
      roomId,
      playlistId,
      ...material, // { name, type, url, size }
      uploadedBy: currentUser?.id,
      createdAt: new Date().toISOString()
    }

    setMaterials(prev => [...prev, newMaterial])
    return newMaterial
  }

  function getVideoMaterials(videoId) {
    return materials.filter(m => m.videoId === videoId)
  }

  function deleteMaterial(materialId) {
    setMaterials(prev => prev.filter(m => m.id !== materialId))
  }

  // ==================== GETTERS ====================
  function getRoom(roomId) {
    return rooms.find(r => r.id === roomId)
  }

  function getPlaylist(roomId, playlistId) {
    const room = getRoom(roomId)
    return room?.playlists?.find(p => p.id === playlistId)
  }

  function getMyRooms() {
    if (!currentUser) return []
    if (currentUser.role === 'professor') {
      return rooms.filter(r => r.professorId === currentUser.id)
    }
    return rooms.filter(r => currentUser.enrolledRooms?.includes(r.id) || r.enrolledStudents?.includes(currentUser.id))
  }

  function getAllRooms() {
    return rooms
  }

  function getRoomStudents(roomId) {
    const room = getRoom(roomId)
    if (!room) return []
    return room.enrolledStudents.map(id => getUserById(id)).filter(Boolean)
  }

  function getNextVideo(roomId, playlistId, currentVideoId) {
    const playlist = getPlaylist(roomId, playlistId)
    if (!playlist) return null
    
    const sortedVideos = [...playlist.videos].sort((a, b) => (a.order || 0) - (b.order || 0))
    const currentIndex = sortedVideos.findIndex(v => v.id === currentVideoId)
    
    if (currentIndex >= 0 && currentIndex < sortedVideos.length - 1) {
      return sortedVideos[currentIndex + 1]
    }
    return null
  }

  // ==================== STATISTICS ====================
  function getRoomStats(roomId) {
    const room = getRoom(roomId)
    if (!room) return null

    const totalVideos = room.playlists.reduce((acc, p) => acc + p.videos.length, 0)
    const totalComments = comments.filter(c => c.roomId === roomId).length
    const unresolvedQuestions = comments.filter(c => c.roomId === roomId && !c.parentId && !c.resolved).length

    return {
      totalStudents: room.enrolledStudents.length,
      totalPlaylists: room.playlists.length,
      totalVideos,
      totalComments,
      unresolvedQuestions
    }
  }

  function getVideoStats(videoId) {
    const videoComments = comments.filter(c => c.videoId === videoId)
    const videoMaterials = materials.filter(m => m.videoId === videoId)

    return {
      commentsCount: videoComments.length,
      materialsCount: videoMaterials.length,
      unresolvedQuestions: videoComments.filter(c => !c.parentId && !c.resolved).length
    }
  }

  // ==================== SEARCH ====================
  function searchVideos(query, roomId = null) {
    const searchTerm = query.toLowerCase()
    const results = []

    const roomsToSearch = roomId ? [getRoom(roomId)] : rooms
    
    roomsToSearch.forEach(room => {
      if (!room) return
      room.playlists.forEach(playlist => {
        playlist.videos.forEach(video => {
          if (
            video.title.toLowerCase().includes(searchTerm) ||
            video.description?.toLowerCase().includes(searchTerm)
          ) {
            results.push({
              ...video,
              roomId: room.id,
              roomName: room.name,
              playlistId: playlist.id,
              playlistName: playlist.name
            })
          }
        })
      })
    })

    return results
  }

  const value = {
    rooms,
    // Room
    createRoom,
    updateRoom,
    deleteRoom,
    getRoom,
    getMyRooms,
    getAllRooms,
    regenerateInviteCode,
    getRoomStats,
    getRoomStudents,
    // Playlist
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylist,
    reorderPlaylists,
    // Video
    addVideo,
    updateVideo,
    deleteVideo,
    reorderVideos,
    getNextVideo,
    getVideoStats,
    // Student
    enrollStudent,
    unenrollStudent,
    enrollByInviteCode,
    addStudentToRoom,
    removeStudentFromRoom,
    // Comments
    addComment,
    getVideoComments,
    markCommentResolved,
    deleteComment,
    // Materials
    addMaterial,
    getVideoMaterials,
    deleteMaterial,
    // Search
    searchVideos
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
