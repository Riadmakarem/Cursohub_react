import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

export default function AlunoHome() {
  const { getAllRooms, getMyRooms, enrollStudent, joinByCode } = useData()
  const { currentUser, getVideoProgress } = useAuth()
  const [inviteCode, setInviteCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSuccess, setCodeSuccess] = useState('')

  const allRooms = getAllRooms()
  const myRooms = getMyRooms()
  const availableRooms = allRooms.filter(r => !currentUser?.enrolledRooms?.includes(r.id))

  // Calculate progress for my rooms
  const roomsWithProgress = myRooms.map(room => {
    let total = 0
    let watched = 0
    room.playlists.forEach(p => {
      p.videos.forEach(v => {
        total++
        if (getVideoProgress(v.id) >= 90) watched++
      })
    })
    return {
      ...room,
      progress: total > 0 ? Math.round((watched / total) * 100) : 0,
      watched,
      total
    }
  })

  function handleJoinByCode(e) {
    e.preventDefault()
    setCodeError('')
    setCodeSuccess('')
    
    if (!inviteCode.trim()) {
      setCodeError('Digite o código de convite')
      return
    }

    const result = joinByCode(inviteCode.trim().toUpperCase())
    if (result.success) {
      setCodeSuccess(`Você foi matriculado na sala "${result.roomName}"!`)
      setInviteCode('')
    } else {
      setCodeError(result.error)
    }
  }

  return (
    <Layout>
      <h1>Olá, {currentUser?.name}! 👋</h1>

      {/* Join by Code */}
      <section className="card" style={{ marginBottom: 24, maxWidth: 500 }}>
        <h3>🔑 Entrar com Código de Convite</h3>
        <form onSubmit={handleJoinByCode}>
          <div className="form-row">
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Digite o código (ex: ABC123)"
              style={{ letterSpacing: 2, fontWeight: 'bold' }}
            />
            <button type="submit" className="btn">Entrar</button>
          </div>
          {codeError && <p style={{ color: '#dc3545', marginTop: 8 }}>{codeError}</p>}
          {codeSuccess && <p style={{ color: '#28a745', marginTop: 8 }}>{codeSuccess}</p>}
        </form>
      </section>

      <section className="card" style={{ marginBottom: 24 }}>
        <h3>🎓 Minhas Salas</h3>
        {roomsWithProgress.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não está matriculado em nenhuma sala.</p>
            <p className="muted">Use um código de convite ou explore as salas disponíveis abaixo.</p>
          </div>
        ) : (
          <div className="room-grid">
            {roomsWithProgress.map(room => (
              <Link key={room.id} to={`/aluno/sala/${room.id}`} className="room-card">
                <h4>{room.name}</h4>
                <p>{room.description || 'Sem descrição'}</p>
                <div className="room-meta">
                  <span>📋 {room.playlists.length} playlists</span>
                  <span>🎬 {room.total} vídeos</span>
                </div>
                <div className="progress-bar-container" style={{ marginTop: 12 }}>
                  <div className="progress-bar" style={{ width: `${room.progress}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="small">{room.watched}/{room.total} aulas</span>
                  <span className="small">{room.progress}%</span>
                </div>
                {room.progress === 100 && <div className="completion-badge" style={{ marginTop: 8 }}>🏆 Completo!</div>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3>🌐 Salas Públicas Disponíveis</h3>
        {availableRooms.length === 0 ? (
          <p className="muted">Nenhuma sala disponível para matrícula no momento.</p>
        ) : (
          <div className="room-grid">
            {availableRooms.map(room => (
              <div key={room.id} className="room-card">
                <h4>{room.name}</h4>
                <p>{room.description || 'Sem descrição'}</p>
                <div className="room-meta">
                  <span>📋 {room.playlists.length} playlists</span>
                  <span>🎬 {room.playlists.reduce((a, p) => a + p.videos.length, 0)} vídeos</span>
                </div>
                <button className="btn" style={{ marginTop: 12 }} onClick={() => enrollStudent(room.id)}>
                  Matricular-se
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
