import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function Layout({ children }) {
  const { currentUser, switchRole } = useData()
  const navigate = useNavigate()
  const isProfessor = currentUser.role === 'professor'

  function handleSwitch() {
    const newRole = isProfessor ? 'aluno' : 'professor'
    switchRole(newRole)
    navigate(newRole === 'professor' ? '/professor' : '/aluno')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>CursoHub</h2>
        <div className="user-info">
          <span className="user-badge">{isProfessor ? '👨‍🏫' : '🎓'}</span>
          <span>{currentUser.name}</span>
        </div>
        <button className="btn secondary" style={{ marginTop: 8, width: '100%' }} onClick={handleSwitch}>
          Trocar para {isProfessor ? 'Aluno' : 'Professor'}
        </button>

        <nav className="nav-menu">
          {isProfessor ? (
            <>
              <NavLink to="/professor" end>📊 Dashboard</NavLink>
              <NavLink to="/professor/salas">🏫 Salas de Aula</NavLink>
              <NavLink to="/professor/turmas">👥 Turmas</NavLink>
              <NavLink to="/professor/materiais">📚 Materiais</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/aluno">🏠 Início</NavLink>
              <NavLink to="/aluno/aulas">🎬 Minhas Aulas</NavLink>
              <NavLink to="/aluno/perfil">👤 Perfil</NavLink>
            </>
          )}
        </nav>
      </aside>

      <main className="main">
        {children}
      </main>
    </div>
  )
}
