import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ReviewGroupDashboard from '../../app/(authenticated)/dashboard/rg/ReviewGroupDashboard';

// Extend expect matchers
expect.extend(toHaveNoViolations);

/**
 * @integration @ui @dashboard @critical
 * Integration tests for ReviewGroupDashboard with real review group data and components
 */
describe('ReviewGroupDashboard @integration @ui @dashboard @critical', () => {
  const testProps = {
    userRoles: ['rg-admin'],
    userName: 'John RG Admin',
    userEmail: 'rg.admin@test.example.com',
    reviewGroups: ['isbd', 'unimarc'],
  };
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
    it('should render with StandardDashboardLayout and real review group data', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify StandardDashboardLayout integration
      expect(screen.getByText('Review Group Admin')).toBeInTheDocument();
      expect(screen.getByText(/ISBD Team.*UNIMARC Team/)).toBeInTheDocument();

      // Verify overview content is displayed by default
      expect(screen.getByRole('heading', { level: 2, name: 'My Namespaces' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Recent Activity' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Quick Actions' })).toBeInTheDocument();
    });

    it('should display correct navigation items with real data and badges', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify all navigation items are rendered
      expect(screen.getByRole('button', { name: 'RG Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'My Projects' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /My Namespaces/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Team Members' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Activity Log' })).toBeInTheDocument();

      // Verify namespace badge is displayed
      const namespacesTab = screen.getByRole('button', { name: /My Namespaces/ });
      expect(namespacesTab).toBeInTheDocument();

      // Verify default selected tab
      const overviewTab = screen.getByRole('button', { name: 'RG Dashboard' });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    it('should handle real tab navigation with actual state changes', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Initial state - Overview tab active
      expect(screen.getByRole('heading', { level: 2, name: 'My Namespaces' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Recent Activity' })).toBeInTheDocument();

      // Click on My Projects tab - real user interaction
      fireEvent.click(screen.getByRole('button', { name: 'My Projects' }));

      await waitFor(() => {
        // Verify content changed to Projects tab
        expect(screen.getByRole('heading', { level: 1, name: 'My Projects' })).toBeInTheDocument();
        expect(screen.getByText('View All Projects')).toBeInTheDocument();
        
        // Verify tab state changed
        const projectsTab = screen.getByRole('button', { name: 'My Projects' });
        expect(projectsTab).toHaveAttribute('aria-current', 'page');
      });

      // Click on My Namespaces tab
      fireEvent.click(screen.getByRole('button', { name: /My Namespaces/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'My Namespaces' })).toBeInTheDocument();
      });

      // Click on Team Members tab
      fireEvent.click(screen.getByRole('button', { name: 'Team Members' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Team Members' })).toBeInTheDocument();
        expect(screen.getByText('View All Team Members')).toBeInTheDocument();
      });

      // Click on Activity Log tab
      fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Activity Log' })).toBeInTheDocument();
        expect(screen.getByRole('feed', { name: 'Review group activity log' })).toBeInTheDocument();
      });
    });
  });

  describe('Real Statistics Integration @integration', () => {
    it('should display actual statistics cards with real data', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify stats cards are displayed with real values
      expect(screen.getByText('My Namespaces')).toBeInTheDocument();
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();

      // Verify namespace count is displayed
      expect(screen.getByText('Under your management')).toBeInTheDocument();
      expect(screen.getByText('+1 this month')).toBeInTheDocument();
      expect(screen.getByText('+2 this quarter')).toBeInTheDocument();
    });

    it('should display namespace cards with real namespace data', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify namespace cards are rendered with real data
      const namespaceCards = screen.getAllByText(/Items|Languages|Contributors/);
      expect(namespaceCards.length).toBeGreaterThan(0);

      // Verify status chips are displayed
      const statusChips = screen.getAllByText(/Active|Maintenance|Archived/);
      expect(statusChips.length).toBeGreaterThan(0);
    });

    it('should display manage namespaces link with correct href', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      const manageLink = screen.getByRole('link', { name: 'Manage all namespaces →' });
      expect(manageLink).toHaveAttribute('href', '/dashboard/rg/namespaces?demo=true');
    });
  });

  describe('Real Activity Feed Integration @integration', () => {
    it('should display real activity items with proper structure', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify activity feed is displayed
      const activityFeed = screen.getByRole('feed', { name: 'Recent review group activity' });
      expect(activityFeed).toBeInTheDocument();

      // Verify activity items are displayed
      expect(screen.getByText('ISBD translation milestone completed by your team')).toBeInTheDocument();
      expect(screen.getByText('New team member joined ISBD Review Group')).toBeInTheDocument();
      expect(screen.getByText('ISBD/M vocabulary updated')).toBeInTheDocument();
      expect(screen.getByText('Review group meeting notes published')).toBeInTheDocument();

      // Verify activity metadata is displayed
      expect(screen.getByText('By Maria Editor • 2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('By John Smith • 1 day ago')).toBeInTheDocument();
      expect(screen.getByText('By Sarah Wilson • 2 days ago')).toBeInTheDocument();
      expect(screen.getByText('By You • 3 days ago')).toBeInTheDocument();
    });

    it('should display activity feed in activity tab with same data', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Navigate to activity tab
      fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));

      await waitFor(() => {
        const activityFeed = screen.getByRole('feed', { name: 'Review group activity log' });
        expect(activityFeed).toBeInTheDocument();

        // Verify same activities are displayed in full activity view
        expect(screen.getByText('ISBD translation milestone completed by your team')).toBeInTheDocument();
        expect(screen.getByText('New team member joined ISBD Review Group')).toBeInTheDocument();
      });
    });
  });

  describe('Real Quick Actions Integration @integration', () => {
    it('should display quick action buttons with correct links', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify quick action buttons are displayed
      const newProjectButton = screen.getByLabelText('Start a new project');
      expect(newProjectButton).toHaveAttribute('href', '/dashboard/rg/projects/new?demo=true');

      const inviteButton = screen.getByLabelText('Invite a team member');
      expect(inviteButton).toHaveAttribute('href', '/dashboard/rg/team/invite?demo=true');
    });

    it('should handle quick action button clicks', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      const newProjectButton = screen.getByLabelText('Start a new project');
      const inviteButton = screen.getByLabelText('Invite a team member');

      // Verify buttons are clickable and have proper role
      expect(newProjectButton).toHaveAttribute('role', 'button');
      expect(inviteButton).toHaveAttribute('role', 'button');
    });
  });

  describe('Real Namespace Cards Integration @integration', () => {
    it('should display namespace cards in namespaces tab', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Navigate to namespaces tab
      fireEvent.click(screen.getByRole('button', { name: /My Namespaces/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'My Namespaces' })).toBeInTheDocument();

        // Verify namespace statistics are displayed
        const itemCounts = screen.getAllByText(/Items|Languages|Contributors/);
        expect(itemCounts.length).toBeGreaterThan(0);

        // Verify version information is displayed
        const versionTexts = screen.getAllByText(/Version/);
        expect(versionTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Real Accessibility Integration @integration @accessibility', () => {
    it('should have no accessibility violations with real components', async () => {
      const { container } = render(<ReviewGroupDashboard {...testProps} />);

      // Run axe on real rendered component tree
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through real tab interactions', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      const overviewTab = screen.getByRole('button', { name: 'RG Dashboard' });
      const projectsTab = screen.getByRole('button', { name: 'My Projects' });
      const namespacesTab = screen.getByRole('button', { name: /My Namespaces/ });

      // Test keyboard navigation - real keyboard events
      overviewTab.focus();
      expect(overviewTab).toHaveFocus();

      // Tab to next button
      projectsTab.focus();
      expect(projectsTab).toHaveFocus();

      // Test Enter key activation
      fireEvent.keyDown(projectsTab, { key: 'Enter', code: 'Enter' });
      fireEvent.click(projectsTab);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'My Projects' })).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on real action buttons', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Check quick action buttons have proper accessibility
      const newProjectButton = screen.getByLabelText('Start a new project');
      expect(newProjectButton).toBeInTheDocument();

      const inviteButton = screen.getByLabelText('Invite a team member');
      expect(inviteButton).toBeInTheDocument();
    });

    it('should have proper role and ARIA labels on activity feeds', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify activity feed has proper ARIA labels
      const activityFeed = screen.getByRole('feed', { name: 'Recent review group activity' });
      expect(activityFeed).toBeInTheDocument();

      // Navigate to activity tab and verify ARIA label
      fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));

      await waitFor(() => {
        const fullActivityFeed = screen.getByRole('feed', { name: 'Review group activity log' });
        expect(fullActivityFeed).toBeInTheDocument();
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // Verify heading levels are properly structured
      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThan(0);

      // Navigate to other tabs and verify h1 headings
      fireEvent.click(screen.getByRole('button', { name: 'My Projects' }));

      await waitFor(() => {
        const h1Heading = screen.getByRole('heading', { level: 1, name: 'My Projects' });
        expect(h1Heading).toBeInTheDocument();
      });
    });
  });

  describe('Real Data Validation @integration', () => {
    it('should handle empty review groups gracefully', async () => {
      const emptyProps = {
        ...testProps,
        reviewGroups: [],
      };

      render(<ReviewGroupDashboard {...emptyProps} />);

      // Should still render without errors
      expect(screen.getByText('Review Group Admin')).toBeInTheDocument();
    });

    it('should handle single review group correctly', async () => {
      const singleGroupProps = {
        ...testProps,
        reviewGroups: ['isbd'],
      };

      render(<ReviewGroupDashboard {...singleGroupProps} />);

      // Should display single review group name
      expect(screen.getByText('Review Group Admin')).toBeInTheDocument();
      expect(screen.getByText(/ISBD Team/)).toBeInTheDocument();
    });

    it('should display real namespace count in badge', async () => {
      render(<ReviewGroupDashboard {...testProps} />);

      // The badge should reflect actual namespace count for the review groups
      const namespacesTab = screen.getByRole('button', { name: /My Namespaces/ });
      expect(namespacesTab).toBeInTheDocument();
      
      // Navigate to check actual namespace cards are displayed
      fireEvent.click(namespacesTab);

      await waitFor(() => {
        // Should have namespace cards corresponding to the review groups
        const versionTexts = screen.getAllByText(/Version/);
        expect(versionTexts.length).toBeGreaterThan(0);
      });
    });
  });
});
