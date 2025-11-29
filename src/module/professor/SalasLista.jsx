import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function SalasLista() {
  const { getMyRooms, deleteRoom } = useData()
  const rooms = getMyRooms()

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Salas de Aula</h1>
        <Link to="/professor/salas/nova" className="btn">+ Nova Sala</Link>
      </div>

      {rooms.length === 0 ? (
        <div className="card empty-state">
          <p>Nenhuma sala de aula criada ainda.</p>
          <Link to="/professor/salas/nova" className="btn">Criar primeira sala</Link>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <Link to={`/professor/salas/${room.id}`}>
                <h4>{room.name}</h4>
                <p>{room.description || 'Sem descrição'}</p>
              </Link>
              <div className="room-meta">
                <span>📋 {room.playlists.length} playlists</span>
                <span>🎬 {room.playlists.reduce((a, p) => a + p.videos.length, 0)} vídeos</span>
                <span>👥 {room.enrolledStudents.length} alunos</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Link to={`/professor/salas/${room.id}`} className="btn secondary">Gerenciar</Link>
                <button className="btn danger" onClick={() => {
                  if (confirm('Excluir esta sala?')) deleteRoom(room.id)
                }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
