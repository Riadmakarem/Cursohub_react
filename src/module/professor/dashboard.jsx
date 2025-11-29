import React from 'react'
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
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import {
  School,
  PlaylistPlay,
  VideoLibrary,
  People,
  Add,
  BarChart,
  Groups,
  QuestionAnswer,
  Settings,
} from '@mui/icons-material'

export default function ProfessorDashboard() {
  const { getMyRooms, getRoomStats } = useData()
  const { currentUser } = useAuth()
  const rooms = getMyRooms()

  const totalPlaylists = rooms.reduce((acc, r) => acc + r.playlists.length, 0)
  const totalVideos = rooms.reduce((acc, r) =>
    acc + r.playlists.reduce((a2, p) => a2 + p.videos.length, 0), 0)
  const totalStudents = rooms.reduce((acc, r) => acc + (r.enrolledStudents?.length || 0), 0)

  const pendingQuestions = rooms.reduce((acc, r) => {
    const stats = getRoomStats(r.id)
    return acc + (stats?.unresolvedQuestions || 0)
  }, 0)

  const stats = [
    { icon: <School sx={{ fontSize: 40 }} />, value: rooms.length, label: 'Salas de Aula', color: '#08311a' },
    { icon: <PlaylistPlay sx={{ fontSize: 40 }} />, value: totalPlaylists, label: 'Playlists', color: '#1a5c35' },
    { icon: <VideoLibrary sx={{ fontSize: 40 }} />, value: totalVideos, label: 'Videoaulas', color: '#2d7a4a' },
    { icon: <People sx={{ fontSize: 40 }} />, value: totalStudents, label: 'Alunos', color: '#48a066' },
  ]

  return (
    <Layout>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Olá, {currentUser?.name}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo ao seu painel de controle
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 6, md: 3 }} key={index}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                {stat.icon}
                <Typography variant="h3" fontWeight={700} sx={{ my: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pending Questions Alert */}
      {pendingQuestions > 0 && (
        <Alert 
          severity="warning" 
          icon={<QuestionAnswer />}
          sx={{ mb: 3 }}
        >
          Você tem <strong>{pendingQuestions}</strong> dúvida(s) não respondida(s) dos alunos.
        </Alert>
      )}

      {/* My Rooms */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Minhas Salas
            </Typography>
            <Button
              component={Link}
              to="/professor/salas/nova"
              variant="contained"
              startIcon={<Add />}
            >
              Criar Sala
            </Button>
          </Box>

          {rooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Você ainda não criou nenhuma sala
              </Typography>
              <Button
                component={Link}
                to="/professor/salas/nova"
                variant="contained"
                startIcon={<Add />}
                sx={{ mt: 2 }}
              >
                Criar sua primeira sala
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rooms.map(room => {
                const stats = getRoomStats(room.id)
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {room.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {room.description || 'Sem descrição'}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip icon={<PlaylistPlay />} label={`${room.playlists.length} playlists`} size="small" />
                          <Chip icon={<People />} label={`${room.enrolledStudents?.length || 0} alunos`} size="small" />
                          {stats?.unresolvedQuestions > 0 && (
                            <Chip 
                              icon={<QuestionAnswer />} 
                              label={`${stats.unresolvedQuestions} dúvidas`} 
                              size="small" 
                              color="warning"
                            />
                          )}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button 
                          component={Link} 
                          to={`/professor/salas/${room.id}`}
                          size="small"
                          startIcon={<Settings />}
                        >
                          Gerenciar
                        </Button>
                        <Button 
                          component={Link} 
                          to={`/professor/salas/${room.id}/alunos`}
                          size="small"
                          startIcon={<People />}
                        >
                          Alunos
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Ações Rápidas
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              component={Link}
              to="/professor/salas/nova"
              variant="contained"
              startIcon={<School />}
            >
              Nova Sala
            </Button>
            <Button
              component={Link}
              to="/professor/estatisticas"
              variant="outlined"
              startIcon={<BarChart />}
            >
              Ver Estatísticas
            </Button>
            <Button
              component={Link}
              to="/professor/turmas"
              variant="outlined"
              startIcon={<Groups />}
            >
              Gerenciar Turmas
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Layout>
  )
}
