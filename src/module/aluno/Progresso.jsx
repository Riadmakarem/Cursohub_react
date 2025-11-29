import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

export default function AlunoProgresso() {
  const { getMyRooms } = useData()
  const { currentUser, isVideoWatched, getVideoProgress } = useAuth()
  const rooms = getMyRooms()

  // Calculate overall stats
  let totalVideos = 0
  let watchedVideos = 0

  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        totalVideos++
        if (isVideoWatched(video.id)) {
          watchedVideos++
        }
      })
    })
  })

  const overallProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0

  // Calculate progress per room
  const roomProgress = rooms.map(room => {
    let roomTotal = 0
    let roomWatched = 0
    let continueFrom = null

    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        roomTotal++
        const progress = getVideoProgress(video.id)
        if (progress >= 90) {
          roomWatched++
        } else if (progress > 0 && !continueFrom) {
          continueFrom = { video, playlist, room, progress }
        }
      })
    })

    return {
      ...room,
      totalVideos: roomTotal,
      watchedVideos: roomWatched,
      progress: roomTotal > 0 ? Math.round((roomWatched / roomTotal) * 100) : 0,
      continueFrom
    }
  })

  // Get videos in progress
  const inProgress = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        const progress = getVideoProgress(video.id)
        if (progress > 0 && progress < 90) {
          inProgress.push({
            ...video,
            roomId: room.id,
            roomName: room.name,
            playlistName: playlist.name,
            progress
          })
        }
      })
    })
  })

  return (
    <Layout>
      <h1>Meu Progresso</h1>

      {/* Overall Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card highlight">
          <div className="stat-number">{overallProgress}%</div>
          <div className="stat-label">Progresso Geral</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{watchedVideos}/{totalVideos}</div>
          <div className="stat-label">Aulas Concluídas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{rooms.length}</div>
          <div className="stat-label">Salas Matriculadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inProgress.length}</div>
          <div className="stat-label">Em Andamento</div>
        </div>
      </div>

      {/* Continue Watching */}
      {inProgress.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>▶️ Continuar Assistindo</h3>
          <div className="continue-watching-grid">
            {inProgress.slice(0, 4).map(video => (
              <Link 
                key={video.id} 
                to={`/aluno/sala/${video.roomId}`}
                className="continue-card"
              >
                <div className="continue-info">
                  <strong>{video.title}</strong>
                  <p className="muted">{video.roomName} • {video.playlistName}</p>
                </div>
                <div className="continue-progress">
                  <div className="progress-bar-container small">
                    <div className="progress-bar" style={{ width: `${video.progress}%` }}></div>
                  </div>
                  <span>{video.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Progress by Room */}
      <div className="card">
        <h3>📊 Progresso por Sala</h3>
        {roomProgress.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não está matriculado em nenhuma sala.</p>
            <Link to="/aluno" className="btn">Explorar salas</Link>
          </div>
        ) : (
          <div className="room-progress-list">
            {roomProgress.map(room => (
              <div key={room.id} className="room-progress-card">
                <div className="room-progress-header">
                  <Link to={`/aluno/sala/${room.id}`}>
                    <h4>{room.name}</h4>
                  </Link>
                  <span className="progress-badge">{room.progress}%</span>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${room.progress}%` }}
                  ></div>
                </div>

                <div className="room-progress-meta">
                  <span>✅ {room.watchedVideos} de {room.totalVideos} aulas concluídas</span>
                </div>

                {room.continueFrom && (
                  <Link 
                    to={`/aluno/sala/${room.id}`}
                    className="continue-lesson"
                  >
                    ▶️ Continuar: {room.continueFrom.video.title} ({room.continueFrom.progress}%)
                  </Link>
                )}

                {room.progress === 100 && (
                  <div className="completion-badge">
                    🏆 Curso Concluído!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watch History */}
      {currentUser?.watchedVideos?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>📜 Histórico de Aulas</h3>
          <div className="watch-history">
            {[...currentUser.watchedVideos]
              .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
              .slice(0, 10)
              .map((watched, index) => {
                // Find video details
                let videoInfo = null
                rooms.forEach(room => {
                  room.playlists.forEach(playlist => {
                    const video = playlist.videos.find(v => v.id === watched.videoId)
                    if (video) {
                      videoInfo = {
                        ...video,
                        roomId: room.id,
                        roomName: room.name,
                        playlistName: playlist.name
                      }
                    }
                  })
                })

                if (!videoInfo) return null

                return (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      {new Date(watched.watchedAt).toLocaleDateString('pt-BR')}
                    </div>
                    <Link to={`/aluno/sala/${videoInfo.roomId}`} className="history-video">
                      <strong>{videoInfo.title}</strong>
                      <p className="muted">{videoInfo.roomName} • {videoInfo.playlistName}</p>
                    </Link>
                    <div className="history-status">
                      {watched.progress >= 90 ? '✅' : `${watched.progress}%`}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </Layout>
  )
}
