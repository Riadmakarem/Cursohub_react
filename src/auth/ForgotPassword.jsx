import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { School, Email, Lock, VpnKey, CheckCircle } from '@mui/icons-material'

export default function ForgotPassword() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(0) // 0: request, 1: reset, 2: success
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')

  const steps = ['Solicitar token', 'Redefinir senha', 'Concluído']

  function handleRequestReset(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const result = requestPasswordReset(email)
    
    if (result.success) {
      setGeneratedToken(result.token)
      setMessage('Token de recuperação gerado! Use o token abaixo para redefinir sua senha.')
      setStep(1)
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
      setMessage('Senha alterada com sucesso!')
      setStep(2)
    } else {
      setError(result.error)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #08311a 0%, #1a5c35 50%, #aadead 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <School sx={{ fontSize: 64, color: 'white', mb: 2 }} />
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
            CursoHub
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Recuperar senha
          </Typography>
        </Box>

        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {step === 0 && (
              <>
                <Typography variant="h5" gutterBottom fontWeight={600} textAlign="center">
                  Esqueceu a senha?
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                  Digite seu email para receber instruções de recuperação.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleRequestReset}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Enviar token de recuperação
                  </Button>
                </Box>
              </>
            )}

            {step === 1 && (
              <>
                <Typography variant="h5" gutterBottom fontWeight={600} textAlign="center">
                  Redefinir senha
                </Typography>
                
                {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {generatedToken && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: 'secondary.light', textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>
                      Seu token de recuperação:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'white',
                        p: 1,
                        borderRadius: 1,
                        letterSpacing: 2,
                      }}
                    >
                      {generatedToken}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Em produção, este token seria enviado por email.
                    </Typography>
                  </Paper>
                )}

                <Box component="form" onSubmit={handleResetPassword}>
                  <TextField
                    fullWidth
                    label="Token de recuperação"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Nova senha"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    margin="normal"
                    helperText="Mínimo 6 caracteres"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirmar nova senha"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Redefinir senha
                  </Button>
                </Box>
              </>
            )}

            {step === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Senha alterada!
                </Typography>
                <Typography color="text.secondary">
                  Sua senha foi redefinida com sucesso.
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
              >
                Voltar para login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
