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
  Tab
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
  DriveFileMove as MoveIcon
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
          {/* Room Selector */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {rooms.map(r => (
                    <Chip
                      key={r.id}
                      icon={<FolderIcon />}
                      label={r.name}
                      onClick={() => { setSelectedRoom(r.id); setSelectedFolder(null) }}
                      color={selectedRoom === r.id ? 'primary' : 'default'}
                      variant={selectedRoom === r.id ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CreateFolderIcon />}
                    onClick={() => setFolderDialog(true)}
                    disabled={!selectedRoom}
                  >
                    Nova Pasta
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadDialog(true)}
                    disabled={!selectedRoom}
                  >
                    Upload Material
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Materials List */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              {/* Breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  onClick={() => setSelectedFolder(null)}
                  disabled={!selectedFolder}
                >
                  {room?.name}
                </Button>
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
                <FileIcon /> {selectedFolder ? 'Materiais da Pasta' : 'Materiais de ' + room?.name}
              </Typography>

              {/* Folders */}
              {!selectedFolder && folders.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    Pastas
                  </Typography>
                  <List>
                    {folders.map((folder) => (
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
                          secondary={`Criada em ${new Date(folder.createdAt).toLocaleDateString()}`}
                          primaryTypographyProps={{ fontWeight: 600, color: 'text.primary' }}
                          secondaryTypographyProps={{ color: 'text.secondary' }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFolderName(folder.name)
                              setRenameDialog({ open: true, folderId: folder.id, currentName: folder.name })
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
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
                    ? 'Nenhum material nesta pasta. Use "Upload Material" para adicionar.'
                    : 'Nenhum material nesta sala. Clique em "Upload Material" para adicionar.'}
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
        <DialogTitle>Upload de Materiais</DialogTitle>
        <DialogContent>
          {selectedFolder && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Materiais serão adicionados à pasta: <strong>{folders.find(f => f.id === selectedFolder)?.name}</strong>
            </Alert>
          )}
          
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
        <DialogTitle>Criar Nova Pasta</DialogTitle>
        <DialogContent>
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
