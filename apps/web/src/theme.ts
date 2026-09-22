import { createTheme } from '@mui/material/styles';

export const STATUS_COLORS = {
  PLANNED: '#5B7A99',
  IN_PROGRESS: '#D9A441',
  REVIEWED: '#8B6CD9',
  DONE: '#4F9B72',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#14161C',
      paper: '#1C1F28',
    },
    primary: {
      main: '#6C63FF',
    },
    text: {
      primary: '#ECEDEF',
      secondary: '#8B8FA3',
    },
    divider: '#2A2E3A',
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // прибирає дефолтний MUI dark-mode градієнт на Paper
          border: '1px solid #2A2E3A',
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #2A2E3A',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});