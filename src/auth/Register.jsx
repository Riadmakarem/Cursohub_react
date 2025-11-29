import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material'
import {
  School,
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'

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
  const [showPassword, setShowPassword] = useState(false)
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
            Crie sua conta
          </Typography>
        </Box>

        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600} textAlign="center">
              Cadastro
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nome completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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

              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                margin="normal"
                helperText="Mínimo 6 caracteres"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar senha"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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

              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Tipo de conta
              </Typography>

              <ToggleButtonGroup
                value={formData.role}
                exclusive
                onChange={(e, value) => value && setFormData(prev => ({ ...prev, role: value }))}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="aluno" sx={{ py: 2, flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '2rem' }}>🎓</Typography>
                  <Typography fontWeight={600}>Aluno</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quero estudar
                  </Typography>
                </ToggleButton>
                <ToggleButton value="professor" sx={{ py: 2, flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '2rem' }}>👨‍🏫</Typography>
                  <Typography fontWeight={600}>Professor</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quero ensinar
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Já tem uma conta?
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
              >
                Fazer login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
