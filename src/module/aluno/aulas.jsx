import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function AlunoAulas() {
  const { getMyRooms } = useData()
  const rooms = getMyRooms()

  // Collect all videos from enrolled rooms
  const allVideos = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        allVideos.push({
          ...video,
          roomName: room.name,
          roomId: room.id,
          playlistName: playlist.name
        })
      })
    })
  })

  return (
    <Layout>
      <h1>Minhas Aulas</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <p>Todas as videoaulas das salas em que você está matriculado.</p>
        <div className="stats-inline">
          <span>🏫 {rooms.length} salas</span>
          <span>🎬 {allVideos.length} aulas disponíveis</span>
        </div>
      </div>

      {allVideos.length === 0 ? (
        <div className="card empty-state">
          <p>Nenhuma aula disponível.</p>
          <p className="muted">Matricule-se em uma sala para ter acesso às videoaulas.</p>
          <Link to="/aluno" className="btn">Ver salas disponíveis</Link>
        </div>
      ) : (
        <div className="aulas-grid">
          {allVideos.map(video => (
            <Link
              key={video.id}
              to={`/aluno/sala/${video.roomId}`}
              className="aula-card card"
            >
              <div className="aula-meta">
                <span className="tag">{video.roomName}</span>
                <span className="tag secondary">{video.playlistName}</span>
              </div>
              <h4>{video.title}</h4>
              {video.description && <p className="muted">{video.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}