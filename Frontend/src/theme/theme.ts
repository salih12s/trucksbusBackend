import { createTheme } from '@mui/material/styles';

// Brand colors
const LOGO_RED = '#E14D43';
const PRIMARY_DARK = '#2D3748';

export const theme = createTheme({
  palette: {
    primary: { 
      main: LOGO_RED,
      dark: '#D34237',
      light: '#E85C52'
    },
    background: { 
      default: '#FFFFFF', 
      paper: '#FFFFFF' 
    },
    text: { 
      primary: '#111827', 
      secondary: '#6B7280' 
    },
    divider: '#E5E7EB',
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    }
  },
  shape: { 
    borderRadius: 16 
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { fontWeight: 700, textTransform: 'none' as const },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: PRIMARY_DARK,
          overflow: 'visible',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
          border: '1px solid #EEF2F7',
        },
        elevation2: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 999,
          textTransform: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:focus-visible': {
            outline: `2px solid ${LOGO_RED}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          backgroundColor: LOGO_RED,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#D34237',
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px rgba(225, 77, 67, 0.3)`,
          },
        },
        outlined: {
          borderColor: '#E5E7EB',
          color: '#374151',
          '&:hover': {
            borderColor: LOGO_RED,
            backgroundColor: `rgba(225, 77, 67, 0.04)`,
            color: LOGO_RED,
          },
        },
        text: {
          color: '#6B7280',
          '&:hover': {
            backgroundColor: 'rgba(107, 114, 128, 0.08)',
            color: '#374151',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: `rgba(225, 77, 67, 0.12)`,
          color: '#D34237',
          '&:hover': {
            backgroundColor: `rgba(225, 77, 67, 0.18)`,
          },
        },
        outlined: {
          borderColor: '#E5E7EB',
          color: '#6B7280',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #EEF2F7',
          borderRadius: 16,
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
          },
          '&:focus-visible': {
            outline: `2px solid ${LOGO_RED}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#E5E7EB',
            },
            '&:hover fieldset': {
              borderColor: '#D1D5DB',
            },
            '&.Mui-focused fieldset': {
              borderColor: LOGO_RED,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          cursor: 'text',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: LOGO_RED,
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '0.65rem',
          minWidth: 18,
          height: 18,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E5E7EB',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: `rgba(225, 77, 67, 0.08)`,
            borderLeft: `3px solid ${LOGO_RED}`,
            '&:hover': {
              backgroundColor: `rgba(225, 77, 67, 0.12)`,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

export default theme;
