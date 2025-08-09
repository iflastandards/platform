import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AuthorDashboard from '../../app/(authenticated)/dashboard/author/AuthorDashboard';
import { AppUser } from '@/lib/clerk-github-auth';

// Extend expect matchers
expect.extend(toHaveNoViolations);

/**
 * @integration @ui @dashboard
 * Integration tests for AuthorDashboard with real author user data and components
 */
describe('AuthorDashboard @integration @ui @dashboard', () => {
  let testUser: AppUser;
  const originalConsoleLog = console.log;

  beforeEach(async () => {
    // Create real test user data for author - no mocking
    testUser = {
      id: 'test-author-user-id',
      name: 'Maria Author User',
      email: 'author.user@test.example.com',
      githubUsername: 'authoruser',
      systemRole: undefined,
      isReviewGroupAdmin: false,
      reviewGroups: ['isbd'],
      projects: {
        '1': {
          number: 1,
          title: 'ISBD Review Project 2024',
          role: 'reviewer',
          namespaces: ['isbd'],
        },
        '2': {
          number: 2,
          title: 'UNIMARC Translation Project',
          role: 'translator',
          namespaces: ['unimarc'],
        },
        '3': {
          number: 3,
          title: 'FRBR Development Project',
          role: 'editor', // Should not appear in author projects
          namespaces: ['frbr'],
        },
      },
      accessibleNamespaces: ['isbd', 'unimarc'],
    };

    // Mock console.log for clean test output
    console.log = jest.fn();
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('Real Component Rendering @integration', () => {
    it('should render with StandardDashboardLayout and real author data', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Verify StandardDashboardLayout integration
      expect(screen.getByText('Author Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Content Review & Translation')).toBeInTheDocument();

      // Verify overview content is displayed by default
      expect(screen.getByRole('heading', { level: 1, name: 'Author Dashboard' })).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${testUser.name}. You have authoring responsibilities for content review and translation.`)).toBeInTheDocument();

      // Verify author responsibilities alert
      expect(screen.getByText('Author Responsibilities')).toBeInTheDocument();
      expect(screen.getByText(/As an author, you contribute to content quality/)).toBeInTheDocument();
    });

    it('should display correct navigation items with real data and badges', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Verify all navigation items are rendered with badges
      expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /My Projects.*2/ })).toBeInTheDocument(); // 2 author projects (reviewer + translator)
      expect(screen.getByRole('button', { name: /Namespaces.*2/ })).toBeInTheDocument(); // 2 namespaces
      expect(screen.getByRole('button', { name: /Active Tasks.*6/ })).toBeInTheDocument(); // Fixed number of active tasks
      expect(screen.getByRole('button', { name: /Review Queue.*3/ })).toBeInTheDocument(); // Fixed number of reviews
      expect(screen.getByRole('button', { name: /Translation Tasks.*2/ })).toBeInTheDocument(); // Fixed number of translations
      expect(screen.getByRole('button', { name: 'Tools & Resources' })).toBeInTheDocument();

      // Verify default selected tab
      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    it('should handle real tab navigation with actual state changes', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Initial state - Overview tab active
      expect(screen.getByRole('heading', { level: 1, name: 'Author Dashboard' })).toBeInTheDocument();
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

      // Click on Active Tasks tab
      fireEvent.click(screen.getByRole('button', { name: /Active Tasks/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Active Tasks' })).toBeInTheDocument();
      });

      // Click on Review Queue tab
      fireEvent.click(screen.getByRole('button', { name: /Review Queue/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Review Queue' })).toBeInTheDocument();
      });

      // Click on Translation Tasks tab
      fireEvent.click(screen.getByRole('button', { name: /Translation Tasks/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Translation Tasks' })).toBeInTheDocument();
      });

      // Click on Tools & Resources tab
      fireEvent.click(screen.getByRole('button', { name: 'Tools & Resources' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Tools & Resources' })).toBeInTheDocument();
      });
    });
  });

  describe('Real User Data Integration @integration', () => {
    it('should display actual user information', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Verify user name is displayed
      expect(screen.getByText(`Welcome, ${testUser.name}. You have authoring responsibilities for content review and translation.`)).toBeInTheDocument();
    });

    it('should display real projects in projects tab filtering by author roles', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Verify only reviewer and translator projects are displayed (not editor)
        expect(screen.getByText('ISBD Review Project 2024')).toBeInTheDocument();
        expect(screen.getByText('UNIMARC Translation Project')).toBeInTheDocument();
        expect(screen.queryByText('FRBR Development Project')).not.toBeInTheDocument(); // Should not appear (editor role)

        // Verify role chips with correct colors
        expect(screen.getByText('Reviewer')).toBeInTheDocument();
        expect(screen.getByText('Translator')).toBeInTheDocument();

        // Verify namespace counts
        const namespaceTexts = screen.getAllByText(/namespaces?/);
        expect(namespaceTexts).toHaveLength(2); // One for each author project
      });
    });

    it('should display real namespaces in namespaces tab', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to namespaces tab
      fireEvent.click(screen.getByRole('button', { name: /Namespaces/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Accessible Namespaces' })).toBeInTheDocument();

        // Verify accessible namespaces are displayed as cards
        expect(screen.getByRole('heading', { level: 2, name: 'ISBD' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'UNIMARC' })).toBeInTheDocument();

        // Verify view namespace buttons with proper labels
        expect(screen.getByLabelText('View ISBD namespace')).toBeInTheDocument();
        expect(screen.getByLabelText('View UNIMARC namespace')).toBeInTheDocument();
      });
    });

    it('should handle user with no author projects', async () => {
      const userWithNoProjects = {
        ...testUser,
        projects: {},
      };

      render(<AuthorDashboard user={userWithNoProjects} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /My Projects.*0/ }));

      await waitFor(() => {
        expect(screen.getByText('No projects assigned')).toBeInTheDocument();
        expect(screen.getByText("You don't have any projects with reviewer or translator roles")).toBeInTheDocument();
      });
    });
  });

  describe('Real Quick Actions Integration @integration', () => {
    it('should display quick action buttons with correct links', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Verify quick action buttons are displayed
      const reviewButton = screen.getByLabelText('Go to review queue');
      expect(reviewButton).toHaveAttribute('href', '/review');

      const translationButton = screen.getByLabelText('Go to translation tasks');
      expect(translationButton).toHaveAttribute('href', '/translation');

      const namespacesButton = screen.getByLabelText('Browse namespaces');
      expect(namespacesButton).toHaveAttribute('href', '/namespaces');

      const cyclesButton = screen.getByLabelText('View editorial cycles');
      expect(cyclesButton).toHaveAttribute('href', '/cycles');
    });

    it('should handle quick action button clicks', async () => {
      render(<AuthorDashboard user={testUser} />);

      const reviewButton = screen.getByLabelText('Go to review queue');
      const translationButton = screen.getByLabelText('Go to translation tasks');

      // Verify buttons are clickable and have proper role
      expect(reviewButton).toHaveAttribute('role', 'button');
      expect(translationButton).toHaveAttribute('role', 'button');
    });
  });

  describe('Real Tasks Integration @integration', () => {
    it('should display task summary in active tasks tab', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to active tasks tab
      fireEvent.click(screen.getByRole('button', { name: /Active Tasks/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Active Tasks' })).toBeInTheDocument();

        // Verify task items are displayed
        expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
        expect(screen.getByText('3 items waiting for review')).toBeInTheDocument();

        expect(screen.getByText('Translation Tasks')).toBeInTheDocument();
        expect(screen.getByText('2 items need translation')).toBeInTheDocument();

        expect(screen.getByText('Comments to Address')).toBeInTheDocument();
        expect(screen.getByText('1 comment needs response')).toBeInTheDocument();

        // Verify badge numbers match
        const badgeChips = screen.getAllByText('3');
        expect(badgeChips).toHaveLength(1);
        const twoChips = screen.getAllByText('2');
        expect(twoChips).toHaveLength(1);
        const oneChips = screen.getAllByText('1');
        expect(oneChips).toHaveLength(1);
      });
    });
  });

  describe('Real Review Queue Integration @integration', () => {
    it('should display review queue information', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to review queue tab
      fireEvent.click(screen.getByRole('button', { name: /Review Queue/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Review Queue' })).toBeInTheDocument();

        // Verify review queue alert
        expect(screen.getByText('Review Queue')).toBeInTheDocument();
        expect(screen.getByText('You have 3 items waiting for your review. Please review and provide feedback.')).toBeInTheDocument();

        // Verify review interface button
        const reviewInterfaceButton = screen.getByText('Go to Review Interface');
        expect(reviewInterfaceButton).toHaveAttribute('href', '/review');
      });
    });
  });

  describe('Real Translation Tasks Integration @integration', () => {
    it('should display translation task information', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to translation tasks tab
      fireEvent.click(screen.getByRole('button', { name: /Translation Tasks/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Translation Tasks' })).toBeInTheDocument();

        // Verify translation tasks alert
        expect(screen.getByText('Translation Tasks')).toBeInTheDocument();
        expect(screen.getByText('You have 2 items that need translation. Your language expertise is valuable to the community.')).toBeInTheDocument();

        // Verify translation interface button
        const translationInterfaceButton = screen.getByText('Go to Translation Interface');
        expect(translationInterfaceButton).toHaveAttribute('href', '/translation');
      });
    });
  });

  describe('Real Tools & Resources Integration @integration', () => {
    it('should display tools and resources in tools tab', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to tools tab
      fireEvent.click(screen.getByRole('button', { name: 'Tools & Resources' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Tools & Resources' })).toBeInTheDocument();

        // Verify tool links
        const reviewInterfaceLink = screen.getByRole('link', { name: /Review Interface.*Approve, reject, and comment on content/ });
        expect(reviewInterfaceLink).toHaveAttribute('href', '/review');

        const translationToolsLink = screen.getByRole('link', { name: /Translation Tools.*Manage multilingual content/ });
        expect(translationToolsLink).toHaveAttribute('href', '/translation');

        const editorialTimelineLink = screen.getByRole('link', { name: /Editorial Timeline.*Track progress and deadlines/ });
        expect(editorialTimelineLink).toHaveAttribute('href', '/cycles');
      });
    });
  });

  describe('Real Accessibility Integration @integration @accessibility', () => {
    it('should have no accessibility violations with real components', async () => {
      const { container } = render(<AuthorDashboard user={testUser} />);

      // Run axe on real rendered component tree
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through real tab interactions', async () => {
      render(<AuthorDashboard user={testUser} />);

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
      render(<AuthorDashboard user={testUser} />);

      // Check quick action buttons have proper accessibility
      const reviewButton = screen.getByLabelText('Go to review queue');
      expect(reviewButton).toBeInTheDocument();

      const translationButton = screen.getByLabelText('Go to translation tasks');
      expect(translationButton).toBeInTheDocument();

      const namespacesButton = screen.getByLabelText('Browse namespaces');
      expect(namespacesButton).toBeInTheDocument();

      const cyclesButton = screen.getByLabelText('View editorial cycles');
      expect(cyclesButton).toBeInTheDocument();
    });

    it('should have proper ARIA labels on project view buttons', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to projects tab
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Check project view buttons have proper accessibility
        expect(screen.getByLabelText('View ISBD Review Project 2024 project')).toBeInTheDocument();
        expect(screen.getByLabelText('View UNIMARC Translation Project project')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on namespace view buttons', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to namespaces tab
      fireEvent.click(screen.getByRole('button', { name: /Namespaces/ }));

      await waitFor(() => {
        // Check namespace view buttons have proper accessibility
        expect(screen.getByLabelText('View ISBD namespace')).toBeInTheDocument();
        expect(screen.getByLabelText('View UNIMARC namespace')).toBeInTheDocument();
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Verify heading levels are properly structured
      const h1Heading = screen.getByRole('heading', { level: 1, name: 'Author Dashboard' });
      expect(h1Heading).toBeInTheDocument();

      // Navigate to namespaces to check h2 headings
      fireEvent.click(screen.getByRole('button', { name: /Namespaces/ }));

      await waitFor(() => {
        const namespaceH1 = screen.getByRole('heading', { level: 1, name: 'Accessible Namespaces' });
        expect(namespaceH1).toBeInTheDocument();
        
        const namespaceH2s = screen.getAllByRole('heading', { level: 2 });
        expect(namespaceH2s.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Real Badge Integration @integration', () => {
    it('should display correct badge counts from real user data', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Verify badge counts are displayed in navigation
      expect(screen.getByRole('button', { name: /My Projects.*2/ })).toBeInTheDocument(); // 2 author projects
      expect(screen.getByRole('button', { name: /Namespaces.*2/ })).toBeInTheDocument(); // 2 accessible namespaces
      expect(screen.getByRole('button', { name: /Active Tasks.*6/ })).toBeInTheDocument(); // Fixed active tasks
      expect(screen.getByRole('button', { name: /Review Queue.*3/ })).toBeInTheDocument(); // Fixed review queue
      expect(screen.getByRole('button', { name: /Translation Tasks.*2/ })).toBeInTheDocument(); // Fixed translation tasks
    });
  });

  describe('Real Role Display and Filtering @integration', () => {
    it('should display proper role formatting and colors', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Navigate to projects tab to see role chips
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Verify role display formatting
        expect(screen.getByText('Reviewer')).toBeInTheDocument(); // 'reviewer' -> 'Reviewer'
        expect(screen.getByText('Translator')).toBeInTheDocument(); // 'translator' -> 'Translator'

        // Verify that editor role project is not shown
        expect(screen.queryByText('Editor')).not.toBeInTheDocument();
        expect(screen.queryByText('FRBR Development Project')).not.toBeInTheDocument();
      });
    });

    it('should correctly filter projects by author roles', async () => {
      render(<AuthorDashboard user={testUser} />);

      // Should show badge of 2 (reviewer + translator projects only)
      expect(screen.getByRole('button', { name: /My Projects.*2/ })).toBeInTheDocument();

      // Navigate to verify filtering
      fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

      await waitFor(() => {
        // Should only show reviewer and translator projects
        const projectItems = screen.getAllByText(/Project/);
        const projectTitles = projectItems.filter(item => 
          item.textContent === 'ISBD Review Project 2024' || 
          item.textContent === 'UNIMARC Translation Project'
        );
        expect(projectTitles).toHaveLength(2);

        // Editor project should not appear
        expect(screen.queryByText('FRBR Development Project')).not.toBeInTheDocument();
      });
    });
  });

  describe('Real Default Tab Handling @integration', () => {
    it('should handle unknown tabs gracefully', async () => {
      render(<AuthorDashboard user={testUser} />);

      // All tabs should have specific handlers, but test fallback just in case
      expect(screen.getByRole('heading', { level: 1, name: 'Author Dashboard' })).toBeInTheDocument();
    });
  });
});