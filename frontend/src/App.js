import React from 'react';
import Dashboard from './components/Dashboard';
import ProductivityForm from './components/ProductivityForm.js/ProductivityForm';
import { Container, Box, ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { blue, purple } from '@mui/material/colors';
import './App.css';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: purple[500],
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pb: 4
      }}>
        <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h1" color="primary" sx={{ fontSize: '1.5rem' }}>
              WorkSphere
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <ProductivityForm />
            <Box sx={{ mt: 4 }}>
              <Dashboard />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
