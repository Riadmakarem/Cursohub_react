import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import './index.css'

// Professor
import ProfessorDashboard from './module/professor/dashboard'
import SalasLista from './module/professor/SalasLista'
import SalaNova from './module/professor/SalaNova'
import SalaDetalhe from './module/professor/SalaDetalhe'
import Turmas from './module/professor/turmas'
import Materiais from './module/professor/materiais'

// Aluno
import AlunoHome from './module/aluno/AlunoHome'
import AlunoSala from './module/aluno/AlunoSala'
import AlunoAulas from './module/aluno/aulas'
import AlunoPerfil from './module/aluno/perfil'

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to professor dashboard */}
          <Route path="/" element={<Navigate to="/professor" replace />} />

          {/* Professor routes */}
          <Route path="/professor" element={<ProfessorDashboard />} />
          <Route path="/professor/salas" element={<SalasLista />} />
          <Route path="/professor/salas/nova" element={<SalaNova />} />
          <Route path="/professor/salas/:id" element={<SalaDetalhe />} />
          <Route path="/professor/turmas" element={<Turmas />} />
          <Route path="/professor/materiais" element={<Materiais />} />

          {/* Aluno routes */}
          <Route path="/aluno" element={<AlunoHome />} />
          <Route path="/aluno/sala/:id" element={<AlunoSala />} />
          <Route path="/aluno/aulas" element={<AlunoAulas />} />
          <Route path="/aluno/perfil" element={<AlunoPerfil />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}

export default App
