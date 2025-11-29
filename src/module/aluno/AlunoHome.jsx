import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  InputAdornment,
} from '@mui/material'
import {
  VpnKey,
  PlaylistPlay,
  VideoLibrary,
  School,
  EmojiEvents,
  Public,
  PersonAdd,
} from '@mui/icons-material'

export default function AlunoHome() {
  const { getAllRooms, getMyRooms, enrollStudent, joinByCode } = useData()
  const { currentUser, getVideoProgress } = useAuth()
  const [inviteCode, setInviteCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSuccess, setCodeSuccess] = useState('')

  const allRooms = getAllRooms()
  const myRooms = getMyRooms()
  const availableRooms = allRooms.filter(r => !currentUser?.enrolledRooms?.includes(r.id))

  const roomsWithProgress = myRooms.map(room => {
    let total = 0
    let watched = 0
    room.playlists.forEach(p => {
      p.videos.forEach(v => {
        total++
        if (getVideoProgress(v.id) >= 90) watched++
      })
    })
    return {
      ...room,
      progress: total > 0 ? Math.round((watched / total) * 100) : 0,
      watched,
      total
    }
  })

  function handleJoinByCode(e) {
    e.preventDefault()
    setCodeError('')
    setCodeSuccess('')
    
    if (!inviteCode.trim()) {
      setCodeError('Digite o código de convite')
      return
    }

    const result = joinByCode(inviteCode.trim().toUpperCase())
    if (result.success) {
      setCodeSuccess(`Você foi matriculado na sala "${result.roomName}"!`)
      setInviteCode('')
    } else {
      setCodeError(result.error)
    }
  }

  return (
    <Layout>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Olá, {currentUser?.name}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Continue seus estudos de onde parou
      </Typography>

      {/* Join by Code */}
      <Card sx={{ mb: 3, maxWidth: 500 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
            Entrar com Código de Convite
          </Typography>
          
          <Box component="form" onSubmit={handleJoinByCode} sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              size="small"
              placeholder="ABC123"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              sx={{ flex: 1 }}
              inputProps={{ style: { letterSpacing: 3, fontWeight: 'bold', textTransform: 'uppercase' } }}
            />
            <Button type="submit" variant="contained">
              Entrar
            </Button>
          </Box>
          
          {codeError && <Alert severity="error" sx={{ mt: 2 }}>{codeError}</Alert>}
          {codeSuccess && <Alert severity="success" sx={{ mt: 2 }}>{codeSuccess}</Alert>}
        </CardContent>
      </Card>

      {/* My Rooms */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
            Minhas Salas
          </Typography>

          {roomsWithProgress.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Você ainda não está matriculado em nenhuma sala
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use um código de convite ou explore as salas disponíveis abaixo.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {roomsWithProgress.map(room => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {room.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {room.description || 'Sem descrição'}
                      </Typography>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip icon={<PlaylistPlay />} label={`${room.playlists.length}`} size="small" />
                        <Chip icon={<VideoLibrary />} label={`${room.total} vídeos`} size="small" />
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {room.watched}/{room.total} aulas
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {room.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={room.progress} 
                          color={room.progress === 100 ? 'success' : 'primary'}
                        />
                      </Box>

                      {room.progress === 100 && (
                        <Chip 
                          icon={<EmojiEvents />} 
                          label="Completo!" 
                          color="success" 
                          sx={{ mt: 2 }}
                        />
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        component={Link} 
                        to={`/aluno/sala/${room.id}`}
                        variant="contained"
                        fullWidth
                      >
                        Continuar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Available Rooms */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            <Public sx={{ mr: 1, verticalAlign: 'middle' }} />
            Salas Públicas Disponíveis
          </Typography>

          {availableRooms.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              Nenhuma sala disponível para matrícula no momento.
            </Typography>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {availableRooms.map(room => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {room.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {room.description || 'Sem descrição'}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip icon={<PlaylistPlay />} label={`${room.playlists.length}`} size="small" />
                        <Chip 
                          icon={<VideoLibrary />} 
                          label={`${room.playlists.reduce((a, p) => a + p.videos.length, 0)} vídeos`} 
                          size="small" 
                        />
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<PersonAdd />}
                        fullWidth
                        onClick={() => enrollStudent(room.id)}
                      >
                        Matricular-se
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Layout>
  )
}
