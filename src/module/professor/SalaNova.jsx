import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button
} from '@mui/material'
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  School as SchoolIcon
} from '@mui/icons-material'

export default function SalaNova() {
  const { createRoom } = useData()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const room = createRoom(name.trim(), description.trim())
    navigate(`/professor/salas/${room.id}`)
  }

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon />
        Criar Nova Sala
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome da Sala"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Matemática - 3º Ano"
            required
            margin="normal"
            helperText="Escolha um nome descritivo para sua sala de aula"
          />

          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descreva o conteúdo desta sala..."
            multiline
            rows={4}
            margin="normal"
            helperText="Opcional - Descreva o que os alunos irão aprender nesta sala"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              size="large"
            >
              Criar Sala
            </Button>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Layout>
  )
}
