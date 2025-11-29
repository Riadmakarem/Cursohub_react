import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Breadcrumbs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Snackbar,
  InputAdornment,
  Tooltip
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddIcon,
  PersonRemove as RemoveIcon,
  School as SchoolIcon,
  NavigateNext as NextIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material'

export default function GerenciarAlunos() {
  const { id } = useParams()
  const { getRoom, getRoomStudents, removeStudentFromRoom, addStudentToRoom, regenerateInviteCode } = useData()
  const { getAllStudents } = useAuth()
  const room = getRoom(id)
  const students = getRoomStudents(id)
  const allStudents = getAllStudents()

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, studentId: null, studentName: '' })

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

  const availableStudents = allStudents.filter(
    s => !room.enrolledStudents.includes(s.id) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  function handleRemoveStudent() {
    removeStudentFromRoom(room.id, confirmDialog.studentId)
    setConfirmDialog({ open: false, studentId: null, studentName: '' })
    setSnackbar({ open: true, message: 'Aluno removido com sucesso!' })
  }

  function handleAddStudent(studentId) {
    addStudentToRoom(room.id, studentId)
    setShowAddModal(false)
    setSearchTerm('')
    setSnackbar({ open: true, message: 'Aluno adicionado com sucesso!' })
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(room.inviteCode)
    setSnackbar({ open: true, message: 'Código copiado!' })
  }

  function handleRegenerateCode() {
    regenerateInviteCode(room.id)
    setSnackbar({ open: true, message: 'Novo código gerado!' })
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
        <Button
          component={Link}
          to={`/professor/salas/${room.id}`}
          startIcon={<SchoolIcon />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          {room.name}
        </Button>
        <Typography color="text.primary">Gerenciar Alunos</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gerenciar Alunos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sala: {room.name}
      </Typography>

      {/* Invite Code Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Código de Convite
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Compartilhe este código com seus alunos para que eles possam se matricular.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={room.inviteCode}
            sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              py: 3,
              px: 2,
              bgcolor: 'secondary.main',
              color: 'primary.main'
            }}
          />
          <Tooltip title="Copiar código">
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleCopyCode}
            >
              Copiar
            </Button>
          </Tooltip>
          <Tooltip title="Gerar novo código">
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RefreshIcon />}
              onClick={handleRegenerateCode}
            >
              Gerar Novo
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Students Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Alunos Matriculados ({students.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddModal(true)}
          >
            Adicionar Aluno
          </Button>
        </Box>

        {students.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum aluno matriculado ainda
            </Typography>
            <Typography color="text.secondary">
              Compartilhe o código de convite ou adicione alunos manualmente.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Matriculado em</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
                          {student.avatar || student.name?.charAt(0) || '🎓'}
                        </Avatar>
                        <Typography fontWeight="medium">{student.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        color="error"
                        size="small"
                        startIcon={<RemoveIcon />}
                        onClick={() => setConfirmDialog({
                          open: true,
                          studentId: student.id,
                          studentName: student.name
                        })}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Student Dialog */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Adicionar Aluno</Typography>
          <IconButton onClick={() => setShowAddModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          {availableStudents.length === 0 ? (
            <Alert severity="info">
              Nenhum aluno disponível para adicionar.
            </Alert>
          ) : (
            <List>
              {availableStudents.slice(0, 10).map((student, index) => (
                <React.Fragment key={student.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
                        {student.name?.charAt(0) || '🎓'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={student.email}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddStudent(student.id)}
                      >
                        Adicionar
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, studentId: null, studentName: '' })}
      >
        <DialogTitle>Remover Aluno</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover <strong>{confirmDialog.studentName}</strong> desta sala?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            O progresso do aluno será perdido.
          </Alert>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={() => setConfirmDialog({ open: false, studentId: null, studentName: '' })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleRemoveStudent}>
            Remover
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Layout>
  )
}
