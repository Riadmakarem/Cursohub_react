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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Badge
} from '@mui/material'
import {
  School as SchoolIcon,
  People as PeopleIcon,
  PlaylistPlay as PlaylistIcon,
  VideoLibrary as VideoIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewsIcon,
  QuestionAnswer as QuestionIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'

export default function Estatisticas() {
  const { getMyRooms, getRoomStats } = useData()
  const { users } = useAuth()
  const rooms = getMyRooms()

  // Calculate totals
  const totalStudents = new Set(rooms.flatMap(r => r.enrolledStudents)).size
  const totalPlaylists = rooms.reduce((acc, r) => acc + r.playlists.length, 0)
  const totalVideos = rooms.reduce((acc, r) => 
    acc + r.playlists.reduce((a2, p) => a2 + p.videos.length, 0), 0)

  // Calculate video stats
  const videoStats = []
  rooms.forEach(room => {
    room.playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        // Count how many students watched this video
        const watchedBy = users.filter(u => 
          u.watchedVideos?.some(w => w.videoId === video.id && w.progress >= 90)
        ).length

        videoStats.push({
          ...video,
          roomName: room.name,
          playlistName: playlist.name,
          roomId: room.id,
          watchedBy,
          totalStudents: room.enrolledStudents.length
        })
      })
    })
  })

  // Sort by views
  const topVideos = [...videoStats].sort((a, b) => b.watchedBy - a.watchedBy).slice(0, 10)

  // Calculate student progress per room
  const roomProgress = rooms.map(room => {
    const stats = getRoomStats(room.id)
    const totalVideos = room.playlists.reduce((acc, p) => acc + p.videos.length, 0)
    
    // Calculate average progress
    let totalProgress = 0
    let studentCount = 0

    room.enrolledStudents.forEach(studentId => {
      const student = users.find(u => u.id === studentId)
      if (student) {
        const watchedInRoom = student.watchedVideos?.filter(w => w.roomId === room.id).length || 0
        if (totalVideos > 0) {
          totalProgress += (watchedInRoom / totalVideos) * 100
          studentCount++
        }
      }
    })

    return {
      ...room,
      ...stats,
      avgProgress: studentCount > 0 ? Math.round(totalProgress / studentCount) : 0
    }
  })

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Estatísticas
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <SchoolIcon sx={{ fontSize: 32 }} />
              <Typography variant="h3" fontWeight="bold">{rooms.length}</Typography>
              <Typography variant="body2">Salas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PeopleIcon sx={{ fontSize: 32 }} />
              <Typography variant="h3" fontWeight="bold">{totalStudents}</Typography>
              <Typography variant="body2">Alunos Únicos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PlaylistIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h3" fontWeight="bold">{totalPlaylists}</Typography>
              <Typography variant="body2">Playlists</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <VideoIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h3" fontWeight="bold">{totalVideos}</Typography>
              <Typography variant="body2">Videoaulas</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Videos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon color="warning" /> Vídeos Mais Assistidos
            </Typography>
            
            {topVideos.length === 0 ? (
              <Alert severity="info">Nenhum vídeo disponível ainda.</Alert>
            ) : (
              <Box>
                {topVideos.map((video, index) => (
                  <Box
                    key={video.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: index < topVideos.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      color={index < 3 ? 'warning' : 'default'}
                      sx={{ minWidth: 50 }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography fontWeight="medium" noWrap>
                        {video.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {video.roomName} • {video.playlistName}
                      </Typography>
                    </Box>
                    <Chip
                      icon={<ViewsIcon />}
                      label={video.watchedBy}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Room Progress */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" /> Progresso por Sala
            </Typography>
            
            {roomProgress.length === 0 ? (
              <Alert severity="info">Nenhuma sala criada ainda.</Alert>
            ) : (
              <Box>
                {roomProgress.map((room, index) => (
                  <Box
                    key={room.id}
                    component={Link}
                    to={`/professor/salas/${room.id}`}
                    sx={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      py: 1.5,
                      borderBottom: index < roomProgress.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography fontWeight="medium">{room.name}</Typography>
                      {room.unresolvedQuestions > 0 && (
                        <Badge badgeContent={room.unresolvedQuestions} color="warning">
                          <QuestionIcon fontSize="small" />
                        </Badge>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {room.totalStudents} alunos • {room.totalVideos} vídeos
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={room.avgProgress}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={room.avgProgress >= 80 ? 'success' : room.avgProgress >= 50 ? 'primary' : 'warning'}
                      />
                      <Typography variant="body2" sx={{ minWidth: 45 }}>
                        {room.avgProgress}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          📋 Detalhamento por Sala
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sala</TableCell>
                <TableCell align="center">Alunos</TableCell>
                <TableCell align="center">Playlists</TableCell>
                <TableCell align="center">Vídeos</TableCell>
                <TableCell align="center">Comentários</TableCell>
                <TableCell align="center">Dúvidas Pendentes</TableCell>
                <TableCell>Progresso Médio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomProgress.map(room => (
                <TableRow key={room.id} hover>
                  <TableCell>
                    <Typography
                      component={Link}
                      to={`/professor/salas/${room.id}`}
                      sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'medium' }}
                    >
                      {room.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{room.totalStudents}</TableCell>
                  <TableCell align="center">{room.totalPlaylists}</TableCell>
                  <TableCell align="center">{room.totalVideos}</TableCell>
                  <TableCell align="center">{room.totalComments}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={room.unresolvedQuestions}
                      size="small"
                      color={room.unresolvedQuestions > 0 ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={room.avgProgress}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4, maxWidth: 100 }}
                        color={room.avgProgress >= 80 ? 'success' : room.avgProgress >= 50 ? 'primary' : 'warning'}
                      />
                      <Typography variant="body2">{room.avgProgress}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Layout>
  )
}
