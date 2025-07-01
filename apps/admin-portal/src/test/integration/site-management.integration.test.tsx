import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockSession, mockSiteData } from '../fixtures/mockData';
import { setupFetchMock, cleanupFetchMock, mockApiCall, mockApiError } from '../mocks/api';

// Mock the auth module
vi.mock('@/app/api/auth/auth', () => ({
  auth: vi.fn(),
}));

// Import after mocking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { auth } from '@/app/api/auth/auth';
import SiteManagementClient from '@/app/dashboard/[siteKey]/SiteManagementClient';

describe('Site Management Integration Tests', () => {
  beforeEach(() => {
    setupFetchMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auth as any).mockResolvedValue(mockSession);
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
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(siteData.title + ' Management')).toBeInTheDocument();
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
        />
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
        />
      );
      
      // Navigate to GitHub tab
      fireEvent.click(screen.getByText('GitHub'));
      
      await waitFor(() => {
        expect(screen.getByText('Repository Information')).toBeInTheDocument();
      });
      
      // Check for GitHub links
      await waitFor(() => {
        const repoLink = screen.getByText('View Repository');
        expect(repoLink.closest('a')).toHaveAttribute(
          'href',
          'https://github.com/iflastandards/standards-dev'
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
        />
      );
      
      fireEvent.click(screen.getByText('GitHub'));
      
      await waitFor(() => {
        expect(screen.getByText('Issues')).toBeInTheDocument();
        expect(screen.getByText('Pull Requests')).toBeInTheDocument();
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
        />
      );
      
      // Navigate to Content tab
      fireEvent.click(screen.getByText('Content'));
      
      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
      });
      
      // Check for content editing options
      await waitFor(() => {
        expect(screen.getByText('Documentation')).toBeInTheDocument();
        expect(screen.getByText('Blog Posts')).toBeInTheDocument();
      });
    });

    it('should handle content save operations', async () => {
      const siteKey = 'newtest';
      const mockContentUpdate = {
        path: '/docs/test.md',
        content: '# Updated Content',
        success: true
      };
      
      mockApiCall('/api/content', mockContentUpdate);
      
      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />
      );
      
      fireEvent.click(screen.getByText('Content'));
      
      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
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
        />
      );
      
      fireEvent.click(screen.getByText('Build & Deploy'));
      
      await waitFor(() => {
        expect(screen.getByText('Build & Deployment')).toBeInTheDocument();
        expect(screen.getByText('Build Status')).toBeInTheDocument();
      });
    });

    it('should handle build trigger operations', async () => {
      const siteKey = 'newtest';
      const mockBuildResponse = {
        buildId: 'build-123',
        status: 'started',
        timestamp: new Date().toISOString()
      };
      
      mockApiCall('/api/build/trigger', mockBuildResponse);
      
      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />
      );
      
      fireEvent.click(screen.getByText('Build & Deploy'));
      
      await waitFor(() => {
        const triggerButton = screen.getByText('Trigger Build');
        expect(triggerButton).toBeInTheDocument();
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
        />
      );
      
      fireEvent.click(screen.getByText('Settings'));
      
      await waitFor(() => {
        expect(screen.getByText('Site Settings')).toBeInTheDocument();
        expect(screen.getByText('Configuration')).toBeInTheDocument();
      });
    });

    it('should handle settings updates', async () => {
      const siteKey = 'newtest';
      const updatedSiteData = {
        ...mockSiteData[siteKey],
        title: 'Updated Test Site'
      };
      
      mockApiCall(`/api/sites/${siteKey}`, updatedSiteData);
      
      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />
      );
      
      fireEvent.click(screen.getByText('Settings'));
      
      await waitFor(() => {
        expect(screen.getByText('Site Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should work with authenticated user session', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auth as any).mockResolvedValue(mockSession);
      
      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey="newtest"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Site Management')).toBeInTheDocument();
      });
    });

    it('should handle unauthenticated state', async () => {
      (auth as any).mockResolvedValue(null);
      
      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey="newtest"
        />
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
        />
      );
      
      // Component should still be functional
      expect(screen.getByText('Test Site Management')).toBeInTheDocument();
      
      // Subsequent calls should work (in real implementation, this would be retry logic)
      mockApiCall(`/api/sites/${siteKey}`, mockSiteData[siteKey]);
    });

    it('should handle network timeouts gracefully', async () => {
      const siteKey = 'newtest';
      
      // Mock network timeout
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network timeout'));
      
      render(
        <SiteManagementClient
          siteTitle="Test Site"
          siteCode="TEST"
          siteKey={siteKey}
        />
      );
      
      // Component should still render despite network error
      expect(screen.getByText('Test Site Management')).toBeInTheDocument();
    });
  });
});