import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Tooltip,
  Fab,
  Stack,
  Badge
} from '@mui/material'
import {
  School as SchoolIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as CreateFolderIcon,
  Edit as EditIcon,
  DriveFileMove as MoveIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  NoteAdd as NoteAddIcon
} from '@mui/icons-material'

export default function Materiais() {
  const { getMyRooms, getRoomMaterials, addMaterial, deleteMaterial, createMaterialFolder, renameMaterialFolder, deleteMaterialFolder, getRoomFolders, moveMaterialToFolder } = useData()
  const { currentUser } = useAuth()
  const rooms = getMyRooms()
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.id || null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [uploadDialog, setUploadDialog] = useState(false)
  const [folderDialog, setFolderDialog] = useState(false)
  const [renameDialog, setRenameDialog] = useState({ open: false, folderId: null, currentName: '' })
  const [uploadFiles, setUploadFiles] = useState([])
  const [materialName, setMaterialName] = useState('')
  const [folderName, setFolderName] = useState('')
  const [uploading, setUploading] = useState(false)

  const room = rooms.find(r => r.id === selectedRoom)
  const folders = selectedRoom ? getRoomFolders(selectedRoom) : []
  const allMaterials = selectedRoom ? getRoomMaterials(selectedRoom) : []
  const materials = selectedFolder 
    ? allMaterials.filter(m => m.folderId === selectedFolder)
    : allMaterials.filter(m => !m.folderId)

  async function handleUploadMaterials() {
    if (!uploadFiles.length || !selectedRoom) return
    
    setUploading(true)
    
    for (const file of uploadFiles) {
      try {
        const storageRef = ref(storage, `room_materials/${selectedRoom}/${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        addMaterial(null, selectedRoom, null, {
          name: materialName.trim() || file.name,
          type: file.type,
          url: downloadURL,
          size: file.size
        }, selectedFolder)
      } catch (error) {
        console.error('Error uploading material:', error)
      }
    }
    
    setUploading(false)
    setUploadDialog(false)
    setUploadFiles([])
    setMaterialName('')
  }

  function handleCreateFolder() {
    if (!folderName.trim() || !selectedRoom) return
    createMaterialFolder(selectedRoom, folderName.trim())
    setFolderName('')
    setFolderDialog(false)
  }

  function handleRenameFolder() {
    if (!folderName.trim() || !renameDialog.folderId) return
    renameMaterialFolder(renameDialog.folderId, folderName.trim())
    setFolderName('')
    setRenameDialog({ open: false, folderId: null, currentName: '' })
  }

  function handleDeleteFolder(folderId) {
    if (window.confirm('Tem certeza? Os materiais serão movidos para a raiz.')) {
      deleteMaterialFolder(folderId)
      if (selectedFolder === folderId) {
        setSelectedFolder(null)
      }
    }
  }

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
        Materiais das Salas
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="text.secondary" gutterBottom>
          Gerencie os materiais de apoio (PDFs, documentos) das suas salas de aula.
        </Typography>
      </Paper>

      {rooms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma sala criada ainda
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Crie uma sala para começar a adicionar materiais.
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
          {/* Room Selector - Cards com ações visíveis */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SchoolIcon color="primary" /> Selecione uma Sala
              </Typography>
              <Grid container spacing={2}>
                {rooms.map(r => {
                  const roomFolders = getRoomFolders(r.id)
                  const roomMaterials = getRoomMaterials(r.id)
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
                      <Card 
                        elevation={selectedRoom === r.id ? 4 : 1}
                        sx={{ 
                          border: selectedRoom === r.id ? '2px solid' : '1px solid',
                          borderColor: selectedRoom === r.id ? 'primary.main' : 'grey.300',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        }}
                      >
                        <CardContent 
                          sx={{ cursor: 'pointer', pb: 1 }}
                          onClick={() => { setSelectedRoom(r.id); setSelectedFolder(null) }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <FolderIcon color={selectedRoom === r.id ? 'primary' : 'action'} />
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                              {r.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Chip 
                              size="small" 
                              label={`${roomFolders.length} pasta${roomFolders.length !== 1 ? 's' : ''}`}
                              variant="outlined"
                              icon={<FolderIcon />}
                            />
                            <Chip 
                              size="small" 
                              label={`${roomMaterials.length} arquivo${roomMaterials.length !== 1 ? 's' : ''}`}
                              variant="outlined"
                              icon={<FileIcon />}
                            />
                          </Box>
                        </CardContent>
                        <Divider />
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                          <Tooltip title="Criar nova pasta nesta sala" arrow>
                            <Button
                              size="small"
                              startIcon={<CreateFolderIcon />}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRoom(r.id)
                                setSelectedFolder(null)
                                setFolderDialog(true)
                              }}
                              color="primary"
                            >
                              Nova Pasta
                            </Button>
                          </Tooltip>
                          <Tooltip title="Adicionar material nesta sala" arrow>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<CloudUploadIcon />}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRoom(r.id)
                                setSelectedFolder(null)
                                setUploadDialog(true)
                              }}
                              color="success"
                            >
                              Material
                            </Button>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* Materials List */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              {/* Header com Breadcrumb e Ações */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'grey.200'
              }}>
                {/* Breadcrumb */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedFolder && (
                    <Tooltip title="Voltar para a sala" arrow>
                      <IconButton 
                        onClick={() => setSelectedFolder(null)}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <FolderOpenIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    {room?.name}
                  </Typography>
                  {selectedFolder && folders.find(f => f.id === selectedFolder) && (
                    <>
                      <Typography color="text.secondary" sx={{ mx: 1 }}>/</Typography>
                      <Chip 
                        icon={<FolderIcon />}
                        label={folders.find(f => f.id === selectedFolder)?.name}
                        color="primary"
                        variant="filled"
                      />
                    </>
                  )}
                </Box>

                {/* Botões de Ação sempre visíveis */}
                <Stack direction="row" spacing={1}>
                  {!selectedFolder && (
                    <Tooltip title="Criar nova pasta" arrow>
                      <Button
                        variant="outlined"
                        startIcon={<CreateFolderIcon />}
                        onClick={() => setFolderDialog(true)}
                        color="primary"
                        size="medium"
                      >
                        Nova Pasta
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title={selectedFolder ? 'Adicionar material nesta pasta' : 'Adicionar material na raiz da sala'} arrow>
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => setUploadDialog(true)}
                      color="success"
                      size="medium"
                    >
                      Adicionar Material
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Folders */}
              {!selectedFolder && folders.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" /> Pastas ({folders.length})
                    </Typography>
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {folders.map((folder) => {
                      const folderMaterials = allMaterials.filter(m => m.folderId === folder.id)
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={folder.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: 3,
                                borderColor: 'primary.main'
                              },
                              border: '1px solid',
                              borderColor: 'grey.300'
                            }}
                          >
                            <CardContent 
                              onClick={() => setSelectedFolder(folder.id)}
                              sx={{ pb: 1 }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <FolderIcon color="primary" fontSize="large" />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                    {folder.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {folderMaterials.length} arquivo{folderMaterials.length !== 1 ? 's' : ''} • {new Date(folder.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                            <Divider />
                            <CardActions sx={{ justifyContent: 'space-between', px: 1, py: 0.5 }}>
                              <Tooltip title="Adicionar material nesta pasta" arrow>
                                <Button
                                  size="small"
                                  startIcon={<NoteAddIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedFolder(folder.id)
                                    setUploadDialog(true)
                                  }}
                                  color="success"
                                >
                                  Adicionar
                                </Button>
                              </Tooltip>
                              <Box>
                                <Tooltip title="Renomear pasta" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setFolderName(folder.name)
                                      setRenameDialog({ open: true, folderId: folder.id, currentName: folder.name })
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir pasta" arrow>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteFolder(folder.id)
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardActions>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Materials */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileIcon fontSize="small" /> Arquivos ({materials.length})
                </Typography>
              </Box>
              {materials.length === 0 ? (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: 'grey.50',
                    borderStyle: 'dashed'
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {selectedFolder 
                      ? 'Nenhum material nesta pasta'
                      : 'Nenhum material na raiz desta sala'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Clique no botão abaixo para adicionar seu primeiro material
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadDialog(true)}
                    color="success"
                    size="large"
                  >
                    Adicionar Material
                  </Button>
                </Paper>
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
                          secondary={`${formatFileSize(material.size)} • ${new Date(material.createdAt).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => window.open(material.url, '_blank')}
                            sx={{ mr: 1 }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => deleteMaterial(material.id)}
                          >
                            <DeleteIcon />
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon color="success" />
          Upload de Materiais
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }} icon={<FolderIcon />}>
            <Typography variant="body2">
              <strong>Sala:</strong> {room?.name}
              {selectedFolder && folders.find(f => f.id === selectedFolder) && (
                <> • <strong>Pasta:</strong> {folders.find(f => f.id === selectedFolder)?.name}</>
              )}
            </Typography>
          </Alert>
          
          <TextField
            fullWidth
            label="Nome do Material (opcional)"
            value={materialName}
            onChange={e => setMaterialName(e.target.value)}
            margin="normal"
            helperText="Deixe em branco para usar o nome do arquivo"
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => setUploadFiles(Array.from(e.target.files))}
              style={{ display: 'none' }}
              id="material-upload"
            />
            <label htmlFor="material-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Selecionar Arquivos
              </Button>
            </label>
            
            {uploadFiles.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {uploadFiles.length} arquivo(s) selecionado(s): {uploadFiles.map(f => f.name).join(', ')}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadMaterials}
            disabled={uploading || uploadFiles.length === 0}
          >
            {uploading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialog} onClose={() => setFolderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreateFolderIcon color="primary" />
          Criar Nova Pasta
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }} icon={<FolderIcon />}>
            <Typography variant="body2">
              <strong>Sala:</strong> {room?.name}
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="Nome da Pasta"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            margin="normal"
            autoFocus
            placeholder="Ex: Provas, Exercícios, Slides..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFolderDialog(false); setFolderName('') }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            disabled={!folderName.trim()}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={renameDialog.open} onClose={() => setRenameDialog({ open: false, folderId: null, currentName: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Renomear Pasta</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Novo Nome"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRenameDialog({ open: false, folderId: null, currentName: '' }); setFolderName('') }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleRenameFolder}
            disabled={!folderName.trim()}
          >
            Renomear
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}
