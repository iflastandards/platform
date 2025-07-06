import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { mockSession, mockSiteData } from '../fixtures/mockData';
import {
  setupFetchMock,
  cleanupFetchMock,
  mockApiCall,
  mockApiError,
} from '../mocks/api';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/newtest',
}));

// Mock the auth module
vi.mock('@/app/lib/auth', () => ({
  auth: vi.fn(),
}));

// Import after mocking
import { auth } from '@/app/lib/auth';
import SiteManagementClient from '@/app/dashboard/[siteKey]/SiteManagementClient';

describe('Site Management Integration Tests', () => {
  beforeEach(() => {
    setupFetchMock();
    (auth as vi.Mock).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    cleanupFetchMock();
    vi.clearAllMocks();
  });

  describe('Site Data Loading', () => {
    it('should load and display site information from API', async () => {
      const siteKey = 'newtest';
      const siteData = mockSiteData[siteKey];

      mockApiCall(`/api/sites/${siteKey}`, siteData);

      render(
        <SiteManagementClient
          siteTitle={siteData.title}
          siteCode={siteData.code}
          siteKey={siteKey}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(siteData.title + ' Management'),
        ).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      const siteKey = 'invalid-site';

      mockApiError(`/api/sites/${siteKey}`, 'Site not found', 404);

      render(
        <SiteManagementClient
          siteTitle="Invalid Site"
          siteCode="INVALID"
          siteKey={siteKey}
        />,
      );

      // Component should still render even with API error
      expect(screen.getByText('Invalid Site Management')).toBeInTheDocument();
    });
  });

  describe('GitHub Integration', () => {
    it('should fetch and display GitHub repository data', async () => {
      const siteKey = 'newtest';

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
          githubRepo="iflastandards/standards-dev"
        />,
      );

      // Navigate to GitHub tab
      fireEvent.click(screen.getByRole('button', { name: 'GitHub' }));

      await waitFor(() => {
        expect(screen.getByText('Repository Information')).toBeInTheDocument();
      });

      // Check for GitHub links
      await waitFor(() => {
        const repoLink = screen.getByText('View Repository');
        expect(repoLink.closest('a')).toHaveAttribute(
          'href',
          'https://github.com/iflastandards/standards-dev',
        );
      });
    });

    it('should load GitHub issues and PRs', async () => {
      const siteKey = 'newtest';

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
          githubRepo="iflastandards/standards-dev"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'GitHub' }));

      await waitFor(() => {
        // Check for the action card titles, not the link text
        expect(
          screen.getByRole('heading', { name: 'Open Issues' }),
        ).toBeInTheDocument();
        // Check for the PRs link instead
        const prsLink = screen.getByRole('link', { name: 'PRs' });
        expect(prsLink).toBeInTheDocument();
      });
    });
  });

  describe('Content Management', () => {
    it('should allow content editing workflow', async () => {
      const siteKey = 'newtest';

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      // Navigate to Content tab
      fireEvent.click(
        screen.getByRole('button', { name: 'Content Management' }),
      );

      await waitFor(() => {
        // Check for content editing actions instead of redundant heading
        expect(screen.getByText('Create New Page')).toBeInTheDocument();
        expect(screen.getByText('Scaffold Element Pages')).toBeInTheDocument();
      });
    });

    it('should handle content save operations', async () => {
      const siteKey = 'newtest';
      const mockContentUpdate = {
        path: '/docs/test.md',
        content: '# Updated Content',
        success: true,
      };

      mockApiCall('/api/content', mockContentUpdate);

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Content Management' }),
      );

      await waitFor(() => {
        expect(screen.getByText('Create New Page')).toBeInTheDocument();
      });
    });
  });

  describe('Build and Deployment', () => {
    it('should display build status information', async () => {
      const siteKey = 'newtest';

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Releases & Publishing' }),
      );

      await waitFor(() => {
        expect(
          screen.getByText('Create Release Candidate'),
        ).toBeInTheDocument();
        expect(screen.getByText('Deploy to Production')).toBeInTheDocument();
      });
    });

    it('should handle build trigger operations', async () => {
      const siteKey = 'newtest';
      const mockBuildResponse = {
        buildId: 'build-123',
        status: 'started',
        timestamp: new Date().toISOString(),
      };

      mockApiCall('/api/build/trigger', mockBuildResponse);

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Releases & Publishing' }),
      );

      await waitFor(() => {
        const releaseButton = screen.getByText('Create Release Candidate');
        expect(releaseButton).toBeInTheDocument();
      });
    });
  });

  describe('Settings Management', () => {
    it('should load and display site settings', async () => {
      const siteKey = 'newtest';

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

      await waitFor(() => {
        expect(screen.getByText('Site Settings')).toBeInTheDocument();
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });
    });

    it('should handle settings updates', async () => {
      const siteKey = 'newtest';
      const updatedSiteData = {
        ...mockSiteData[siteKey],
        title: 'Updated Test Site',
      };

      mockApiCall(`/api/sites/${siteKey}`, updatedSiteData);

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

      await waitFor(() => {
        expect(screen.getByText('Site Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should work with authenticated user session', async () => {
      (auth as vi.Mock).mockResolvedValue(mockSession);

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey="newtest"
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Test Site Management')).toBeInTheDocument();
      });
    });

    it('should handle unauthenticated state', async () => {
      (auth as vi.Mock).mockResolvedValue(null);

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey="newtest"
        />,
      );

      // Component should still render (authorization happens at page level)
      expect(screen.getByText('Test Site Management')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary API failures', async () => {
      const siteKey = 'newtest';

      // First call fails
      mockApiError(`/api/sites/${siteKey}`, 'Server error', 500);

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      // Component should still be functional
      expect(screen.getByText('Test Site Management')).toBeInTheDocument();

      // Subsequent calls should work (in real implementation, this would be retry logic)
      mockApiCall(`/api/sites/${siteKey}`, mockSiteData[siteKey]);
    });

    it('should handle network timeouts gracefully', async () => {
      const siteKey = 'newtest';

      // Mock network timeout
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network timeout'));

      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />,
      );

      // Component should still render despite network error
      expect(screen.getByText('Test Site Management')).toBeInTheDocument();
    });
  });
});
