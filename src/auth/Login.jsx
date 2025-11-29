import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = login(email, password)
    
    if (result.success) {
      navigate(result.user.role === 'professor' ? '/professor' : '/aluno')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>CursoHub</h1>
          <p>Plataforma de videoaulas</p>
        </div>

        <div className="auth-card">
          <h2>Entrar</h2>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Link to="/recuperar-senha" className="forgot-link">
              Esqueceu a senha?
            </Link>

            <button type="submit" className="btn btn-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Não tem uma conta?</p>
            <Link to="/registro" className="btn secondary btn-full">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
