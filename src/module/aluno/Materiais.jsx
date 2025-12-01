import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Card,
  CardContent
} from '@mui/material'
import {
  School as SchoolIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material'

export default function AlunoMateriais() {
  const { getMyRooms, getRoomMaterials, getRoomFolders } = useData()
  const rooms = getMyRooms()
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.id || null)
  const [selectedFolder, setSelectedFolder] = useState(null)

  const room = rooms.find(r => r.id === selectedRoom)
  const folders = selectedRoom ? getRoomFolders(selectedRoom) : []
  const allMaterials = selectedRoom ? getRoomMaterials(selectedRoom) : []
  const materials = selectedFolder 
    ? allMaterials.filter(m => m.folderId === selectedFolder)
    : allMaterials.filter(m => !m.folderId)

  function getFileIcon(type) {
    if (type?.includes('pdf')) return <PdfIcon color="error" />
    if (type?.includes('word') || type?.includes('document')) return <FileIcon color="primary" />
    return <FileIcon />
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📚 Materiais de Estudo
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="text.secondary" gutterBottom>
          Acesse todos os materiais de apoio disponibilizados pelos seus professores.
        </Typography>
      </Paper>

      {rooms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Você não está matriculado em nenhuma sala
          </Typography>
          <Typography color="text.secondary">
            Matricule-se em uma sala para acessar os materiais.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {rooms.length}
                </Typography>
                <Typography variant="body2">
                  Salas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FileIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {rooms.reduce((total, r) => total + getRoomMaterials(r.id).length, 0)}
                </Typography>
                <Typography variant="body2">
                  Materiais
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Room Selector */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selecione uma sala:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {rooms.map(r => {
                  const roomMaterialsCount = getRoomMaterials(r.id).length
                  return (
                    <Chip
                      key={r.id}
                      icon={selectedRoom === r.id ? <FolderOpenIcon /> : <FolderIcon />}
                      label={`${r.name} (${roomMaterialsCount})`}
                      onClick={() => { setSelectedRoom(r.id); setSelectedFolder(null) }}
                      color={selectedRoom === r.id ? 'primary' : 'default'}
                      variant={selectedRoom === r.id ? 'filled' : 'outlined'}
                    />
                  )
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Materials List */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              {/* Breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography
                  onClick={() => setSelectedFolder(null)}
                  sx={{ 
                    cursor: selectedFolder ? 'pointer' : 'default',
                    color: selectedFolder ? 'primary.main' : 'text.primary',
                    '&:hover': selectedFolder ? { textDecoration: 'underline' } : {}
                  }}
                >
                  {room?.name}
                </Typography>
                {selectedFolder && folders.find(f => f.id === selectedFolder) && (
                  <>
                    <Typography>/</Typography>
                    <Typography color="primary" fontWeight="bold">
                      {folders.find(f => f.id === selectedFolder)?.name}
                    </Typography>
                  </>
                )}
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileIcon /> {selectedFolder ? 'Materiais da Pasta' : 'Materiais'}
              </Typography>

              {/* Folders */}
              {!selectedFolder && folders.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    Pastas
                  </Typography>
                  <List>
                    {folders.map((folder) => {
                      const folderMaterialsCount = allMaterials.filter(m => m.folderId === folder.id).length
                      return (
                        <ListItem
                          key={folder.id}
                          component="button"
                          onClick={() => setSelectedFolder(folder.id)}
                          sx={{ 
                            borderRadius: 1, 
                            mb: 1,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <ListItemIcon>
                            <FolderIcon color="primary" fontSize="large" />
                          </ListItemIcon>
                          <ListItemText
                            primary={folder.name}
                            secondary={`${folderMaterialsCount} arquivo(s)`}
                            primaryTypographyProps={{ fontWeight: 600, color: 'text.primary' }}
                            secondaryTypographyProps={{ color: 'text.secondary' }}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Materials */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                Arquivos
              </Typography>
              {materials.length === 0 ? (
                <Alert severity="info">
                  {selectedFolder 
                    ? 'Nenhum material nesta pasta.'
                    : 'Nenhum material disponível nesta sala no momento.'}
                </Alert>
              ) : (
                <List>
                  {materials.map((material, index) => (
                    <React.Fragment key={material.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon>
                          {getFileIcon(material.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={material.name}
                          secondary={`${formatFileSize(material.size)} • Adicionado em ${new Date(material.createdAt).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => window.open(material.url, '_blank')}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Layout>
  )
}
