import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'aluno'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const result = register(formData.email, formData.password, formData.name, formData.role)
    
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
          <p>Crie sua conta</p>
        </div>

        <div className="auth-card">
          <h2>Cadastro</h2>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita a senha"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de conta</label>
              <div className="role-selector">
                <label className={`role-option ${formData.role === 'aluno' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="aluno"
                    checked={formData.role === 'aluno'}
                    onChange={handleChange}
                  />
                  <span className="role-icon">🎓</span>
                  <span className="role-label">Aluno</span>
                  <span className="role-desc">Quero estudar</span>
                </label>

                <label className={`role-option ${formData.role === 'professor' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="professor"
                    checked={formData.role === 'professor'}
                    onChange={handleChange}
                  />
                  <span className="role-icon">👨‍🏫</span>
                  <span className="role-label">Professor</span>
                  <span className="role-desc">Quero ensinar</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Já tem uma conta?</p>
            <Link to="/login" className="btn secondary btn-full">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
