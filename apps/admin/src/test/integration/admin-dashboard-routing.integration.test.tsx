import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminOverviewPage } from '@/components/dashboard/admin/AdminOverviewPage';
import { AdminUsersPage } from '@/components/dashboard/admin/AdminUsersPage';
import { AdminProjectsPage } from '@/components/dashboard/admin/AdminProjectsPage';
import { AdminActivityPage } from '@/components/dashboard/admin/AdminActivityPage';

describe('Admin Dashboard Routing @integration @dashboard @admin @high-priority', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Admin Overview Page', () => {
    it('should render the admin overview page with stats and activity', () => {
      renderWithProviders(<AdminOverviewPage />);
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('System overview and key metrics')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('Total Vocabularies')).toBeInTheDocument();
      expect(screen.getByText('Recent System Activity')).toBeInTheDocument();
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should display quick action buttons', () => {
      renderWithProviders(<AdminOverviewPage />);
      
      expect(screen.getByRole('link', { name: /Charter a new project/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Adopt a spreadsheet/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Invite a new user/i })).toBeInTheDocument();
    });
  });

  describe('Admin Users Page', () => {
    it('should render the users management page', () => {
      renderWithProviders(<AdminUsersPage />);
      
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Invite User/i })).toBeInTheDocument();
      expect(screen.getByText('All Users')).toBeInTheDocument();
    });
  });

  describe('Admin Projects Page', () => {
    it('should render the projects management page', () => {
      renderWithProviders(<AdminProjectsPage />);
      
      expect(screen.getByText('Project Management')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Charter New Project/i })).toBeInTheDocument();
    });
  });

  describe('Admin Activity Page', () => {
    it('should render the activity log page', () => {
      renderWithProviders(<AdminActivityPage />);
      
      expect(screen.getByText('System Activity Log')).toBeInTheDocument();
      expect(screen.getByText('Monitor all system activities and events')).toBeInTheDocument();
      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    });

    it('should have a filter dropdown', () => {
      renderWithProviders(<AdminActivityPage />);
      
      expect(screen.getByRole('combobox', { name: /filter/i })).toBeInTheDocument();
    });
  });
});
