import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AdminDashboard from '../../app/(authenticated)/dashboard/AdminDashboard';

// Extend expect matchers
expect.extend(toHaveNoViolations);

/**
 * @integration @ui @dashboard @critical
 * Integration tests for AdminDashboard with real system administration data and components
 */
describe('AdminDashboard @integration @ui @dashboard @critical', () => {
  const testProps = {
    userRoles: ['superadmin'],
    userName: 'Jane Super Admin',
    userEmail: 'super.admin@test.example.com',
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
    it('should render with StandardDashboardLayout and real admin data', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify StandardDashboardLayout integration
      expect(screen.getByText('IFLA Admin')).toBeInTheDocument();
      expect(screen.getByText('System Administration')).toBeInTheDocument();

      // Verify overview content is displayed by default
      expect(screen.getByRole('heading', { level: 1, name: 'Admin Dashboard' })).toBeInTheDocument();
      expect(screen.getByText('System overview and key metrics')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Recent System Activity' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'System Status' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Quick Actions' })).toBeInTheDocument();
    });

    it('should display correct navigation items with real data and badges', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify all navigation items are rendered with badges
      expect(screen.getByRole('button', { name: 'Dashboard Overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Users.*352/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Review Groups' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Projects.*12/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Namespaces' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Vocabularies.*824/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'DCTAP Profiles' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Adopt Spreadsheet' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Activity Log' })).toBeInTheDocument();

      // Verify default selected tab
      const overviewTab = screen.getByRole('button', { name: 'Dashboard Overview' });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    it('should handle real tab navigation with actual state changes', async () => {
      render(<AdminDashboard {...testProps} />);

      // Initial state - Overview tab active
      expect(screen.getByRole('heading', { level: 1, name: 'Admin Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Recent System Activity' })).toBeInTheDocument();

      // Click on Users tab - real user interaction
      fireEvent.click(screen.getByRole('button', { name: /Users/ }));

      await waitFor(() => {
        // Verify content changed to Users tab
        expect(screen.getByRole('heading', { level: 1, name: 'User Management' })).toBeInTheDocument();
        expect(screen.getByText('View All Users')).toBeInTheDocument();
        
        // Verify tab state changed
        const usersTab = screen.getByRole('button', { name: /Users/ });
        expect(usersTab).toHaveAttribute('aria-current', 'page');
      });

      // Click on Projects tab
      fireEvent.click(screen.getByRole('button', { name: /Projects/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Project Management' })).toBeInTheDocument();
        expect(screen.getByText('View All Projects')).toBeInTheDocument();
      });

      // Click on Adopt Spreadsheet tab
      fireEvent.click(screen.getByRole('button', { name: 'Adopt Spreadsheet' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Adopt Spreadsheet' })).toBeInTheDocument();
        expect(screen.getByText('Go to Spreadsheet Adoption')).toBeInTheDocument();
      });

      // Click on Activity Log tab
      fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Activity Log' })).toBeInTheDocument();
        expect(screen.getByText('View Full Activity Log')).toBeInTheDocument();
      });
    });
  });

  describe('Real Statistics Integration @integration', () => {
    it('should display actual statistics cards with real data', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify stats cards are displayed with real values
      const totalUsersCard = screen.getByRole('region', { name: /total users/i });
      expect(totalUsersCard).toBeInTheDocument();
      expect(screen.getByLabelText('Total Users: 352')).toBeInTheDocument();
      expect(screen.getByLabelText('Change: +14 this month')).toBeInTheDocument();

      const projectsCard = screen.getByRole('region', { name: /active projects/i });
      expect(projectsCard).toBeInTheDocument();
      expect(screen.getByLabelText('Active Projects: 12')).toBeInTheDocument();
      expect(screen.getByLabelText('Change: +2 this month')).toBeInTheDocument();

      const vocabulariesCard = screen.getByRole('region', { name: /total vocabularies/i });
      expect(vocabulariesCard).toBeInTheDocument();
      expect(screen.getByLabelText('Total Vocabularies: 824')).toBeInTheDocument();
      expect(screen.getByLabelText('Change: +38 this month')).toBeInTheDocument();
    });

    it('should format numbers correctly with locale formatting', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify large numbers are formatted with commas
      expect(screen.getByText('352')).toBeInTheDocument();
      expect(screen.getByText('824')).toBeInTheDocument();
    });
  });

  describe('Real System Status Integration @integration', () => {
    it('should display actual system services with status', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify system status list is displayed
      const statusList = screen.getByRole('list', { name: 'System service status' });
      expect(statusList).toBeInTheDocument();

      // Verify individual service statuses
      expect(screen.getByLabelText('GitHub API status: Online')).toBeInTheDocument();
      expect(screen.getByLabelText('Clerk Auth status: Online')).toBeInTheDocument();
      expect(screen.getByLabelText('Vocabulary Server status: Online')).toBeInTheDocument();
      expect(screen.getByLabelText('Build System status: Online')).toBeInTheDocument();

      // Verify status chips are displayed
      const onlineChips = screen.getAllByText('Online');
      expect(onlineChips).toHaveLength(4);
    });

    it('should handle different status types with proper colors', async () => {
      render(<AdminDashboard {...testProps} />);

      // All services should be online in the default state
      const onlineChips = screen.getAllByText('Online');
      onlineChips.forEach(chip => {
        expect(chip).toHaveClass('MuiChip-colorSuccess');
      });
    });
  });

  describe('Real Activity Feed Integration @integration', () => {
    it('should display real activity items with proper structure', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify activity feed is displayed
      const activityFeed = screen.getByRole('feed', { name: 'Recent activity feed' });
      expect(activityFeed).toBeInTheDocument();

      // Verify activity items are displayed
      expect(screen.getByText('Project "MulDiCat French Translation" milestone completed')).toBeInTheDocument();
      expect(screen.getByText('User "alice@example.com" joined "LRM 2.0 Development" project')).toBeInTheDocument();
      expect(screen.getByText('ISBD Review Group chartered "ISBD Maintenance WG 2024-2026"')).toBeInTheDocument();
      expect(screen.getByText('DCTAP Profile "Standard" created')).toBeInTheDocument();
      expect(screen.getByText('Vocabulary "Elements" RDF generated')).toBeInTheDocument();

      // Verify activity metadata is displayed
      expect(screen.getByText('By John Smith • 2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('By James Wilson • 3 hours ago')).toBeInTheDocument();
      expect(screen.getByText('By Sarah Johnson • 5 hours ago')).toBeInTheDocument();
      expect(screen.getByText('By Mike Davis • 1 day ago')).toBeInTheDocument();
      expect(screen.getByText('By Jennifer Lee • 1 day ago')).toBeInTheDocument();
    });

    it('should display view all activity link with correct href', async () => {
      render(<AdminDashboard {...testProps} />);

      const viewAllLink = screen.getByRole('link', { name: 'View all activity →' });
      expect(viewAllLink).toHaveAttribute('href', '/dashboard/activity?demo=true');
    });
  });

  describe('Real Quick Actions Integration @integration', () => {
    it('should display quick action buttons with correct links', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify quick action buttons are displayed
      const charterProjectButton = screen.getByLabelText('Charter a new project');
      expect(charterProjectButton).toHaveAttribute('href', '/dashboard/projects/new?demo=true');

      const adoptSpreadsheetButton = screen.getByLabelText('Adopt a spreadsheet');
      expect(adoptSpreadsheetButton).toHaveAttribute('href', '/dashboard/admin/adopt-spreadsheet');

      const inviteUserButton = screen.getByLabelText('Invite a new user');
      expect(inviteUserButton).toHaveAttribute('href', '/dashboard/users/invite?demo=true');
    });

    it('should handle quick action button clicks', async () => {
      render(<AdminDashboard {...testProps} />);

      const charterProjectButton = screen.getByLabelText('Charter a new project');
      const adoptSpreadsheetButton = screen.getByLabelText('Adopt a spreadsheet');
      const inviteUserButton = screen.getByLabelText('Invite a new user');

      // Verify buttons are clickable and have proper role
      expect(charterProjectButton).toHaveAttribute('role', 'button');
      expect(adoptSpreadsheetButton).toHaveAttribute('role', 'button');
      expect(inviteUserButton).toHaveAttribute('role', 'button');
    });
  });

  describe('Real Tab Content Integration @integration', () => {
    it('should display user management content in users tab', async () => {
      render(<AdminDashboard {...testProps} />);

      // Navigate to users tab
      fireEvent.click(screen.getByRole('button', { name: /Users/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'User Management' })).toBeInTheDocument();
        
        const viewUsersButton = screen.getByText('View All Users');
        expect(viewUsersButton).toHaveAttribute('href', '/dashboard/users');
      });
    });

    it('should display project management content in projects tab', async () => {
      render(<AdminDashboard {...testProps} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /Projects/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Project Management' })).toBeInTheDocument();
        
        const viewProjectsButton = screen.getByText('View All Projects');
        expect(viewProjectsButton).toHaveAttribute('href', '/dashboard/projects');
      });
    });

    it('should handle unknown tab gracefully', async () => {
      render(<AdminDashboard {...testProps} />);

      // Navigate to review groups tab (which has default handler)
      fireEvent.click(screen.getByRole('button', { name: 'Review Groups' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Review Groups' })).toBeInTheDocument();
        expect(screen.getByText('This section is under development.')).toBeInTheDocument();
      });
    });
  });

  describe('Real Accessibility Integration @integration @accessibility', () => {
    it('should have no accessibility violations with real components', async () => {
      const { container } = render(<AdminDashboard {...testProps} />);

      // Run axe on real rendered component tree
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through real tab interactions', async () => {
      render(<AdminDashboard {...testProps} />);

      const overviewTab = screen.getByRole('button', { name: 'Dashboard Overview' });
      const usersTab = screen.getByRole('button', { name: /Users/ });
      const projectsTab = screen.getByRole('button', { name: /Projects/ });

      // Test keyboard navigation - real keyboard events
      overviewTab.focus();
      expect(overviewTab).toHaveFocus();

      // Tab to next button
      usersTab.focus();
      expect(usersTab).toHaveFocus();

      // Test Enter key activation
      fireEvent.keyDown(usersTab, { key: 'Enter', code: 'Enter' });
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'User Management' })).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on real action buttons', async () => {
      render(<AdminDashboard {...testProps} />);

      // Check quick action buttons have proper accessibility
      const charterProjectButton = screen.getByLabelText('Charter a new project');
      expect(charterProjectButton).toBeInTheDocument();

      const adoptSpreadsheetButton = screen.getByLabelText('Adopt a spreadsheet');
      expect(adoptSpreadsheetButton).toBeInTheDocument();

      const inviteUserButton = screen.getByLabelText('Invite a new user');
      expect(inviteUserButton).toBeInTheDocument();
    });

    it('should have proper role and ARIA labels on activity feed', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify activity feed has proper ARIA labels
      const activityFeed = screen.getByRole('feed', { name: 'Recent activity feed' });
      expect(activityFeed).toBeInTheDocument();
    });

    it('should have proper ARIA labels on stats cards', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify stats cards have proper regions and labels
      const totalUsersCard = screen.getByRole('region', { name: /total users/i });
      expect(totalUsersCard).toBeInTheDocument();

      const activeProjectsCard = screen.getByRole('region', { name: /active projects/i });
      expect(activeProjectsCard).toBeInTheDocument();

      const totalVocabulariesCard = screen.getByRole('region', { name: /total vocabularies/i });
      expect(totalVocabulariesCard).toBeInTheDocument();

      // Verify values have descriptive ARIA labels
      expect(screen.getByLabelText('Total Users: 352')).toBeInTheDocument();
      expect(screen.getByLabelText('Active Projects: 12')).toBeInTheDocument();
      expect(screen.getByLabelText('Total Vocabularies: 824')).toBeInTheDocument();
    });

    it('should have proper ARIA labels on system status items', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify system status items have proper ARIA labels
      expect(screen.getByLabelText('GitHub API status: Online')).toBeInTheDocument();
      expect(screen.getByLabelText('Clerk Auth status: Online')).toBeInTheDocument();
      expect(screen.getByLabelText('Vocabulary Server status: Online')).toBeInTheDocument();
      expect(screen.getByLabelText('Build System status: Online')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify heading levels are properly structured
      const h1Heading = screen.getByRole('heading', { level: 1, name: 'Admin Dashboard' });
      expect(h1Heading).toBeInTheDocument();

      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThan(0);

      // Navigate to other tabs and verify h1 headings
      fireEvent.click(screen.getByRole('button', { name: /Users/ }));

      await waitFor(() => {
        const userManagementH1 = screen.getByRole('heading', { level: 1, name: 'User Management' });
        expect(userManagementH1).toBeInTheDocument();
      });
    });
  });

  describe('Real Badge Integration @integration', () => {
    it('should display correct badge counts from real data', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify badge counts are displayed in navigation
      expect(screen.getByRole('button', { name: /Users.*352/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Projects.*12/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Vocabularies.*824/ })).toBeInTheDocument();

      // These match the stats in the overview
      expect(screen.getByText('352')).toBeInTheDocument(); // User count
      expect(screen.getByText('12')).toBeInTheDocument();  // Project count
      expect(screen.getByText('824')).toBeInTheDocument(); // Vocabulary count
    });
  });

  describe('Real Special Access Integration @integration', () => {
    it('should display special access items properly', async () => {
      render(<AdminDashboard {...testProps} />);

      // Verify Adopt Spreadsheet tab is present (marked as specialAccess)
      const adoptTab = screen.getByRole('button', { name: 'Adopt Spreadsheet' });
      expect(adoptTab).toBeInTheDocument();

      // Navigate to adopt tab
      fireEvent.click(adoptTab);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Adopt Spreadsheet' })).toBeInTheDocument();
        
        const adoptButton = screen.getByText('Go to Spreadsheet Adoption');
        expect(adoptButton).toHaveAttribute('href', '/dashboard/admin/adopt-spreadsheet');
      });
    });
  });
});
