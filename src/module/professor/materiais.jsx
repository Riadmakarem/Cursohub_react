import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert
} from '@mui/material'
import {
  School as SchoolIcon,
  PlaylistPlay as PlaylistIcon,
  VideoLibrary as VideoIcon,
  PlayCircle as PlayIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material'

export default function Materiais() {
  const { getMyRooms } = useData()
  const rooms = getMyRooms()

  const allVideos = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        allVideos.push({
          ...video,
          roomName: room.name,
          roomId: room.id,
          playlistName: playlist.name,
          playlistId: playlist.id
        })
      })
    })
  })

  const totalPlaylists = rooms.reduce((a, r) => a + r.playlists.length, 0)

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Todos os Materiais
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="text.secondary" gutterBottom>
          Visão geral de todas as videoaulas publicadas.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Chip icon={<SchoolIcon />} label={`${rooms.length} salas`} color="primary" />
          <Chip icon={<PlaylistIcon />} label={`${totalPlaylists} playlists`} color="secondary" />
          <Chip icon={<VideoIcon />} label={`${allVideos.length} vídeos`} variant="outlined" />
        </Box>
      </Paper>

      {allVideos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <VideoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma videoaula publicada ainda
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Crie uma sala e adicione playlists para publicar suas aulas.
          </Typography>
          <Button
            component={Link}
            to="/professor/salas/nova"
            variant="contained"
            startIcon={<SchoolIcon />}
          >
            Criar uma Sala
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {allVideos.map(video => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={video.roomName} size="small" color="primary" />
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
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {video.description}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    to={`/professor/salas/${video.roomId}`}
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowIcon />}
                    fullWidth
                  >
                    Ir para Sala
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  )
}
