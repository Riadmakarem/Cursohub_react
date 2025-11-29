import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  PlayCircle as PlayIcon,
  EmojiEvents as TrophyIcon,
  History as HistoryIcon
} from '@mui/icons-material'

export default function AlunoProgresso() {
  const { getMyRooms } = useData()
  const { currentUser, isVideoWatched, getVideoProgress } = useAuth()
  const rooms = getMyRooms()

  // Calculate overall stats
  let totalVideos = 0
  let watchedVideos = 0

  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        totalVideos++
        if (isVideoWatched(video.id)) {
          watchedVideos++
        }
      })
    })
  })

  const overallProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0

  // Calculate progress per room
  const roomProgress = rooms.map(room => {
    let roomTotal = 0
    let roomWatched = 0
    let continueFrom = null

    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        roomTotal++
        const progress = getVideoProgress(video.id)
        if (progress >= 90) {
          roomWatched++
        } else if (progress > 0 && !continueFrom) {
          continueFrom = { video, playlist, room, progress }
        }
      })
    })

    return {
      ...room,
      totalVideos: roomTotal,
      watchedVideos: roomWatched,
      progress: roomTotal > 0 ? Math.round((roomWatched / roomTotal) * 100) : 0,
      continueFrom
    }
  })

  // Get videos in progress
  const inProgress = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        const progress = getVideoProgress(video.id)
        if (progress > 0 && progress < 90) {
          inProgress.push({
            ...video,
            roomId: room.id,
            roomName: room.name,
            playlistName: playlist.name,
            progress
          })
        }
      })
    })
  })

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Meu Progresso
      </Typography>

      {/* Overall Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 36 }} />
              <Typography variant="h3" fontWeight="bold">
                {overallProgress}%
              </Typography>
              <Typography variant="body2">
                Progresso Geral
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 36 }} />
              <Typography variant="h3" fontWeight="bold">
                {watchedVideos}/{totalVideos}
              </Typography>
              <Typography variant="body2">
                Aulas Concluídas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 36 }} />
              <Typography variant="h3" fontWeight="bold">
                {rooms.length}
              </Typography>
              <Typography variant="body2">
                Salas Matriculadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayIcon sx={{ fontSize: 36 }} />
              <Typography variant="h3" fontWeight="bold">
                {inProgress.length}
              </Typography>
              <Typography variant="body2">
                Em Andamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Continue Watching */}
      {inProgress.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayIcon color="primary" />
            Continuar Assistindo
          </Typography>
          <Grid container spacing={2}>
            {inProgress.slice(0, 4).map(video => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={video.id}>
                <Card>
                  <CardActionArea component={Link} to={`/aluno/sala/${video.roomId}`}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {video.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {video.roomName} • {video.playlistName}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Progresso</Typography>
                          <Typography variant="caption">{video.progress}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={video.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                          color="warning"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Progress by Room */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          📊 Progresso por Sala
        </Typography>

        {roomProgress.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Você ainda não está matriculado em nenhuma sala
            </Typography>
            <Button
              component={Link}
              to="/aluno"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Explorar Salas
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {roomProgress.map(room => (
              <Grid size={{ xs: 12, md: 6 }} key={room.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/aluno/sala/${room.id}`}
                        sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
                      >
                        {room.name}
                      </Typography>
                      <Chip
                        label={`${room.progress}%`}
                        color={room.progress === 100 ? 'success' : room.progress > 0 ? 'primary' : 'default'}
                      />
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={room.progress}
                      sx={{ height: 10, borderRadius: 5, mb: 2 }}
                      color={room.progress === 100 ? 'success' : 'primary'}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={<CheckIcon />}
                        label={`${room.watchedVideos} de ${room.totalVideos} aulas`}
                        size="small"
                        variant="outlined"
                      />

                      {room.progress === 100 && (
                        <Chip
                          icon={<TrophyIcon />}
                          label="Curso Concluído!"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>

                    {room.continueFrom && (
                      <Button
                        component={Link}
                        to={`/aluno/sala/${room.id}`}
                        variant="text"
                        size="small"
                        startIcon={<PlayIcon />}
                        sx={{ mt: 2 }}
                      >
                        Continuar: {room.continueFrom.video.title} ({room.continueFrom.progress}%)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Watch History */}
      {currentUser?.watchedVideos?.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            Histórico de Aulas
          </Typography>

          <List>
            {[...currentUser.watchedVideos]
              .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
              .slice(0, 10)
              .map((watched, index) => {
                // Find video details
                let videoInfo = null
                rooms.forEach(room => {
                  room.playlists.forEach(playlist => {
                    const video = playlist.videos.find(v => v.id === watched.videoId)
                    if (video) {
                      videoInfo = {
                        ...video,
                        roomId: room.id,
                        roomName: room.name,
                        playlistName: playlist.name
                      }
                    }
                  })
                })

                if (!videoInfo) return null

                return (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem
                      component={Link}
                      to={`/aluno/sala/${videoInfo.roomId}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemText
                        primary={videoInfo.title}
                        secondary={`${videoInfo.roomName} • ${videoInfo.playlistName}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(watched.watchedAt).toLocaleDateString('pt-BR')}
                          </Typography>
                          {watched.progress >= 90 ? (
                            <Chip icon={<CheckIcon />} label="Concluído" size="small" color="success" />
                          ) : (
                            <Chip label={`${watched.progress}%`} size="small" color="warning" />
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                )
              })}
          </List>
        </Paper>
      )}
    </Layout>
  )
}
