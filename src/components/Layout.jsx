import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Group,
  Folder,
  BarChart,
  Home,
  PlayCircle,
  TrendingUp,
  Person,
  Notifications,
  Logout,
  MarkEmailRead,
  Description,
} from '@mui/icons-material'

const drawerWidth = 280

export default function Layout({ children }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { currentUser, logout, getMyNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useAuth()
  const navigate = useNavigate()
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  
  const isProfessor = currentUser?.role === 'professor'
  const notifications = getMyNotifications()
  const unreadCount = getUnreadCount()

  const professorMenu = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/professor' },
    { text: 'Salas de Aula', icon: <School />, path: '/professor/salas' },
    { text: 'Turmas', icon: <Group />, path: '/professor/turmas' },
    { text: 'Materiais', icon: <Folder />, path: '/professor/materiais' },
    { text: 'Estatísticas', icon: <BarChart />, path: '/professor/estatisticas' },
  ]

  const alunoMenu = [
    { text: 'Início', icon: <Home />, path: '/aluno' },
    { text: 'Minhas Aulas', icon: <PlayCircle />, path: '/aluno/aulas' },
    { text: 'Materiais', icon: <Description />, path: '/aluno/materiais' },
    { text: 'Meu Progresso', icon: <TrendingUp />, path: '/aluno/progresso' },
    { text: 'Perfil', icon: <Person />, path: '/aluno/perfil' },
  ]

  const menuItems = isProfessor ? professorMenu : alunoMenu

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNotificationClick(notification) {
    markNotificationRead(notification.id)
    setNotificationAnchor(null)
    if (notification.roomId) {
      navigate(isProfessor ? `/professor/salas/${notification.roomId}` : `/aluno/sala/${notification.roomId}`)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      new_video: '🎬',
      new_playlist: '📁',
      new_question: '❓',
      comment_reply: '💬',
      enrolled: '✅',
      welcome: '👋',
    }
    return icons[type] || '📢'
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
          🎓 CursoHub
        </Typography>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1,
            bgcolor: 'secondary.main',
            color: 'primary.main',
            fontSize: '1.8rem',
          }}
        >
          {isProfessor ? '👨‍🏫' : '🎓'}
        </Avatar>
        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
          {currentUser?.name}
        </Typography>
        <Chip
          label={isProfessor ? 'Professor' : 'Aluno'}
          size="small"
          sx={{ mt: 1, bgcolor: 'secondary.main', color: 'primary.main' }}
        />
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === '/professor' || item.path === '/aluno'}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                },
                '&.active': {
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ flex: 1 }} />

            {/* Notifications */}
            <IconButton onClick={(e) => setNotificationAnchor(e.currentTarget)}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() => setNotificationAnchor(null)}
              PaperProps={{
                sx: { width: 360, maxHeight: 480 },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Notificações</Typography>
                {unreadCount > 0 && (
                  <IconButton size="small" onClick={markAllNotificationsRead}>
                    <MarkEmailRead fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Nenhuma notificação
                </Box>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <MenuItem
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      py: 1.5,
                      bgcolor: n.read ? 'transparent' : 'rgba(170,222,173,0.15)',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>
                        {getNotificationIcon(n.type)}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {n.message}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
