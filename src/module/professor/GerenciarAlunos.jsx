import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

export default function GerenciarAlunos() {
  const { id } = useParams()
  const { getRoom, getRoomStudents, removeStudentFromRoom, addStudentToRoom, regenerateInviteCode } = useData()
  const { getAllStudents } = useAuth()
  const room = getRoom(id)
  const students = getRoomStudents(id)
  const allStudents = getAllStudents()

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  if (!room) {
    return (
      <Layout>
        <div className="card">
          <p>Sala não encontrada.</p>
          <Link to="/professor/salas" className="btn">Voltar</Link>
        </div>
      </Layout>
    )
  }

  const availableStudents = allStudents.filter(
    s => !room.enrolledStudents.includes(s.id) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  function handleRemoveStudent(studentId) {
    if (confirm('Remover este aluno da sala?')) {
      removeStudentFromRoom(room.id, studentId)
    }
  }

  function handleAddStudent(studentId) {
    addStudentToRoom(room.id, studentId)
    setShowAddModal(false)
    setSearchTerm('')
  }

  function handleRegenerateCode() {
    if (confirm('Gerar novo código? O código atual deixará de funcionar.')) {
      regenerateInviteCode(room.id)
    }
  }

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/professor/salas">Salas</Link> / 
        <Link to={`/professor/salas/${room.id}`}>{room.name}</Link> / 
        <span>Gerenciar Alunos</span>
      </div>

      <h1>Gerenciar Alunos</h1>
      <p className="muted">Sala: {room.name}</p>

      {/* Invite Code Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Código de Convite</h3>
        <p className="muted">Compartilhe este código com seus alunos para que eles possam se matricular.</p>
        
        <div className="invite-code-display">
          <code className="invite-code">{room.inviteCode}</code>
          <button 
            className="btn secondary" 
            onClick={() => navigator.clipboard.writeText(room.inviteCode)}
          >
            📋 Copiar
          </button>
          <button className="btn secondary" onClick={handleRegenerateCode}>
            🔄 Gerar novo
          </button>
        </div>
      </div>

      {/* Add Student */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Alunos Matriculados ({students.length})</h3>
          <button className="btn" onClick={() => setShowAddModal(true)}>
            + Adicionar Aluno
          </button>
        </div>

        {students.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum aluno matriculado ainda.</p>
            <p className="muted">Compartilhe o código de convite ou adicione alunos manualmente.</p>
          </div>
        ) : (
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Email</th>
                  <th>Matriculado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <span className="student-avatar">{student.avatar || '🎓'}</span>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button 
                        className="btn danger btn-sm"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Aluno</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {availableStudents.length === 0 ? (
                <p className="muted">Nenhum aluno disponível para adicionar.</p>
              ) : (
                <div className="student-list-modal">
                  {availableStudents.slice(0, 10).map(student => (
                    <div key={student.id} className="student-list-item">
                      <div className="student-info">
                        <span className="student-avatar">{student.avatar || '🎓'}</span>
                        <div>
                          <strong>{student.name}</strong>
                          <p className="muted">{student.email}</p>
                        </div>
                      </div>
                      <button 
                        className="btn btn-sm"
                        onClick={() => handleAddStudent(student.id)}
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
