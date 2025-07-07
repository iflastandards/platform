import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import * as useAdminSessionModule from '../../hooks/useAdminSession';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Wrap component with MUI theme for testing
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('DashboardLayout', () => {
  const mockUseAdminSession = vi.spyOn(useAdminSessionModule, 'useAdminSession');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout Structure', () => {
    it('renders with correct title in app bar', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
      // Check it's in the AppBar specifically
      const appBar = screen.getByRole('banner');
      expect(appBar).toHaveTextContent('Test Dashboard');
    });

    it('displays username in app bar', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'johndoe',
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Welcome, johndoe')).toBeInTheDocument();
    });

    it('renders children content in main container', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div data-testid="child-content">Dashboard Content</div>
          <button>Action Button</button>
        </DashboardLayout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });
  });

  describe('User Information Display', () => {
    it('handles null username gracefully', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: null,
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      // Should not show welcome message if username is null
      expect(screen.queryByText(/Welcome,/)).not.toBeInTheDocument();
    });

    it('handles empty username gracefully', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: '',
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      // Should not show welcome message if username is empty
      expect(screen.queryByText(/Welcome,/)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct container maxWidth', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      const { container } = renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      // MUI Container with maxWidth="xl" should be present
      const muiContainer = container.querySelector('.MuiContainer-maxWidthXl');
      expect(muiContainer).toBeInTheDocument();
    });

    it('applies correct spacing styles', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      const { container } = renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      // Check for margin top and bottom classes
      const muiContainer = container.querySelector('.MuiContainer-root');
      expect(muiContainer).toHaveClass('MuiContainer-root');
    });
  });

  describe('AppBar Functionality', () => {
    it('renders static AppBar', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      const appBar = screen.getByRole('banner');
      expect(appBar).toBeInTheDocument();
      expect(appBar.querySelector('.MuiAppBar-positionStatic')).toBeInTheDocument();
    });

    it('uses flex layout for title and username', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      // Title should have flexGrow: 1 to push username to the right
      const titleElement = screen.getByText('Test Dashboard');
      const titleParent = titleElement.closest('.MuiTypography-root');
      expect(titleParent).toHaveStyle({ flexGrow: '1' });
    });
  });

  describe('Edge Cases', () => {
    it('renders with very long title', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      const longTitle = 'This is a very long dashboard title that might cause layout issues';
      
      renderWithTheme(
        <DashboardLayout title={longTitle}>
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('renders with special characters in title', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      const specialTitle = 'Dashboard & Settings < Configuration >';
      
      renderWithTheme(
        <DashboardLayout title={specialTitle}>
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('renders empty children without error', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['admin'],
        loading: false,
        username: 'testuser',
      });

      const { container } = renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          {null}
        </DashboardLayout>
      );

      expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
    });
  });
});