import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function SalaNova() {
  const { createRoom } = useData()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const room = createRoom(name.trim(), description.trim())
    navigate(`/professor/salas/${room.id}`)
  }

  return (
    <Layout>
      <h1>Criar Nova Sala</h1>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Sala *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Matemática - 3º Ano"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo desta sala..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="submit" className="btn">Criar Sala</button>
            <button type="button" className="btn secondary" onClick={() => navigate(-1)}>Cancelar</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
