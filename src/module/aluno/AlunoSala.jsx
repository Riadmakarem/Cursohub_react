import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import VideoComments from '../../components/VideoComments'
import VideoMaterials from '../../components/VideoMaterials'
import { toEmbed } from '../../utils/helpers'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  LinearProgress,
  Divider,
  Breadcrumbs,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Home as HomeIcon,
  PlayCircle as PlayIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  NavigateNext as NextIcon,
  Comment as CommentIcon,
  ArrowForward as ArrowIcon,
  School as SchoolIcon
} from '@mui/icons-material'

export default function AlunoSala() {
  const { id } = useParams()
  const { getRoom, getNextVideo } = useData()
  const { currentUser, isVideoWatched, markVideoWatched, getVideoProgress } = useAuth()
  const room = getRoom(id)

  // Initialize with first playlist/video
  const initialSelection = useMemo(() => {
    if (room && room.playlists.length > 0) {
      const firstPlaylist = room.playlists[0]
      return {
        playlistId: firstPlaylist.id,
        videoId: firstPlaylist.videos.length > 0 ? firstPlaylist.videos[0].id : null
      }
    }
    return { playlistId: null, videoId: null }
  }, [room])

  const [selectedPlaylist, setSelectedPlaylist] = useState(initialSelection.playlistId)
  const [selectedVideo, setSelectedVideo] = useState(initialSelection.videoId)
  const [showComments, setShowComments] = useState(false)

  if (!room) {
    return (
      <Layout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>Sala não encontrada.</Alert>
          <Button component={Link} to="/aluno" variant="contained">
            Voltar
          </Button>
        </Paper>
      </Layout>
    )
  }

  if (!currentUser?.enrolledRooms?.includes(room.id) && !room.enrolledStudents?.includes(currentUser?.id)) {
    return (
      <Layout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>Você não está matriculado nesta sala.</Alert>
          <Button component={Link} to="/aluno" variant="contained">
            Voltar
          </Button>
        </Paper>
      </Layout>
    )
  }

  const playlist = room.playlists.find(p => p.id === selectedPlaylist)
  const video = playlist?.videos.find(v => v.id === selectedVideo)
  const nextVideo = video ? getNextVideo(room.id, selectedPlaylist, video.id) : null

  // Calculate playlist progress
  function getPlaylistProgress(p) {
    if (!p.videos.length) return 0
    const watched = p.videos.filter(v => isVideoWatched(v.id)).length
    return Math.round((watched / p.videos.length) * 100)
  }

  function handleMarkWatched() {
    if (video) {
      markVideoWatched(video.id, room.id, selectedPlaylist, 100)
    }
  }

  function handleVideoSelect(playlistId, videoId) {
    setSelectedPlaylist(playlistId)
    setSelectedVideo(videoId)
    setShowComments(false)
  }

  function handleNextVideo() {
    if (nextVideo) {
      setSelectedVideo(nextVideo.id)
      setShowComments(false)
    }
  }

  return (
    <Layout>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/aluno"
          startIcon={<HomeIcon />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Início
        </Button>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon fontSize="small" />
          {room.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Sidebar with playlists */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              📚 Conteúdo
            </Typography>
            
            {room.playlists.length === 0 ? (
              <Alert severity="info">Nenhum conteúdo disponível ainda.</Alert>
            ) : (
              <Box>
                {room.playlists.map(p => {
                  const progress = getPlaylistProgress(p)
                  const isActive = selectedPlaylist === p.id

                  return (
                    <Accordion
                      key={p.id}
                      expanded={isActive}
                      onChange={() => setSelectedPlaylist(isActive ? null : p.id)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 2 }}>
                          {isActive ? <FolderOpenIcon color="primary" /> : <FolderIcon />}
                          <Typography sx={{ flexGrow: 1 }}>{p.name}</Typography>
                          <Chip
                            label={`${progress}%`}
                            size="small"
                            color={progress === 100 ? 'success' : 'default'}
                          />
                          <Chip label={p.videos.length} size="small" variant="outlined" />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ height: 4 }}
                          color={progress === 100 ? 'success' : 'primary'}
                        />
                        {p.videos.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            Nenhum vídeo nesta playlist
                          </Typography>
                        ) : (
                          <List dense disablePadding>
                            {p.videos.map((v, index) => {
                              const watched = isVideoWatched(v.id)
                              const inProgress = getVideoProgress(v.id)
                              const isSelected = selectedVideo === v.id

                              return (
                                <ListItemButton
                                  key={v.id}
                                  selected={isSelected}
                                  onClick={() => handleVideoSelect(p.id, v.id)}
                                  sx={{
                                    borderLeft: isSelected ? 4 : 0,
                                    borderColor: 'primary.main',
                                    bgcolor: watched ? 'success.50' : 'transparent'
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {index + 1}
                                    </Typography>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={v.title}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      noWrap: true,
                                      fontWeight: isSelected ? 'bold' : 'normal'
                                    }}
                                  />
                                  {watched ? (
                                    <CheckIcon color="success" fontSize="small" />
                                  ) : inProgress > 0 ? (
                                    <Chip label={`${inProgress}%`} size="small" color="warning" />
                                  ) : (
                                    <PlayIcon color="disabled" fontSize="small" />
                                  )}
                                </ListItemButton>
                              )
                            })}
                          </List>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Main content - video player */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          {!video ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <PlayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Selecione uma aula
              </Typography>
              <Typography color="text.secondary">
                Escolha uma playlist e depois um vídeo para começar a assistir.
              </Typography>
            </Paper>
          ) : (
            <Box>
              <Paper sx={{ p: 3, mb: 2 }}>
                {/* Video Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {video.title}
                  </Typography>
                  {isVideoWatched(video.id) && (
                    <Chip
                      icon={<CheckIcon />}
                      label="Assistido"
                      color="success"
                    />
                  )}
                </Box>

                {/* Video Player */}
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    bgcolor: 'black',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  <iframe
                    src={toEmbed(video.url)}
                    title={video.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>

                {/* Video Controls */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  {!isVideoWatched(video.id) && (
                    <Button
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={handleMarkWatched}
                    >
                      Marcar como Assistido
                    </Button>
                  )}
                  
                  {nextVideo && (
                    <Button
                      variant="outlined"
                      endIcon={<ArrowIcon />}
                      onClick={handleNextVideo}
                    >
                      Próxima Aula
                    </Button>
                  )}

                  <Button
                    variant={showComments ? 'contained' : 'outlined'}
                    color="secondary"
                    startIcon={<CommentIcon />}
                    onClick={() => setShowComments(!showComments)}
                  >
                    Comentários
                  </Button>
                </Box>

                {/* Description */}
                {video.description && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Descrição
                    </Typography>
                    <Typography color="text.secondary">
                      {video.description}
                    </Typography>
                  </Box>
                )}

                {/* Materials */}
                <Box sx={{ mt: 3 }}>
                  <VideoMaterials 
                    videoId={video.id} 
                    roomId={room.id} 
                    playlistId={selectedPlaylist}
                    canEdit={false}
                  />
                </Box>
              </Paper>

              {/* Comments Section */}
              <Collapse in={showComments}>
                <Paper sx={{ p: 3 }}>
                  <VideoComments 
                    videoId={video.id} 
                    roomId={room.id} 
                    playlistId={selectedPlaylist}
                  />
                </Paper>
              </Collapse>
            </Box>
          )}
        </Grid>
      </Grid>
    </Layout>
  )
}
