'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const themeConfig = {
    algorithm:
      mode === 'dark'
        ? [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm]
        : [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      // Reduce spacing globally
      padding: 8,
      paddingXS: 4,
      paddingSM: 8,
      paddingLG: 16,
      paddingXL: 20,
      margin: 12,
      marginXS: 4,
      marginSM: 8,
      marginLG: 16,
      marginXL: 20,
      // Reduce control heights
      controlHeight: 28,
      controlHeightSM: 24,
      controlHeightLG: 36,
    },
    components: {
      Layout: {
        headerHeight: 48,
        headerPadding: '0 16px',
      },
      Table: {
        cellPaddingBlock: 8,
        cellPaddingInline: 12,
        headerBg: mode === 'dark' ? '#1f1f1f' : '#fafafa',
      },
      Button: {
        paddingBlock: 4,
        paddingInline: 12,
      },
      Input: {
        paddingBlock: 4,
        paddingInline: 8,
      },
      Select: {
        controlHeight: 28,
      },
      Menu: {
        itemHeight: 36,
        horizontalItemSelectedBg: 'transparent',
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
