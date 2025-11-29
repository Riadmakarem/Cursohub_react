import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function ProfessorDashboard() {
  const { getMyRooms } = useData()
  const rooms = getMyRooms()

  const totalPlaylists = rooms.reduce((acc, r) => acc + r.playlists.length, 0)
  const totalVideos = rooms.reduce((acc, r) =>
    acc + r.playlists.reduce((a2, p) => a2 + p.videos.length, 0), 0)
  const totalStudents = rooms.reduce((acc, r) => acc + r.enrolledStudents.length, 0)

  return (
    <Layout>
      <h1>Dashboard Principal</h1>

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
            {rooms.map(room => (
              <Link key={room.id} to={`/professor/salas/${room.id}`} className="room-card">
                <h4>{room.name}</h4>
                <p>{room.description || 'Sem descrição'}</p>
                <div className="room-meta">
                  <span>📋 {room.playlists.length} playlists</span>
                  <span>👥 {room.enrolledStudents.length} alunos</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
