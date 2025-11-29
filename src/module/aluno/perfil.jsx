import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

export default function AlunoPerfil() {
  const { getMyRooms, unenrollStudent } = useData()
  const { currentUser, updateProfile, getVideoProgress } = useAuth()
  const [name, setName] = useState(currentUser?.name || '')
  const [saved, setSaved] = useState(false)
  const rooms = getMyRooms()

  // Calculate stats
  let totalVideos = 0
  let watchedVideos = 0
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        totalVideos++
        if (getVideoProgress(video.id) >= 90) {
          watchedVideos++
        }
      })
    })
  })

  function handleSave(e) {
    e.preventDefault()
    updateProfile({ name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout>
      <h1>Meu Perfil</h1>

      <div className="profile-layout">
        <div className="card" style={{ maxWidth: 400 }}>
          <h3>Informações Pessoais</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={currentUser?.email || ''} disabled />
            </div>

            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="form-group">
              <label>Tipo de conta</label>
              <input type="text" value={currentUser?.role === 'aluno' ? 'Aluno' : 'Professor'} disabled />
            </div>

            <button type="submit" className="btn">Salvar alterações</button>
            {saved && <span className="success-msg" style={{ marginLeft: 12 }}>✓ Salvo!</span>}
          </form>
        </div>

        <div className="card">
          <h3>📊 Resumo</h3>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-number">{rooms.length}</div>
              <div className="stat-label">Salas Matriculadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{watchedVideos}/{totalVideos}</div>
              <div className="stat-label">Aulas Concluídas</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-number">{totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0}%</div>
              <div className="stat-label">Progresso Geral</div>
            </div>
          </div>

          <h3>🏫 Minhas Matrículas</h3>
          {rooms.length === 0 ? (
            <p className="muted">Você não está matriculado em nenhuma sala.</p>
          ) : (
            <div className="enrollment-list">
              {rooms.map(room => {
                const roomTotalVideos = room.playlists.reduce((a, p) => a + p.videos.length, 0)
                let roomWatched = 0
                room.playlists.forEach(p => {
                  p.videos.forEach(v => {
                    if (getVideoProgress(v.id) >= 90) roomWatched++
                  })
                })
                const progress = roomTotalVideos > 0 ? Math.round((roomWatched / roomTotalVideos) * 100) : 0
                
                return (
                  <div key={room.id} className="enrollment-item">
                    <div>
                      <strong>{room.name}</strong>
                      <p className="muted">{room.playlists.length} playlists • {roomTotalVideos} vídeos</p>
                      <div className="progress-bar-container" style={{ marginTop: 8, width: 200 }}>
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="small">{progress}% concluído</span>
                    </div>
                    <button
                      className="btn danger"
                      onClick={() => {
                        if (confirm('Cancelar matrícula nesta sala? Seu progresso será perdido.')) {
                          unenrollStudent(room.id)
                        }
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}