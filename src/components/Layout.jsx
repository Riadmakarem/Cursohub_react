import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { currentUser, logout, getMyNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  
  const isProfessor = currentUser?.role === 'professor'
  const notifications = getMyNotifications()
  const unreadCount = getUnreadCount()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNotificationClick(notification) {
    markNotificationRead(notification.id)
    setShowNotifications(false)
    
    // Navigate based on notification type
    if (notification.roomId) {
      if (isProfessor) {
        navigate(`/professor/salas/${notification.roomId}`)
      } else {
        navigate(`/aluno/sala/${notification.roomId}`)
      }
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>CursoHub</h2>
        <div className="user-info">
          <span className="user-badge">{currentUser?.avatar || (isProfessor ? '👨‍🏫' : '🎓')}</span>
          <div className="user-details">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{isProfessor ? 'Professor' : 'Aluno'}</span>
          </div>
        </div>

        <nav className="nav-menu">
          {isProfessor ? (
            <>
              <NavLink to="/professor" end>📊 Dashboard</NavLink>
              <NavLink to="/professor/salas">🏫 Salas de Aula</NavLink>
              <NavLink to="/professor/turmas">👥 Turmas</NavLink>
              <NavLink to="/professor/materiais">📚 Materiais</NavLink>
              <NavLink to="/professor/estatisticas">📈 Estatísticas</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/aluno" end>🏠 Início</NavLink>
              <NavLink to="/aluno/aulas">🎬 Minhas Aulas</NavLink>
              <NavLink to="/aluno/progresso">📊 Meu Progresso</NavLink>
              <NavLink to="/aluno/perfil">👤 Perfil</NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="btn secondary btn-full" onClick={handleLogout}>
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className="main">
        {/* Header with notifications */}
        <header className="main-header">
          <div className="header-spacer"></div>
          <div className="header-actions">
            <div className="notification-wrapper">
              <button 
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notificações</h4>
                    {unreadCount > 0 && (
                      <button className="btn-link" onClick={markAllNotificationsRead}>
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">Nenhuma notificação</div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div 
                          key={n.id} 
                          className={`notification-item ${n.read ? '' : 'unread'}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notification-icon">
                            {n.type === 'new_video' && '🎬'}
                            {n.type === 'new_playlist' && '📁'}
                            {n.type === 'new_question' && '❓'}
                            {n.type === 'comment_reply' && '💬'}
                            {n.type === 'enrolled' && '✅'}
                            {n.type === 'welcome' && '👋'}
                          </div>
                          <div className="notification-content">
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  )
}
