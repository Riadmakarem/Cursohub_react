import React, { useState } from 'react'
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Add as AddIcon,
  School as SchoolIcon,
  PlaylistPlay as PlaylistIcon,
  VideoLibrary as VideoIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

export default function SalasLista() {
  const { getMyRooms, deleteRoom } = useData()
  const rooms = getMyRooms()
  const [deleteDialog, setDeleteDialog] = useState({ open: false, roomId: null, roomName: '' })

  function handleDelete() {
    deleteRoom(deleteDialog.roomId)
    setDeleteDialog({ open: false, roomId: null, roomName: '' })
  }

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Salas de Aula
        </Typography>
        <Button
          component={Link}
          to="/professor/salas/nova"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nova Sala
        </Button>
      </Box>

      {rooms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma sala de aula criada ainda
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Crie sua primeira sala para começar a organizar seu conteúdo.
          </Typography>
          <Button
            component={Link}
            to="/professor/salas/nova"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Criar Primeira Sala
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rooms.map(room => {
            const totalVideos = room.playlists.reduce((a, p) => a + p.videos.length, 0)
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      component={Link}
                      to={`/professor/salas/${room.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        mb: 1,
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {room.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {room.description || 'Sem descrição'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<PlaylistIcon />}
                        label={`${room.playlists.length} playlists`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<VideoIcon />}
                        label={`${totalVideos} vídeos`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<PeopleIcon />}
                        label={`${room.enrolledStudents.length} alunos`}
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/professor/salas/${room.id}`}
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                    >
                      Gerenciar
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialog({
                        open: true,
                        roomId: room.id,
                        roomName: room.name
                      })}
                    >
                      Excluir
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, roomId: null, roomName: '' })}>
        <DialogTitle>Excluir Sala</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a sala <strong>{deleteDialog.roomName}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita. Todas as playlists e vídeos serão perdidos.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, roomId: null, roomName: '' })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Excluir Sala
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}
