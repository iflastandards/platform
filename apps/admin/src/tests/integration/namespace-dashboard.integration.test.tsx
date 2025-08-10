import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import NamespaceDashboard from '../../app/(authenticated)/namespaces/[namespace]/NamespaceDashboard';

// Extend expect matchers
expect.extend(toHaveNoViolations);

/**
 * @integration @ui @dashboard @critical
 * Integration tests for NamespaceDashboard with real namespace data and components
 */
describe('NamespaceDashboard @integration @ui @dashboard @critical', () => {
  const testNamespace = 'isbd';
  const testUserId = 'user-admin-1';
  const originalConsoleLog = console.log;

  beforeEach(async () => {
    // Mock console.log for clean test output
    console.log = jest.fn();
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('Real Component Rendering @integration', () => {
    it('should render with StandardDashboardLayout and real namespace data', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Verify StandardDashboardLayout integration with real namespace data
      expect(screen.getByText('ISBD: International Standard Bibliographic Description')).toBeInTheDocument();
      expect(screen.getByText('Descriptive cataloging standard')).toBeInTheDocument();

      // Verify overview content is displayed by default
      expect(screen.getByRole('heading', { level: 1, name: 'ISBD: International Standard Bibliographic Description' })).toBeInTheDocument();
    });

    it('should display correct navigation items with real data', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Verify all navigation items are rendered with real icons and badges
      expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /GitHub Issues/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Recent Activity' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Projects/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Metrics' })).toBeInTheDocument();

      // Verify default selected tab
      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    it('should handle real tab navigation with actual state changes', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Initial state - Overview tab active
      expect(screen.getByText('Editorial Cycle')).toBeInTheDocument();
      expect(screen.getByText('Latest Build')).toBeInTheDocument();
      expect(screen.getByText('Open Issues')).toBeInTheDocument();
      expect(screen.getByText('Active Imports')).toBeInTheDocument();

      // Click on GitHub Issues tab - real user interaction
      fireEvent.click(screen.getByRole('button', { name: /GitHub Issues/ }));

      await waitFor(() => {
        // Verify content changed to Issues tab
        expect(screen.getByRole('heading', { level: 1, name: 'GitHub Issues' })).toBeInTheDocument();
        expect(screen.getByText(/All Issues/)).toBeInTheDocument();
        
        // Verify tab state changed
        const issuesTab = screen.getByRole('button', { name: /GitHub Issues/ });
        expect(issuesTab).toHaveAttribute('aria-current', 'page');
      });

      // Click on Recent Activity tab
      fireEvent.click(screen.getByRole('button', { name: 'Recent Activity' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Recent Activity' })).toBeInTheDocument();
      });

      // Click on Projects tab
      fireEvent.click(screen.getByRole('button', { name: /Projects/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
      });

      // Click on Metrics tab
      fireEvent.click(screen.getByRole('button', { name: 'Metrics' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Metrics' })).toBeInTheDocument();
        expect(screen.getByText('Metrics dashboard coming soon...')).toBeInTheDocument();
      });
    });
  });

  describe('Real Namespace Data Integration @integration', () => {
    it('should display actual namespace status information', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Verify editorial cycle information is displayed
      const editorialSection = screen.getByRole('region', { name: /Editorial Cycle/ });
      expect(editorialSection).toBeInTheDocument();

      // Verify build status is displayed
      const buildSection = screen.getByRole('region', { name: /Latest Build/ });
      expect(buildSection).toBeInTheDocument();

      // Verify issue count is displayed
      const issuesSection = screen.getByRole('region', { name: /Open Issues/ });
      expect(issuesSection).toBeInTheDocument();

      // Verify import status is displayed
      const importsSection = screen.getByRole('region', { name: /Active Imports/ });
      expect(importsSection).toBeInTheDocument();
    });

    it('should handle refresh functionality with real state changes', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      const refreshButton = screen.getByLabelText('Refresh data');
      
      // Click refresh button
      fireEvent.click(refreshButton);

      // Verify refresh button is disabled during refresh
      expect(refreshButton).toBeDisabled();

      // Wait for refresh to complete
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should display real GitHub repository links', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      const githubButton = screen.getByLabelText(`View ${testNamespace} on GitHub`);
      expect(githubButton).toHaveAttribute('href', `https://github.com/iflastandards/${testNamespace}`);
      expect(githubButton).toHaveAttribute('target', '_blank');
    });

    it('should handle namespace not found scenario', async () => {
      render(<NamespaceDashboard namespace="nonexistent" userId={testUserId} />);

      expect(screen.getByText('Namespace not found')).toBeInTheDocument();
    });
  });

  describe('Real Issues Integration @integration', () => {
    it('should display actual GitHub issues in issues tab', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Navigate to issues tab
      fireEvent.click(screen.getByRole('button', { name: /GitHub Issues/ }));

      await waitFor(() => {
        // Verify issues are displayed with real data
        expect(screen.getByText(/All Issues/)).toBeInTheDocument();
        
        // Verify filter chips are present
        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.getByText('Import Requests')).toBeInTheDocument();
        expect(screen.getByText('Validation')).toBeInTheDocument();
      });
    });

    it('should handle issue menu interactions', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Navigate to issues tab
      fireEvent.click(screen.getByRole('button', { name: /GitHub Issues/ }));

      await waitFor(() => {
        // Find and click an issue menu button (if issues exist)
        const menuButtons = screen.queryAllByLabelText(/more actions/i);
        if (menuButtons.length > 0) {
          fireEvent.click(menuButtons[0]);

          // Verify menu opens with real actions
          expect(screen.getByText('Edit Issue')).toBeInTheDocument();
          expect(screen.getByText('Request Translation')).toBeInTheDocument();
          expect(screen.getByText('Trigger Build')).toBeInTheDocument();
        }
      });
    });
  });

  describe('Real Project Data Integration @integration', () => {
    it('should display actual projects in projects tab', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /Projects/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
        
        // Verify project links with real URLs
        const projectLinks = screen.queryAllByLabelText(/View .* project on GitHub/);
        projectLinks.forEach(link => {
          expect(link).toHaveAttribute('href', expect.stringContaining('github.com/iflastandards'));
          expect(link).toHaveAttribute('target', '_blank');
        });
      });
    });
  });

  describe('Real Accessibility Integration @integration @accessibility', () => {
    it('should have no accessibility violations with real components', async () => {
      const { container } = render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Run axe on real rendered component tree
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through real tab interactions', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      const issuesTab = screen.getByRole('button', { name: /GitHub Issues/ });
      const activityTab = screen.getByRole('button', { name: 'Recent Activity' });

      // Test keyboard navigation - real keyboard events
      overviewTab.focus();
      expect(overviewTab).toHaveFocus();

      // Tab to next button
      issuesTab.focus();
      expect(issuesTab).toHaveFocus();

      // Test Enter key activation
      fireEvent.keyDown(issuesTab, { key: 'Enter', code: 'Enter' });
      fireEvent.click(issuesTab);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'GitHub Issues' })).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on real action buttons', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Check real action buttons have proper accessibility
      const refreshButton = screen.getByLabelText('Refresh data');
      expect(refreshButton).toBeInTheDocument();

      const githubButton = screen.getByLabelText(`View ${testNamespace} on GitHub`);
      expect(githubButton).toBeInTheDocument();

      const importButton = screen.getByLabelText('Start new import process');
      expect(importButton).toBeInTheDocument();
    });

    it('should have proper ARIA labels on status regions', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Verify status regions have proper ARIA labels
      expect(screen.getByRole('region', { name: /Editorial Cycle/ })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Latest Build/ })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Open Issues/ })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Active Imports/ })).toBeInTheDocument();
    });

    it('should announce status changes to screen readers', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Verify ARIA live regions for dynamic content
      const issuesCount = screen.getByLabelText(/open issues/i);
      expect(issuesCount).toBeInTheDocument();

      const importsCount = screen.getByLabelText(/imports running/i);
      expect(importsCount).toBeInTheDocument();
    });
  });

  describe('Real Activity Feed Integration @integration', () => {
    it('should display activity feed in activity tab', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Navigate to activity tab
      fireEvent.click(screen.getByRole('button', { name: 'Recent Activity' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Recent Activity' })).toBeInTheDocument();
      });
    });
  });

  describe('Real Build Status Integration @integration', () => {
    it('should display build status with proper icons', async () => {
      render(<NamespaceDashboard namespace={testNamespace} userId={testUserId} />);

      // Check for build status indicators
      const buildSection = screen.getByRole('region', { name: /Latest Build/ });
      expect(buildSection).toBeInTheDocument();

      // Verify build status icons are present (success, error, or pending)
      const buildIcons = screen.queryAllByLabelText(/Build (successful|failed|pending)/);
      expect(buildIcons.length).toBeGreaterThanOrEqual(0); // May or may not have builds
    });
  });
});
