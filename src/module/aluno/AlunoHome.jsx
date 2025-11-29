import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function AlunoHome() {
  const { getAllRooms, getMyRooms, currentUser, enrollStudent } = useData()
  const allRooms = getAllRooms()
  const myRooms = getMyRooms()

  const availableRooms = allRooms.filter(r => !currentUser.enrolledRooms.includes(r.id))

  return (
    <Layout>
      <h1>Bem-vindo, {currentUser.name}!</h1>

      <section className="card" style={{ marginBottom: 24 }}>
        <h3>Minhas Salas</h3>
        {myRooms.length === 0 ? (
          <p className="muted">Você ainda não está matriculado em nenhuma sala.</p>
        ) : (
          <div className="room-grid">
            {myRooms.map(room => (
              <Link key={room.id} to={`/aluno/sala/${room.id}`} className="room-card">
                <h4>{room.name}</h4>
                <p>{room.description || 'Sem descrição'}</p>
                <div className="room-meta">
                  <span>📋 {room.playlists.length} playlists</span>
                  <span>🎬 {room.playlists.reduce((a, p) => a + p.videos.length, 0)} vídeos</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3>Salas Disponíveis</h3>
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
