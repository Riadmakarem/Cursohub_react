import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import VideoComments from '../../components/VideoComments'
import VideoMaterials from '../../components/VideoMaterials'
import { toEmbed } from '../../utils/helpers'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Alert,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  InputAdornment,
  Badge
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  PlayCircle as PlayIcon,
  People as PeopleIcon,
  VideoLibrary as VideoIcon,
  PlaylistPlay as PlaylistIcon,
  QuestionAnswer as QuestionIcon,
  Search as SearchIcon,
  NavigateNext as NextIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from '@mui/icons-material'

export default function SalaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRoom, createPlaylist, deletePlaylist, addVideo, deleteVideo, deleteRoom, getVideoComments, getRoomStats } = useData()
  const room = getRoom(id)

  const [playlistName, setPlaylistName] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null, name: '' })

  if (!room) {
    return (
      <Layout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>Sala não encontrada.</Alert>
          <Button component={Link} to="/professor/salas" variant="contained">
            Voltar
          </Button>
        </Paper>
      </Layout>
    )
  }

  const stats = getRoomStats(room.id)
  const playlist = room.playlists.find(p => p.id === selectedPlaylist)
  const video = selectedVideo ? playlist?.videos.find(v => v.id === selectedVideo) : null
  
  // Filter videos by search term
  const filteredVideos = playlist?.videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  function handleCreatePlaylist(e) {
    e.preventDefault()
    if (!playlistName.trim()) return
    createPlaylist(room.id, playlistName.trim())
    setPlaylistName('')
  }

  function handleAddVideo(e) {
    e.preventDefault()
    if (!videoUrl.trim() || !selectedPlaylist) return
    addVideo(room.id, selectedPlaylist, {
      title: videoTitle.trim() || 'Videoaula',
      url: videoUrl.trim(),
      description: videoDescription.trim()
    })
    setVideoTitle('')
    setVideoUrl('')
    setVideoDescription('')
    setActiveTab(0)
  }

  function handleDelete() {
    if (deleteDialog.type === 'room') {
      deleteRoom(room.id)
      navigate('/professor/salas')
    } else if (deleteDialog.type === 'playlist') {
      deletePlaylist(room.id, deleteDialog.id)
      if (selectedPlaylist === deleteDialog.id) {
        setSelectedPlaylist(null)
        setSelectedVideo(null)
      }
    } else if (deleteDialog.type === 'video') {
      deleteVideo(room.id, selectedPlaylist, deleteDialog.id)
      if (selectedVideo === deleteDialog.id) {
        setSelectedVideo(null)
      }
    }
    setDeleteDialog({ open: false, type: '', id: null, name: '' })
  }

  function getVideoQuestionCount(videoId) {
    const comments = getVideoComments(videoId)
    return comments.filter(c => c.type === 'question' && !c.resolved).length
  }

  return (
    <Layout>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/professor/salas"
          startIcon={<HomeIcon />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Salas
        </Button>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon fontSize="small" />
          {room.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {room.name}
          </Typography>
          <Typography color="text.secondary">
            {room.description || 'Sem descrição'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to={`/professor/salas/${room.id}/alunos`}
            variant="outlined"
            startIcon={<PeopleIcon />}
          >
            Gerenciar Alunos
          </Button>
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog({ open: true, type: 'room', id: room.id, name: room.name })}
          >
            Excluir Sala
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PlaylistIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight="bold">{room.playlists.length}</Typography>
              <Typography variant="body2">Playlists</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <VideoIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight="bold">{stats?.totalVideos || 0}</Typography>
              <Typography variant="body2">Vídeos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" fontWeight="bold">{room.enrolledStudents?.length || 0}</Typography>
              <Typography variant="body2">Alunos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: stats?.unresolvedQuestions > 0 ? 'warning.main' : 'grey.100' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <QuestionIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight="bold">{stats?.unresolvedQuestions || 0}</Typography>
              <Typography variant="body2">Dúvidas Pendentes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Playlists Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderIcon /> Playlists
            </Typography>

            <Box component="form" onSubmit={handleCreatePlaylist} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                placeholder="Nome da playlist"
              />
              <Button type="submit" variant="contained" size="small">
                <AddIcon />
              </Button>
            </Box>

            {room.playlists.length === 0 ? (
              <Alert severity="info">Nenhuma playlist criada</Alert>
            ) : (
              <List dense>
                {room.playlists.map(p => {
                  const pendingQuestions = p.videos.reduce((acc, v) => acc + getVideoQuestionCount(v.id), 0)
                  const isActive = selectedPlaylist === p.id

                  return (
                    <ListItemButton
                      key={p.id}
                      selected={isActive}
                      onClick={() => { setSelectedPlaylist(p.id); setSelectedVideo(null); setSearchTerm('') }}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        borderLeft: isActive ? 4 : 0,
                        borderColor: 'primary.main'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {isActive ? <FolderOpenIcon color="primary" /> : <FolderIcon />}
                      </ListItemIcon>
                      <ListItemText primary={p.name} />
                      <Chip label={p.videos.length} size="small" sx={{ mr: 1 }} />
                      {pendingQuestions > 0 && (
                        <Badge badgeContent={pendingQuestions} color="warning" sx={{ mr: 1 }}>
                          <QuestionIcon fontSize="small" />
                        </Badge>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDialog({ open: true, type: 'playlist', id: p.id, name: p.name })
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemButton>
                  )
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Videos Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {!playlist ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Selecione uma playlist
              </Typography>
              <Typography color="text.secondary">
                Escolha uma playlist para ver e adicionar vídeos
              </Typography>
            </Paper>
          ) : (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderOpenIcon color="primary" /> {playlist.name}
                  </Typography>
                </Box>

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                  <Tab label={`Vídeos (${playlist.videos.length})`} />
                  <Tab label="+ Adicionar Vídeo" />
                </Tabs>

                {activeTab === 1 && (
                  <Box component="form" onSubmit={handleAddVideo}>
                    <TextField
                      fullWidth
                      label="Título do vídeo"
                      value={videoTitle}
                      onChange={e => setVideoTitle(e.target.value)}
                      placeholder="Ex: Aula 01 - Introdução"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Link do YouTube"
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      required
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Descrição (opcional)"
                      value={videoDescription}
                      onChange={e => setVideoDescription(e.target.value)}
                      placeholder="Descrição ou observações sobre o vídeo"
                      multiline
                      rows={2}
                      margin="normal"
                    />
                    <Button type="submit" variant="contained" startIcon={<AddIcon />} sx={{ mt: 1 }}>
                      Adicionar Vídeo
                    </Button>
                  </Box>
                )}

                {activeTab === 0 && (
                  <>
                    {playlist.videos.length > 3 && (
                      <TextField
                        fullWidth
                        size="small"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar vídeos..."
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}

                    {filteredVideos.length === 0 ? (
                      <Alert severity="info">
                        {searchTerm ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo nesta playlist'}
                      </Alert>
                    ) : (
                      <List>
                        {filteredVideos.map((v, index) => {
                          const questionCount = getVideoQuestionCount(v.id)
                          const isSelected = selectedVideo === v.id

                          return (
                            <React.Fragment key={v.id}>
                              {index > 0 && <Divider />}
                              <ListItemButton
                                selected={isSelected}
                                onClick={() => setSelectedVideo(v.id)}
                                sx={{
                                  borderRadius: 1,
                                  borderLeft: isSelected ? 4 : 0,
                                  borderColor: 'primary.main'
                                }}
                              >
                                <ListItemIcon>
                                  <PlayIcon color={isSelected ? 'primary' : 'inherit'} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={v.title}
                                  secondary={v.description}
                                  secondaryTypographyProps={{ noWrap: true }}
                                />
                                {questionCount > 0 && (
                                  <Badge badgeContent={questionCount} color="warning" sx={{ mr: 1 }}>
                                    <QuestionIcon />
                                  </Badge>
                                )}
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteDialog({ open: true, type: 'video', id: v.id, name: v.title })
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemButton>
                            </React.Fragment>
                          )
                        })}
                      </List>
                    )}
                  </>
                )}
              </Paper>

              {/* Video Detail Panel */}
              {video && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlayIcon color="primary" /> {video.title}
                  </Typography>
                  {video.description && (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {video.description}
                    </Typography>
                  )}
                  
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%',
                      bgcolor: 'black',
                      borderRadius: 2,
                      overflow: 'hidden',
                      mb: 3
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

                  {/* Materials Section */}
                  <VideoMaterials videoId={video.id} roomId={room.id} isProfessor={true} />

                  <Divider sx={{ my: 3 }} />

                  {/* Comments Section */}
                  <VideoComments videoId={video.id} roomId={room.id} />
                </Paper>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', id: null, name: '' })}>
        <DialogTitle>
          Excluir {deleteDialog.type === 'room' ? 'Sala' : deleteDialog.type === 'playlist' ? 'Playlist' : 'Vídeo'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{deleteDialog.name}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', id: null, name: '' })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}
