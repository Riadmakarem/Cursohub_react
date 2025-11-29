import React from 'react'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'

export default function Turmas() {
  const { getMyRooms } = useData()
  const rooms = getMyRooms()

  return (
    <Layout>
      <h1>Gestão de Turmas</h1>

      <div className="card">
        <p>Visualize os alunos matriculados em cada sala.</p>
      </div>

      {rooms.length === 0 ? (
        <div className="card empty-state" style={{ marginTop: 16 }}>
          <p>Nenhuma sala criada ainda.</p>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {rooms.map(room => (
            <div key={room.id} className="card" style={{ marginBottom: 16 }}>
              <h3>{room.name}</h3>
              <div className="turma-info">
                <span>👥 {room.enrolledStudents.length} alunos matriculados</span>
              </div>

              {room.enrolledStudents.length === 0 ? (
                <p className="muted">Nenhum aluno matriculado nesta sala ainda.</p>
              ) : (
                <div className="students-list">
                  {room.enrolledStudents.map((studentId, index) => (
                    <div key={studentId} className="student-item">
                      <span className="student-avatar">🎓</span>
                      <span>Aluno {index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
