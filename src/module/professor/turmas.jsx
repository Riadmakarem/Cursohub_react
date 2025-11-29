import React from 'react'
import { useData } from '../../context/DataContext'
import Layout from '../../components/Layout'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material'
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from '@mui/icons-material'

export default function Turmas() {
  const { getMyRooms } = useData()
  const rooms = getMyRooms()

  const totalStudents = rooms.reduce((acc, room) => acc + room.enrolledStudents.length, 0)

  return (
    <Layout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestão de Turmas
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="text.secondary" gutterBottom>
          Visualize os alunos matriculados em cada sala.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip
            icon={<SchoolIcon />}
            label={`${rooms.length} salas`}
            color="primary"
          />
          <Chip
            icon={<PeopleIcon />}
            label={`${totalStudents} alunos matriculados`}
            color="secondary"
          />
        </Box>
      </Paper>

      {rooms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma sala criada ainda
          </Typography>
          <Typography color="text.secondary">
            Crie uma sala para começar a gerenciar suas turmas.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rooms.map(room => (
            <Grid size={{ xs: 12, md: 6 }} key={room.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {room.name}
                    </Typography>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${room.enrolledStudents.length} alunos`}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  {room.enrolledStudents.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Nenhum aluno matriculado nesta sala ainda.
                    </Alert>
                  ) : (
                    <List dense>
                      {room.enrolledStudents.map((studentId, index) => (
                        <React.Fragment key={studentId}>
                          {index > 0 && <Divider variant="inset" component="li" />}
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`Aluno ${index + 1}`}
                              secondary={`ID: ${studentId.slice(0, 8)}...`}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  )
}
