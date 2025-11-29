import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#08311a',
      light: '#1a5c35',
      dark: '#021a0d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#aadead',
      light: '#bbdead',
      dark: '#ccdead',
      contrastText: '#08311a',
    },
    success: {
      main: '#28a745',
      light: '#48c664',
      dark: '#1e7e34',
    },
    warning: {
      main: '#ffc107',
      light: '#ffcd38',
      dark: '#c79100',
    },
    error: {
      main: '#dc3545',
      light: '#e4606d',
      dark: '#a71d2a',
    },
    background: {
      default: '#f5f7f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #08311a 0%, #1a5c35 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a5c35 0%, #08311a 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #aadead 0%, #bbdead 100%)',
          color: '#08311a',
          '&:hover': {
            background: 'linear-gradient(135deg, #bbdead 0%, #ccdead 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #08311a 0%, #0d4a28 100%)',
          color: '#ffffff',
        },
      },
    },
  },
})

export default theme
