import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

export default function Estatisticas() {
  const { getMyRooms, getRoomStats } = useData()
  const { users } = useAuth()
  const rooms = getMyRooms()

  // Calculate totals
  const totalStudents = new Set(rooms.flatMap(r => r.enrolledStudents)).size
  const totalPlaylists = rooms.reduce((acc, r) => acc + r.playlists.length, 0)
  const totalVideos = rooms.reduce((acc, r) => 
    acc + r.playlists.reduce((a2, p) => a2 + p.videos.length, 0), 0)

  // Calculate video stats
  const videoStats = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        // Count how many students watched this video
        const watchedBy = users.filter(u => 
          u.watchedVideos?.some(w => w.videoId === video.id && w.progress >= 90)
        ).length

        videoStats.push({
          ...video,
          roomName: room.name,
          playlistName: playlist.name,
          roomId: room.id,
          watchedBy,
          totalStudents: room.enrolledStudents.length
        })
      })
    })
  })

  // Sort by views
  const topVideos = [...videoStats].sort((a, b) => b.watchedBy - a.watchedBy).slice(0, 10)

  // Calculate student progress per room
  const roomProgress = rooms.map(room => {
    const stats = getRoomStats(room.id)
    const totalVideos = room.playlists.reduce((acc, p) => acc + p.videos.length, 0)
    
    // Calculate average progress
    let totalProgress = 0
    let studentCount = 0

    room.enrolledStudents.forEach(studentId => {
      const student = users.find(u => u.id === studentId)
      if (student) {
        const watchedInRoom = student.watchedVideos?.filter(w => w.roomId === room.id).length || 0
        if (totalVideos > 0) {
          totalProgress += (watchedInRoom / totalVideos) * 100
          studentCount++
        }
      }
    })

    return {
      ...room,
      ...stats,
      avgProgress: studentCount > 0 ? Math.round(totalProgress / studentCount) : 0
    }
  })

  return (
    <Layout>
      <h1>Estatísticas</h1>

      {/* Overview Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{rooms.length}</div>
          <div className="stat-label">Salas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalStudents}</div>
          <div className="stat-label">Alunos Únicos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalPlaylists}</div>
          <div className="stat-label">Playlists</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalVideos}</div>
          <div className="stat-label">Videoaulas</div>
        </div>
      </div>

      <div className="stats-layout">
        {/* Top Videos */}
        <div className="card">
          <h3>🏆 Vídeos Mais Assistidos</h3>
          {topVideos.length === 0 ? (
            <p className="muted">Nenhum vídeo disponível ainda.</p>
          ) : (
            <div className="top-videos-list">
              {topVideos.map((video, index) => (
                <div key={video.id} className="top-video-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="video-info">
                    <strong>{video.title}</strong>
                    <p className="muted">{video.roomName} • {video.playlistName}</p>
                  </div>
                  <div className="video-views">
                    <span className="views-count">{video.watchedBy}</span>
                    <span className="views-label">visualizações</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Progress */}
        <div className="card">
          <h3>📊 Progresso por Sala</h3>
          {roomProgress.length === 0 ? (
            <p className="muted">Nenhuma sala criada ainda.</p>
          ) : (
            <div className="room-progress-list">
              {roomProgress.map(room => (
                <Link key={room.id} to={`/professor/salas/${room.id}`} className="room-progress-item">
                  <div className="room-progress-info">
                    <strong>{room.name}</strong>
                    <p className="muted">{room.totalStudents} alunos • {room.totalVideos} vídeos</p>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${room.avgProgress}%` }}></div>
                    <span className="progress-text">{room.avgProgress}%</span>
                  </div>
                  {room.unresolvedQuestions > 0 && (
                    <span className="questions-badge">❓ {room.unresolvedQuestions}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3>📋 Detalhamento por Sala</h3>
        <div className="stats-table">
          <table>
            <thead>
              <tr>
                <th>Sala</th>
                <th>Alunos</th>
                <th>Playlists</th>
                <th>Vídeos</th>
                <th>Comentários</th>
                <th>Dúvidas Pendentes</th>
                <th>Progresso Médio</th>
              </tr>
            </thead>
            <tbody>
              {roomProgress.map(room => (
                <tr key={room.id}>
                  <td>
                    <Link to={`/professor/salas/${room.id}`}>{room.name}</Link>
                  </td>
                  <td>{room.totalStudents}</td>
                  <td>{room.totalPlaylists}</td>
                  <td>{room.totalVideos}</td>
                  <td>{room.totalComments}</td>
                  <td>
                    {room.unresolvedQuestions > 0 ? (
                      <span className="badge danger">{room.unresolvedQuestions}</span>
                    ) : (
                      <span className="badge success">0</span>
                    )}
                  </td>
                  <td>
                    <div className="progress-mini">
                      <div className="progress-bar-mini" style={{ width: `${room.avgProgress}%` }}></div>
                      <span>{room.avgProgress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
