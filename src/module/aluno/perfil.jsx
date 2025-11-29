import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function AlunoPerfil() {
  const { currentUser, updateProfile, getMyRooms, unenrollStudent } = useData()
  const [name, setName] = useState(currentUser.name)
  const [saved, setSaved] = useState(false)
  const rooms = getMyRooms()

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
          <h3>Informações</h3>
          <form onSubmit={handleSave}>
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
              <input type="text" value={currentUser.role === 'aluno' ? 'Aluno' : 'Professor'} disabled />
            </div>

            <button type="submit" className="btn">Salvar</button>
            {saved && <span className="success-msg" style={{ marginLeft: 12 }}>✓ Salvo!</span>}
          </form>
        </div>

        <div className="card">
          <h3>Minhas Matrículas</h3>
          {rooms.length === 0 ? (
            <p className="muted">Você não está matriculado em nenhuma sala.</p>
          ) : (
            <div className="enrollment-list">
              {rooms.map(room => (
                <div key={room.id} className="enrollment-item">
                  <div>
                    <strong>{room.name}</strong>
                    <p className="muted">{room.playlists.length} playlists • {room.playlists.reduce((a, p) => a + p.videos.length, 0)} vídeos</p>
                  </div>
                  <button
                    className="btn danger"
                    onClick={() => {
                      if (confirm('Cancelar matrícula nesta sala?')) {
                        unenrollStudent(room.id)
                      }
                    }}
                  >
                    Cancelar matrícula
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}