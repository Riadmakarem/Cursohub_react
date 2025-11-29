import React, { useState, useRef } from 'react'
import { useData } from '../context/DataContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  MenuItem,
  Stack,
  Divider,
  Chip,
} from '@mui/material'
import {
  AttachFile,
  Add,
  PictureAsPdf,
  Slideshow,
  Description,
  TableChart,
  Archive,
  Image,
  Link as LinkIcon,
  Folder,
  Download,
  OpenInNew,
  Delete,
  CloudUpload,
} from '@mui/icons-material'

export default function VideoMaterials({ videoId, roomId, playlistId, canEdit = false }) {
  const { getVideoMaterials, addMaterial, deleteMaterial } = useData()
  const [showUpload, setShowUpload] = useState(false)
  const [materialName, setMaterialName] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [materialType, setMaterialType] = useState('pdf')
  const fileInputRef = useRef(null)

  const materials = getVideoMaterials(videoId)

  function handleAddMaterial(e) {
    e.preventDefault()
    if (!materialName.trim() || !materialUrl.trim()) return

    addMaterial(videoId, roomId, playlistId, {
      name: materialName.trim(),
      url: materialUrl.trim(),
      type: materialType
    })

    setMaterialName('')
    setMaterialUrl('')
    setShowUpload(false)
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      addMaterial(videoId, roomId, playlistId, {
        name: file.name,
        url: dataUrl,
        type: getFileType(file.name),
        size: file.size
      })
    }
    reader.readAsDataURL(file)
    
    e.target.value = ''
  }

  function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase()
    if (['pdf'].includes(ext)) return 'pdf'
    if (['ppt', 'pptx'].includes(ext)) return 'slides'
    if (['doc', 'docx', 'txt'].includes(ext)) return 'document'
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet'
    if (['zip', 'rar'].includes(ext)) return 'archive'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
    return 'file'
  }

  function getTypeIcon(type) {
    const icons = {
      pdf: <PictureAsPdf color="error" />,
      slides: <Slideshow color="warning" />,
      document: <Description color="primary" />,
      spreadsheet: <TableChart color="success" />,
      archive: <Archive />,
      image: <Image color="secondary" />,
      file: <Folder />,
      link: <LinkIcon color="info" />
    }
    return icons[type] || <Folder />
  }

  function formatSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          <AttachFile sx={{ mr: 1, verticalAlign: 'middle' }} />
          Materiais Complementares ({materials.length})
        </Typography>
        {canEdit && (
          <Button 
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setShowUpload(!showUpload)}
          >
            Adicionar
          </Button>
        )}
      </Box>

      {/* Upload Form */}
      <Collapse in={canEdit && showUpload}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Adicionar Material
            </Typography>
            
            {/* File Upload */}
            <Box sx={{ mb: 3 }}>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                style={{ display: 'none' }}
                id="material-upload"
              />
              <label htmlFor="material-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Fazer upload de arquivo
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                PDF, DOC, PPT, XLS, imagens ou arquivos compactados
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Chip label="ou adicione um link" size="small" />
            </Divider>

            {/* Link Form */}
            <Box component="form" onSubmit={handleAddMaterial}>
              <TextField
                fullWidth
                size="small"
                label="Nome do Material"
                value={materialName}
                onChange={e => setMaterialName(e.target.value)}
                placeholder="Ex: Slides da Aula 1"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                size="small"
                label="URL do Material"
                type="url"
                value={materialUrl}
                onChange={e => setMaterialUrl(e.target.value)}
                placeholder="https://..."
                sx={{ mb: 2 }}
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Tipo"
                value={materialType}
                onChange={e => setMaterialType(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="slides">Slides</MenuItem>
                <MenuItem value="document">Documento</MenuItem>
                <MenuItem value="link">Link Externo</MenuItem>
              </TextField>

              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" size="small">
                  Adicionar
                </Button>
                <Button size="small" onClick={() => setShowUpload(false)}>
                  Cancelar
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Materials List */}
      {materials.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Nenhum material anexado a esta aula.
        </Typography>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {materials.map((material, index) => (
            <ListItem 
              key={material.id}
              divider={index < materials.length - 1}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                {getTypeIcon(material.type)}
              </ListItemIcon>
              <ListItemText
                primary={material.name}
                secondary={material.size ? formatSize(material.size) : null}
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={0.5}>
                  {material.url.startsWith('data:') ? (
                    <IconButton
                      component="a"
                      href={material.url}
                      download={material.name}
                      size="small"
                      color="primary"
                    >
                      <Download />
                    </IconButton>
                  ) : (
                    <IconButton
                      component="a"
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      color="primary"
                    >
                      <OpenInNew />
                    </IconButton>
                  )}
                  {canEdit && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm('Excluir material?')) deleteMaterial(material.id)
                      }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
