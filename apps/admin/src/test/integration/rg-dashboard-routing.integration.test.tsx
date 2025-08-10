import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RGOverviewPage } from '@/components/dashboard/rg/RGOverviewPage';
import { RGProjectsPage } from '@/components/dashboard/rg/RGProjectsPage';
import { RGNamespacesPage } from '@/components/dashboard/rg/RGNamespacesPage';
import { RGTeamPage } from '@/components/dashboard/rg/RGTeamPage';
import { RGActivityPage } from '@/components/dashboard/rg/RGActivityPage';

describe('Review Group Dashboard Routing @integration @dashboard @admin @high-priority', () => {
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

  describe('RG Overview Page', () => {
    it('should render the RG overview page with stats and namespaces', () => {
      renderWithProviders(<RGOverviewPage />);
      
      // Check for stats cards
      expect(screen.getAllByText('My Namespaces')).toHaveLength(2); // Stats card + section heading
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should display quick action buttons', () => {
      renderWithProviders(<RGOverviewPage />);
      
      expect(screen.getByRole('link', { name: /Start a new project/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Invite a team member/i })).toBeInTheDocument();
    });
  });

  describe('RG Projects Page', () => {
    it('should render the projects page', () => {
      renderWithProviders(<RGProjectsPage />);
      
      expect(screen.getByText('My Projects')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Start New Project/i })).toBeInTheDocument();
    });
  });

  describe('RG Namespaces Page', () => {
    it('should render the namespaces page', () => {
      renderWithProviders(<RGNamespacesPage />);
      
      expect(screen.getByText('My Namespaces')).toBeInTheDocument();
      expect(screen.getByText('Manage vocabularies and namespaces under your review group')).toBeInTheDocument();
    });
  });

  describe('RG Team Page', () => {
    it('should render the team members page', () => {
      renderWithProviders(<RGTeamPage />);
      
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Invite Team Member/i })).toBeInTheDocument();
      expect(screen.getByText('ISBD Review Group Team')).toBeInTheDocument();
    });
  });

  describe('RG Activity Page', () => {
    it('should render the activity log page', () => {
      renderWithProviders(<RGActivityPage />);
      
      expect(screen.getByText('Activity Log')).toBeInTheDocument();
      expect(screen.getByText('Recent activities in your review group')).toBeInTheDocument();
      expect(screen.getByText('ISBD Review Group Activity')).toBeInTheDocument();
    });
  });
});
