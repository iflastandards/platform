import { createTheme } from '@mui/material/styles';

// OMR25 Color Scheme from mockups
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E', // Primary teal from mockups
      light: '#14b8a6',
      dark: '#065f46',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1e40af', // Blue accent from mockups
      light: '#3b82f6',
      dark: '#1e3a8a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Dark text for headings
      secondary: '#374151', // Regular body text
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#92400e',
      contrastText: '#ffffff',
    },
    info: {
      main: '#1e40af',
      light: '#3b82f6',
      dark: '#1e3a8a',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#065f46',
      contrastText: '#ffffff',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#111827',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#111827',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#111827',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#111827',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#111827',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#111827',
    },
    body1: {
      color: '#374151',
    },
    body2: {
      color: '#6b7280',
    },
  },
  shape: {
    borderRadius: 5,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 5,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: '#0F766E',
          '&:hover': {
            backgroundColor: '#065f46',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        colorSuccess: {
          backgroundColor: '#dcfce7',
          color: '#065f46',
        },
        colorInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
        },
        colorWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
        },
        colorError: {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e5e7eb',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #e5e7eb',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#d1d5db',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0F766E',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Dark theme variant
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#14b8a6',
      light: '#5eead4',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#60a5fa',
      light: '#93bbfc',
      dark: '#3b82f6',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#ef4444',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    info: {
      main: '#60a5fa',
      light: '#93bbfc',
      dark: '#3b82f6',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#10b981',
    },
    divider: '#334155',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      color: '#f1f5f9',
    },
    h2: {
      color: '#f1f5f9',
    },
    h3: {
      color: '#f1f5f9',
    },
    h4: {
      color: '#f1f5f9',
    },
    h5: {
      color: '#f1f5f9',
    },
    h6: {
      color: '#f1f5f9',
    },
  },
  shape: {
    borderRadius: 5,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 5,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          borderRadius: 8,
          border: '1px solid #334155',
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorSuccess: {
          backgroundColor: '#065f46',
          color: '#6ee7b7',
        },
        colorInfo: {
          backgroundColor: '#1e3a8a',
          color: '#93bbfc',
        },
        colorWarning: {
          backgroundColor: '#78350f',
          color: '#fcd34d',
        },
        colorError: {
          backgroundColor: '#7f1d1d',
          color: '#fca5a5',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #334155',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #334155',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#1e293b',
            borderBottom: '2px solid #334155',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #334155',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#334155',
            },
            '&:hover fieldset': {
              borderColor: '#475569',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#14b8a6',
            },
          },
        },
      },
    },
  },
});