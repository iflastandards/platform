import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import * as useAdminSessionModule from '../../hooks/useAdminSession';

// Mock the config module
vi.mock('../../config/siteConfig', () => ({
  getAdminPortalConfigAuto: () => ({
    signinUrl: 'http://localhost:3007/auth/signin',
  }),
}));

describe('ProtectedRoute', () => {
  const mockUseAdminSession = vi.spyOn(useAdminSessionModule, 'useAdminSession');
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as Location;
  });

  describe('Loading States', () => {
    it('shows loading spinner while checking authentication', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: false,
        teams: [],
        loading: true,
        username: null,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('redirects to login when unauthenticated', async () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: false,
        teams: [],
        loading: false,
        username: null,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(window.location.href).toContain('/auth/signin');
        expect(window.location.href).toContain('returnUrl=%2F');
      });
    });

    it('preserves current path in returnUrl', async () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: false,
        teams: [],
        loading: false,
        username: null,
      });

      // Mock current pathname
      Object.defineProperty(window, 'location', {
        value: { 
          href: '',
          pathname: '/dashboard/special' 
        },
        writable: true,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(window.location.href).toContain('returnUrl=%2Fdashboard%2Fspecial');
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('shows access denied when user lacks required roles', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['some-team', 'another-team'],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/don't have permission/i);
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows access denied when user lacks required teams', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['user-team'],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute requiredTeams={['isbd-admin', 'lrm-admin']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/don't have permission/i);
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('grants access when user has at least one required role', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['editor', 'admin'],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('grants access when user has at least one required team', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['isbd-editor', 'lrm-admin'],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute requiredTeams={['lrm-admin', 'frbr-admin']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('grants access when no specific roles or teams are required', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['any-team'],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty teams array gracefully', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: [],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('handles null teams gracefully', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: null as any,
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute requiredRoles={['admin']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/don't have permission/i);
    });

    it('handles both roles and teams requirements', () => {
      mockUseAdminSession.mockReturnValue({
        isAuthenticated: true,
        teams: ['isbd-admin', 'superuser'],
        loading: false,
        username: 'testuser',
      });

      render(
        <ProtectedRoute 
          requiredRoles={['admin', 'superuser']}
          requiredTeams={['isbd-admin', 'lrm-admin']}
        >
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Should pass because user has 'superuser' role and 'isbd-admin' team
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});