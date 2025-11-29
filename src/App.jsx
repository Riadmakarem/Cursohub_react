import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import './index.css'

// Auth
import Login from './auth/Login'
import Register from './auth/Register'
import ForgotPassword from './auth/ForgotPassword'

// Professor
import ProfessorDashboard from './module/professor/dashboard'
import SalasLista from './module/professor/SalasLista'
import SalaNova from './module/professor/SalaNova'
import SalaDetalhe from './module/professor/SalaDetalhe'
import Turmas from './module/professor/turmas'
import Materiais from './module/professor/materiais'
import GerenciarAlunos from './module/professor/GerenciarAlunos'
import Estatisticas from './module/professor/Estatisticas'

// Aluno
import AlunoHome from './module/aluno/AlunoHome'
import AlunoSala from './module/aluno/AlunoSala'
import AlunoAulas from './module/aluno/aulas'
import AlunoPerfil from './module/aluno/perfil'
import AlunoProgresso from './module/aluno/Progresso'

// Protected Route wrapper
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, currentUser } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to={currentUser?.role === 'professor' ? '/professor' : '/aluno'} replace />
  }

  return children
}

// Public Route (redirect if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={currentUser?.role === 'professor' ? '/professor' : '/aluno'} replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/registro" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/recuperar-senha" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Professor routes */}
      <Route path="/professor" element={<ProtectedRoute requiredRole="professor"><ProfessorDashboard /></ProtectedRoute>} />
      <Route path="/professor/salas" element={<ProtectedRoute requiredRole="professor"><SalasLista /></ProtectedRoute>} />
      <Route path="/professor/salas/nova" element={<ProtectedRoute requiredRole="professor"><SalaNova /></ProtectedRoute>} />
      <Route path="/professor/salas/:id" element={<ProtectedRoute requiredRole="professor"><SalaDetalhe /></ProtectedRoute>} />
      <Route path="/professor/salas/:id/alunos" element={<ProtectedRoute requiredRole="professor"><GerenciarAlunos /></ProtectedRoute>} />
      <Route path="/professor/turmas" element={<ProtectedRoute requiredRole="professor"><Turmas /></ProtectedRoute>} />
      <Route path="/professor/materiais" element={<ProtectedRoute requiredRole="professor"><Materiais /></ProtectedRoute>} />
      <Route path="/professor/estatisticas" element={<ProtectedRoute requiredRole="professor"><Estatisticas /></ProtectedRoute>} />

      {/* Aluno routes */}
      <Route path="/aluno" element={<ProtectedRoute requiredRole="aluno"><AlunoHome /></ProtectedRoute>} />
      <Route path="/aluno/sala/:id" element={<ProtectedRoute requiredRole="aluno"><AlunoSala /></ProtectedRoute>} />
      <Route path="/aluno/aulas" element={<ProtectedRoute requiredRole="aluno"><AlunoAulas /></ProtectedRoute>} />
      <Route path="/aluno/perfil" element={<ProtectedRoute requiredRole="aluno"><AlunoPerfil /></ProtectedRoute>} />
      <Route path="/aluno/progresso" element={<ProtectedRoute requiredRole="aluno"><AlunoProgresso /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
