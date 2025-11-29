import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  PlaylistPlay as PlaylistIcon,
  VideoLibrary as VideoIcon,
  TrendingUp as TrendingUpIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material'

export default function AlunoPerfil() {
  const { getMyRooms, unenrollStudent } = useData()
  const { currentUser, updateProfile, getVideoProgress } = useAuth()
  const [name, setName] = useState(currentUser?.name || '')
  const [saved, setSaved] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, roomId: null, roomName: '' })
  const rooms = getMyRooms()

  // Calculate stats
  let totalVideos = 0
  let watchedVideos = 0
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        totalVideos++
        if (getVideoProgress(video.id) >= 90) {
          watchedVideos++
        }
      })
    })
  })

  const overallProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0

  function handleSave(e) {
    e.preventDefault()
    updateProfile({ name: name.trim() })
    setSaved(true)
  }

  function handleUnenroll() {
    unenrollStudent(confirmDialog.roomId)
    setConfirmDialog({ open: false, roomId: null, roomName: '' })
  }

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Info Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mr: 2 }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h6">{currentUser?.name || 'Aluno'}</Typography>
                <Chip label="Aluno" color="secondary" size="small" />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informações Pessoais
            </Typography>

            <Box component="form" onSubmit={handleSave}>
              <TextField
                fullWidth
                label="Email"
                value={currentUser?.email || ''}
                disabled
                margin="normal"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <TextField
                fullWidth
                label="Nome"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                margin="normal"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <TextField
                fullWidth
                label="Tipo de Conta"
                value="Aluno"
                disabled
                margin="normal"
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
              >
                Salvar Alterações
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Stats and Enrollments */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {rooms.length}
                  </Typography>
                  <Typography variant="body2">
                    Salas Matriculadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VideoIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {watchedVideos}/{totalVideos}
                  </Typography>
                  <Typography variant="body2">
                    Aulas Concluídas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {overallProgress}%
                  </Typography>
                  <Typography variant="body2">
                    Progresso Geral
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Enrollments */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏫 Minhas Matrículas
            </Typography>

            {rooms.length === 0 ? (
              <Alert severity="info">
                Você não está matriculado em nenhuma sala.
              </Alert>
            ) : (
              <List>
                {rooms.map((room, index) => {
                  const roomTotalVideos = room.playlists.reduce((a, p) => a + p.videos.length, 0)
                  let roomWatched = 0
                  room.playlists.forEach(p => {
                    p.videos.forEach(v => {
                      if (getVideoProgress(v.id) >= 90) roomWatched++
                    })
                  })
                  const progress = roomTotalVideos > 0 ? Math.round((roomWatched / roomTotalVideos) * 100) : 0
                  
                  return (
                    <React.Fragment key={room.id}>
                      {index > 0 && <Divider />}
                      <ListItem sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Typography fontWeight="bold">{room.name}</Typography>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', gap: 2, mb: 1, mt: 0.5 }}>
                                <Chip
                                  icon={<PlaylistIcon />}
                                  label={`${room.playlists.length} playlists`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<VideoIcon />}
                                  label={`${roomTotalVideos} vídeos`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 50 }}>
                                  {progress}%
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            startIcon={<ExitIcon />}
                            onClick={() => setConfirmDialog({ open: true, roomId: room.id, roomName: room.name })}
                          >
                            Cancelar
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  )
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, roomId: null, roomName: '' })}>
        <DialogTitle>Cancelar Matrícula</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja cancelar sua matrícula em <strong>{confirmDialog.roomName}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Seu progresso será perdido!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, roomId: null, roomName: '' })}>
            Voltar
          </Button>
          <Button color="error" variant="contained" onClick={handleUnenroll}>
            Cancelar Matrícula
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={saved}
        autoHideDuration={2000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSaved(false)}>
          Alterações salvas com sucesso!
        </Alert>
      </Snackbar>
    </Layout>
  )
}