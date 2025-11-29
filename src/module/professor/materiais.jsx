import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function Materiais() {
  const { getMyRooms } = useData()
  const rooms = getMyRooms()

  const allVideos = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        allVideos.push({
          ...video,
          roomName: room.name,
          roomId: room.id,
          playlistName: playlist.name,
          playlistId: playlist.id
        })
      })
    })
  })

  return (
    <Layout>
      <h1>Todos os Materiais</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <p>Visão geral de todas as videoaulas publicadas.</p>
        <div className="stats-inline">
          <span>📚 {rooms.length} salas</span>
          <span>📋 {rooms.reduce((a, r) => a + r.playlists.length, 0)} playlists</span>
          <span>🎬 {allVideos.length} vídeos</span>
        </div>
      </div>

      {allVideos.length === 0 ? (
        <div className="card empty-state">
          <p>Nenhuma videoaula publicada ainda.</p>
          <Link to="/professor/salas/nova" className="btn">Criar uma sala</Link>
        </div>
      ) : (
        <div className="materials-grid">
          {allVideos.map(video => (
            <div key={video.id} className="material-card card">
              <div className="material-meta">
                <span className="tag">{video.roomName}</span>
                <span className="tag secondary">{video.playlistName}</span>
              </div>
              <h4>{video.title}</h4>
              {video.description && <p className="muted">{video.description}</p>}
              <Link to={`/professor/salas/${video.roomId}`} className="btn secondary" style={{ marginTop: 8 }}>
                Ir para sala
              </Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
