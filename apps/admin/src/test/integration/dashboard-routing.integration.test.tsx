/**
 * @integration @ui @navigation @high-priority @dashboard
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteManagementDashboardLayout } from '@/components/dashboard/site-management/SiteManagementDashboardLayout';
import { SiteOverviewPage } from '@/components/dashboard/site-management/SiteOverviewPage';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/isbd',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the navigation components
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
  }));

describe.skip('Dashboard Routing @integration @dashboard @navigation @high-priority', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactElement) => render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );

  it('should render site management dashboard layout with navigation', async () => {
    renderWithProviders(
      <SiteManagementDashboardLayout siteKey="isbd">
        <div>Test Content</div>
      </SiteManagementDashboardLayout>,
    );

    // Check that the header is rendered
    expect(screen.getByText('ISBD Management')).toBeInTheDocument();

    // Check that the test content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Check that breadcrumb navigation is present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('ISBD')).toBeInTheDocument();
  });

  it('should render site overview page with data', async () => {
    renderWithProviders(<SiteOverviewPage siteKey="isbd" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that site status information is displayed
    expect(screen.getByText('Site Status')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity - ISBD')).toBeInTheDocument();
    expect(screen.getByText('Team Overview')).toBeInTheDocument();

    // Check that the site management alert is shown for non-special sites
    expect(screen.getByText('Site Management')).toBeInTheDocument();
  });

  it('should handle special case sites correctly', async () => {
    renderWithProviders(<SiteOverviewPage siteKey="portal" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that special case warning is displayed
    expect(screen.getByText('Special Management Area')).toBeInTheDocument();
    expect(
      screen.getByText(/The Portal is not a standard namespace/),
    ).toBeInTheDocument();

    // Check that system-specific labels are used
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('System Overview')).toBeInTheDocument();
  });

  it('should render navigation links with correct hrefs', () => {
    renderWithProviders(
      <SiteManagementDashboardLayout siteKey="isbd">
        <div>Test Content</div>
      </SiteManagementDashboardLayout>,
    );

    // Check that navigation links have correct hrefs (get first occurrence)
    const overviewLinks = screen.getAllByRole('link', { name: /Overview/ });
    expect(overviewLinks[0]).toHaveAttribute('href', '/dashboard/isbd');

    const contentLinks = screen.getAllByRole('link', {
      name: /Content Management/,
    });
    expect(contentLinks[0]).toHaveAttribute('href', '/dashboard/isbd/content');

    const rdfLinks = screen.getAllByRole('link', {
      name: /RDF & Vocabularies/,
    });
    expect(rdfLinks[0]).toHaveAttribute('href', '/dashboard/isbd/rdf');

    const workflowLinks = screen.getAllByRole('link', {
      name: /Review & Workflow/,
    });
    expect(workflowLinks[0]).toHaveAttribute(
      'href',
      '/dashboard/isbd/workflow',
    );

    const teamLinks = screen.getAllByRole('link', { name: /Team Management/ });
    expect(teamLinks[0]).toHaveAttribute('href', '/dashboard/isbd/team');

    const settingsLinks = screen.getAllByRole('link', { name: /Settings/ });
    expect(settingsLinks[0]).toHaveAttribute(
      'href',
      '/dashboard/isbd/settings',
    );
  });

  it('should display badges for navigation items', () => {
    renderWithProviders(
      <SiteManagementDashboardLayout siteKey="isbd">
        <div>Test Content</div>
      </SiteManagementDashboardLayout>,
    );

    // Check that badges are displayed (these are mock values from the navigation config)
    // Using getAllByText to handle duplicates from mobile/desktop versions
    expect(screen.getAllByText('12')).toHaveLength(2); // Content Management badge
    expect(screen.getAllByText('5')).toHaveLength(2); // Review & Workflow badge
    expect(screen.getAllByText('8')).toHaveLength(2); // Team Management badge
    expect(screen.getAllByText('3')).toHaveLength(2); // GitHub badge
  });
});
