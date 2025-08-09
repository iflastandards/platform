import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import EditorDashboard from '../../app/(authenticated)/dashboard/editor/EditorDashboard';
import { AppUser } from '@/lib/clerk-github-auth';

// Extend expect matchers
expect.extend(toHaveNoViolations);

/**
 * @integration @ui @dashboard
 * Integration tests for EditorDashboard with real editor user data and components
 */
describe('EditorDashboard @integration @ui @dashboard', () => {
  let testUser: AppUser;
  const originalConsoleLog = console.log;

  beforeEach(async () => {
    // Create real test user data for editor - no mocking
    testUser = {
      id: 'test-editor-user-id',
      name: 'Sarah Editor User',
      email: 'editor.user@test.example.com',
      githubUsername: 'editoruser',
      systemRole: undefined,
      isReviewGroupAdmin: false,
      reviewGroups: ['isbd'],
      projects: {
        '1': {
          number: 1,
          title: 'ISBD Maintenance Project 2024',
          role: 'editor',
          namespaces: ['isbd'],
        },
        '2': {
          number: 2,
          title: 'UNIMARC Development Lead',
          role: 'lead',
          namespaces: ['unimarc'],
        },
      },
      accessibleNamespaces: ['isbd', 'unimarc', 'frbr'],
    };

    // Mock console.log for clean test output
    console.log = jest.fn();
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('Real Component Rendering @integration', () => {
    it('should render with StandardDashboardLayout and real editor data', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify StandardDashboardLayout integration
      expect(screen.getByText('Editor Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Editorial Control Center')).toBeInTheDocument();

      // Verify overview content is displayed by default
      expect(screen.getByRole('heading', { level: 1, name: 'Editor Dashboard' })).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${testUser.name}. You have editorial control over projects, namespaces, and export/import workflows.`)).toBeInTheDocument();

      // Verify editor responsibilities alert
      expect(screen.getByText('Editor Responsibilities')).toBeInTheDocument();
      expect(screen.getByText(/As an editor, you have extensive control/)).toBeInTheDocument();
    });

    it('should display correct navigation items with real data and badges', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify all navigation items are rendered with badges
      expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /My Projects.*2/ })).toBeInTheDocument(); // 2 projects
      expect(screen.getByRole('button', { name: /Namespaces.*3/ })).toBeInTheDocument(); // 3 namespaces
      expect(screen.getByRole('button', { name: 'Editorial Tools' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Import/Export' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Review Queue' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Translations' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'System Status' })).toBeInTheDocument();

      // Verify default selected tab
      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    it('should handle real tab navigation with actual state changes', async () => {
      render(<EditorDashboard user={testUser} />);

      // Initial state - Overview tab active
      expect(screen.getByRole('heading', { level: 1, name: 'Editor Dashboard' })).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();

      // Click on My Projects tab - real user interaction
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Verify content changed to Projects tab
        expect(screen.getByRole('heading', { level: 1, name: 'My Projects' })).toBeInTheDocument();
        
        // Verify tab state changed
        const projectsTab = screen.getByRole('button', { name: /My Projects/ });
        expect(projectsTab).toHaveAttribute('aria-current', 'page');
      });

      // Click on Namespaces tab
      fireEvent.click(screen.getByRole('button', { name: /Namespaces/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Accessible Namespaces' })).toBeInTheDocument();
      });

      // Click on Editorial Tools tab
      fireEvent.click(screen.getByRole('button', { name: 'Editorial Tools' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Editorial Tools' })).toBeInTheDocument();
      });

      // Click on System Status tab
      fireEvent.click(screen.getByRole('button', { name: 'System Status' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'System Status' })).toBeInTheDocument();
      });
    });
  });

  describe('Real User Data Integration @integration', () => {
    it('should display actual user information and statistics', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify user name is displayed
      expect(screen.getByText(`Welcome, ${testUser.name}. You have editorial control over projects, namespaces, and export/import workflows.`)).toBeInTheDocument();

      // Verify stats cards display real data
      const projectsCard = screen.getByRole('region', { name: /projects/i });
      expect(projectsCard).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 editor projects
      expect(screen.getByText('As lead or editor')).toBeInTheDocument();

      const namespacesCard = screen.getByRole('region', { name: /namespaces/i });
      expect(namespacesCard).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 accessible namespaces
      expect(screen.getByText('Accessible to you')).toBeInTheDocument();

      const reviewsCard = screen.getByRole('region', { name: /pending reviews/i });
      expect(reviewsCard).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // 0 pending reviews
      expect(screen.getByText('Awaiting your review')).toBeInTheDocument();

      const translationsCard = screen.getByRole('region', { name: /translations/i });
      expect(translationsCard).toBeInTheDocument();
      expect(screen.getByText('In progress')).toBeInTheDocument();
    });

    it('should display real projects in projects tab', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Verify actual projects are displayed
        expect(screen.getByText('ISBD Maintenance Project 2024')).toBeInTheDocument();
        expect(screen.getByText('UNIMARC Development Lead')).toBeInTheDocument();

        // Verify role chips
        expect(screen.getByText('Editor')).toBeInTheDocument();
        expect(screen.getByText('Project Lead')).toBeInTheDocument();

        // Verify namespace counts
        const namespaceTexts = screen.getAllByText(/namespaces?/);
        expect(namespaceTexts).toHaveLength(2); // One for each project
      });
    });

    it('should display real namespaces in namespaces tab', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to namespaces tab
      fireEvent.click(screen.getByRole('button', { name: /Namespaces/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Accessible Namespaces' })).toBeInTheDocument();

        // Verify accessible namespaces are displayed
        expect(screen.getByText('ISBD')).toBeInTheDocument();
        expect(screen.getByText('UNIMARC')).toBeInTheDocument();
        expect(screen.getByText('FRBR')).toBeInTheDocument();

        // Verify edit buttons with proper labels
        expect(screen.getByLabelText('Edit ISBD namespace')).toBeInTheDocument();
        expect(screen.getByLabelText('Edit UNIMARC namespace')).toBeInTheDocument();
        expect(screen.getByLabelText('Edit FRBR namespace')).toBeInTheDocument();
      });
    });

    it('should handle user with no editor projects', async () => {
      const userWithNoProjects = {
        ...testUser,
        projects: {},
      };

      render(<EditorDashboard user={userWithNoProjects} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /My Projects.*0/ }));

      await waitFor(() => {
        expect(screen.getByText('No projects assigned')).toBeInTheDocument();
        expect(screen.getByText("You don't have any projects with editor or lead roles")).toBeInTheDocument();
      });
    });
  });

  describe('Real Quick Actions Integration @integration', () => {
    it('should display quick action buttons with correct links', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify quick action buttons are displayed
      const importButton = screen.getByLabelText('Import vocabulary from external source');
      expect(importButton).toHaveAttribute('href', '/import');

      const exportButton = screen.getByLabelText('Export vocabulary to Google Sheets');
      expect(exportButton).toHaveAttribute('href', '/export');

      const manageButton = screen.getByLabelText('Manage namespace configurations');
      expect(manageButton).toHaveAttribute('href', '/namespaces');

      const githubButton = screen.getByLabelText('Configure GitHub integration');
      expect(githubButton).toHaveAttribute('href', '/github');
    });

    it('should handle quick action button clicks', async () => {
      render(<EditorDashboard user={testUser} />);

      const importButton = screen.getByLabelText('Import vocabulary from external source');
      const exportButton = screen.getByLabelText('Export vocabulary to Google Sheets');

      // Verify buttons are clickable and have proper role
      expect(importButton).toHaveAttribute('role', 'button');
      expect(exportButton).toHaveAttribute('role', 'button');
    });
  });

  describe('Real Editorial Tools Integration @integration', () => {
    it('should display editorial tools in editorial tab', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to editorial tools tab
      fireEvent.click(screen.getByRole('button', { name: 'Editorial Tools' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Editorial Tools' })).toBeInTheDocument();

        // Verify editorial tool links
        const cyclesLink = screen.getByRole('link', { name: /Editorial Cycles.*Manage vocabulary publication cycles/ });
        expect(cyclesLink).toHaveAttribute('href', '/cycles');

        const reviewLink = screen.getByRole('link', { name: /Review Queue.*Pending reviews and approvals/ });
        expect(reviewLink).toHaveAttribute('href', '/review');

        const translationLink = screen.getByRole('link', { name: /Translation Management.*Coordinate multilingual content/ });
        expect(translationLink).toHaveAttribute('href', '/translation');
      });
    });
  });

  describe('Real System Status Integration @integration', () => {
    it('should display system status information', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to system status tab
      fireEvent.click(screen.getByRole('button', { name: 'System Status' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'System Status' })).toBeInTheDocument();

        // Verify system status items
        expect(screen.getByText('Build Pipeline')).toBeInTheDocument();
        expect(screen.getByText('Last build: 2 hours ago')).toBeInTheDocument();
        expect(screen.getByText('Healthy')).toBeInTheDocument();

        expect(screen.getByText('GitHub Integration')).toBeInTheDocument();
        expect(screen.getByText('API status and sync')).toBeInTheDocument();
        expect(screen.getByText('Connected')).toBeInTheDocument();

        expect(screen.getByText('Import Status')).toBeInTheDocument();
        expect(screen.getByText('Active imports: 0')).toBeInTheDocument();
        expect(screen.getByText('Idle')).toBeInTheDocument();
      });
    });
  });

  describe('Real Accessibility Integration @integration @accessibility', () => {
    it('should have no accessibility violations with real components', async () => {
      const { container } = render(<EditorDashboard user={testUser} />);

      // Run axe on real rendered component tree
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through real tab interactions', async () => {
      render(<EditorDashboard user={testUser} />);

      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      const projectsTab = screen.getByRole('button', { name: /My Projects/ });
      const namespacesTab = screen.getByRole('button', { name: /Namespaces/ });

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
      render(<EditorDashboard user={testUser} />);

      // Check quick action buttons have proper accessibility
      const importButton = screen.getByLabelText('Import vocabulary from external source');
      expect(importButton).toBeInTheDocument();

      const exportButton = screen.getByLabelText('Export vocabulary to Google Sheets');
      expect(exportButton).toBeInTheDocument();

      const manageButton = screen.getByLabelText('Manage namespace configurations');
      expect(manageButton).toBeInTheDocument();

      const githubButton = screen.getByLabelText('Configure GitHub integration');
      expect(githubButton).toBeInTheDocument();
    });

    it('should have proper ARIA labels on stats cards', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify stats cards have proper regions and labels
      const projectsCard = screen.getByRole('region', { name: /projects/i });
      expect(projectsCard).toBeInTheDocument();

      const namespacesCard = screen.getByRole('region', { name: /namespaces/i });
      expect(namespacesCard).toBeInTheDocument();

      const reviewsCard = screen.getByRole('region', { name: /pending reviews/i });
      expect(reviewsCard).toBeInTheDocument();

      const translationsCard = screen.getByRole('region', { name: /translations/i });
      expect(translationsCard).toBeInTheDocument();
    });

    it('should have proper ARIA labels on project edit buttons', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Check project edit buttons have proper accessibility
        expect(screen.getByLabelText('Edit ISBD Maintenance Project 2024')).toBeInTheDocument();
        expect(screen.getByLabelText('Edit UNIMARC Development Lead')).toBeInTheDocument();
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify heading levels are properly structured
      const h1Heading = screen.getByRole('heading', { level: 1, name: 'Editor Dashboard' });
      expect(h1Heading).toBeInTheDocument();

      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThan(0);

      // Navigate to other tabs and verify h1 headings
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        const projectsH1 = screen.getByRole('heading', { level: 1, name: 'My Projects' });
        expect(projectsH1).toBeInTheDocument();
      });
    });
  });

  describe('Real Badge Integration @integration', () => {
    it('should display correct badge counts from real user data', async () => {
      render(<EditorDashboard user={testUser} />);

      // Verify badge counts are displayed in navigation
      expect(screen.getByRole('button', { name: /My Projects.*2/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Namespaces.*3/ })).toBeInTheDocument();

      // These match the stats in the overview
      expect(screen.getByText('2')).toBeInTheDocument(); // Project count
      expect(screen.getByText('3')).toBeInTheDocument(); // Namespace count
    });
  });

  describe('Real Role Display @integration', () => {
    it('should display proper role formatting', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to projects tab to see role chips
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Verify role display formatting
        expect(screen.getByText('Editor')).toBeInTheDocument(); // 'editor' -> 'Editor'
        expect(screen.getByText('Project Lead')).toBeInTheDocument(); // 'lead' -> 'Project Lead'
      });
    });
  });

  describe('Real Default Tab Handling @integration', () => {
    it('should handle unknown tabs gracefully', async () => {
      render(<EditorDashboard user={testUser} />);

      // Navigate to import/export tab (which has default handler)
      fireEvent.click(screen.getByRole('button', { name: 'Import/Export' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Import/Export' })).toBeInTheDocument();
        expect(screen.getByText('This section is under development.')).toBeInTheDocument();
      });

      // Navigate to review queue tab
      fireEvent.click(screen.getByRole('button', { name: 'Review Queue' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Review Queue' })).toBeInTheDocument();
        expect(screen.getByText('This section is under development.')).toBeInTheDocument();
      });

      // Navigate to translations tab
      fireEvent.click(screen.getByRole('button', { name: 'Translations' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Translations' })).toBeInTheDocument();
        expect(screen.getByText('This section is under development.')).toBeInTheDocument();
      });
    });
  });
});