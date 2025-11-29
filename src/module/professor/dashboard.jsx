import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

export default function ProfessorDashboard() {
  const { getMyRooms, getRoomStats } = useData()
  const { currentUser } = useAuth()
  const rooms = getMyRooms()

  const totalPlaylists = rooms.reduce((acc, r) => acc + r.playlists.length, 0)
  const totalVideos = rooms.reduce((acc, r) =>
    acc + r.playlists.reduce((a2, p) => a2 + p.videos.length, 0), 0)
  const totalStudents = rooms.reduce((acc, r) => acc + (r.enrolledStudents?.length || 0), 0)

  // Get pending questions
  const pendingQuestions = rooms.reduce((acc, r) => {
    const stats = getRoomStats(r.id)
    return acc + (stats?.unresolvedQuestions || 0)
  }, 0)

  return (
    <Layout>
      <h1>Olá, {currentUser?.name}! 👋</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{rooms.length}</div>
          <div className="stat-label">Salas de Aula</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalPlaylists}</div>
          <div className="stat-label">Playlists</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalVideos}</div>
          <div className="stat-label">Videoaulas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalStudents}</div>
          <div className="stat-label">Alunos Matriculados</div>
        </div>
      </div>

      {/* Pending Questions Alert */}
      {pendingQuestions > 0 && (
        <div className="alert" style={{ background: '#fff3cd', color: '#856404', marginTop: 16 }}>
          ❓ Você tem <strong>{pendingQuestions}</strong> dúvida(s) não respondida(s) dos alunos.
        </div>
      )}

      <section className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Minhas Salas</h3>
          <Link to="/professor/salas/nova" className="btn">+ Criar Sala</Link>
        </div>

        {rooms.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não criou nenhuma sala de aula.</p>
            <Link to="/professor/salas/nova" className="btn">Criar sua primeira sala</Link>
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map(room => {
              const stats = getRoomStats(room.id)
              return (
                <div key={room.id} className="room-card">
                  <Link to={`/professor/salas/${room.id}`}>
                    <h4>{room.name}</h4>
                    <p>{room.description || 'Sem descrição'}</p>
                  </Link>
                  <div className="room-meta">
                    <span>📋 {room.playlists.length} playlists</span>
                    <span>👥 {room.enrolledStudents?.length || 0} alunos</span>
                    {stats?.unresolvedQuestions > 0 && (
                      <span className="questions-badge">❓ {stats.unresolvedQuestions}</span>
                    )}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Link to={`/professor/salas/${room.id}`} className="btn btn-sm secondary">Gerenciar</Link>
                    <Link to={`/professor/salas/${room.id}/alunos`} className="btn btn-sm secondary">Alunos</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="card" style={{ marginTop: 24 }}>
        <h3>Ações Rápidas</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/professor/salas/nova" className="btn">🏫 Nova Sala</Link>
          <Link to="/professor/estatisticas" className="btn secondary">📈 Ver Estatísticas</Link>
          <Link to="/professor/turmas" className="btn secondary">👥 Gerenciar Turmas</Link>
        </div>
      </section>
    </Layout>
  )
}
