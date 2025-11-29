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
  Chip,
  Alert,
  Button,
  LinearProgress
} from '@mui/material'
import {
  School as SchoolIcon,
  PlayCircle as PlayIcon,
  VideoLibrary as VideoIcon,
  PlaylistPlay as PlaylistIcon
} from '@mui/icons-material'

export default function AlunoAulas() {
  const { getMyRooms } = useData()
  const { getVideoProgress } = useAuth()
  const rooms = getMyRooms()

  // Collect all videos from enrolled rooms
  const allVideos = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        allVideos.push({
          ...video,
          roomName: room.name,
          roomId: room.id,
          playlistName: playlist.name
        })
      })
    })
  })

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Minhas Aulas
      </Typography>

      {/* Stats Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Todas as videoaulas das salas em que você está matriculado.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Chip
            icon={<SchoolIcon />}
            label={`${rooms.length} salas`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<VideoIcon />}
            label={`${allVideos.length} aulas disponíveis`}
            color="secondary"
          />
        </Box>
      </Paper>

      {allVideos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <VideoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma aula disponível
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Matricule-se em uma sala para ter acesso às videoaulas.
          </Typography>
          <Button
            component={Link}
            to="/aluno"
            variant="contained"
            startIcon={<SchoolIcon />}
          >
            Ver Salas Disponíveis
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {allVideos.map(video => {
            const progress = getVideoProgress(video.id) || 0
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea
                    component={Link}
                    to={`/aluno/sala/${video.roomId}`}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={video.roomName}
                          size="small"
                          color="primary"
                        />
                        <Chip
                          icon={<PlaylistIcon />}
                          label={video.playlistName}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <PlayIcon color="secondary" sx={{ mt: 0.3 }} />
                        <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                          {video.title}
                        </Typography>
                      </Box>

                      {video.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 2
                          }}
                        >
                          {video.description}
                        </Typography>
                      )}

                      {progress > 0 && (
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progresso
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 6, borderRadius: 3 }}
                            color={progress >= 90 ? 'success' : 'secondary'}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Layout>
  )
}