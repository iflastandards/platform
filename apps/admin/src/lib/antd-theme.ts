import { theme, type ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Primary color
    colorPrimary: '#0066CC',
    colorLink: '#0066CC',
    
    // Font settings
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    
    // Border radius
    borderRadius: 6,
    
    // Component specific tokens
    controlHeight: 36,
    
    // Colors
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Layout
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    
    // Text colors
    colorTextBase: '#000000',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
  },
  algorithm: theme.defaultAlgorithm,
};

export const darkTheme: ThemeConfig = {
  ...antdTheme,
  algorithm: theme.darkAlgorithm,
  token: {
    ...antdTheme.token,
    colorBgContainer: '#141414',
    colorBgLayout: '#000000',
  },
};