import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(1) // 1: request, 2: reset
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')

  function handleRequestReset(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const result = requestPasswordReset(email)
    
    if (result.success) {
      setGeneratedToken(result.token)
      setMessage('Token de recuperação gerado! Use o token abaixo para redefinir sua senha.')
      setStep(2)
    } else {
      setError(result.error)
    }
  }

  function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    const result = resetPassword(token, newPassword)
    
    if (result.success) {
      setMessage('Senha alterada com sucesso! Você já pode fazer login.')
      setStep(3)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>CursoHub</h1>
          <p>Recuperar senha</p>
        </div>

        <div className="auth-card">
          {step === 1 && (
            <>
              <h2>Esqueceu a senha?</h2>
              <p className="muted">Digite seu email para receber instruções de recuperação.</p>

              {error && <div className="alert error">{error}</div>}

              <form onSubmit={handleRequestReset}>
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

                <button type="submit" className="btn btn-full">
                  Enviar token de recuperação
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Redefinir senha</h2>
              
              {message && <div className="alert success">{message}</div>}
              {error && <div className="alert error">{error}</div>}

              {generatedToken && (
                <div className="token-display">
                  <p>Seu token de recuperação:</p>
                  <code>{generatedToken}</code>
                  <small className="muted">Em produção, este token seria enviado por email.</small>
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>Token de recuperação</label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Cole o token aqui"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nova senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-full">
                  Redefinir senha
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="success-state">
                <span className="success-icon">✅</span>
                <h2>Senha alterada!</h2>
                <p>Sua senha foi redefinida com sucesso.</p>
              </div>
            </>
          )}

          <div className="auth-footer">
            <Link to="/login" className="btn secondary btn-full">
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
