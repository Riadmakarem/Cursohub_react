import React from 'react'

export default function Sidebar({ rooms = [], onSelectRoom, onCreateRoom }) {
  return (
    <aside className="sidebar">
      <h2>CursoHub</h2>
      <p style={{marginBottom:12}}>Professores: criam e gerenciam salas</p>

      <div style={{marginBottom:12}}>
        <button className="btn" onClick={onCreateRoom}>Criar Sala</button>
      </div>

      <div>
        <h3 style={{marginTop:6, marginBottom:6}}>Salas de Aula</h3>
        <div>
          {rooms.length === 0 && <div className="card">Nenhuma sala criada ainda</div>}
          {rooms.map(r => (
            <div key={r.id} className="room-item" onClick={() => onSelectRoom(r.id)}>
              {r.name}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
