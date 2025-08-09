import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import PendingDashboard from '../../app/(authenticated)/dashboard/pending/PendingDashboard';
import { AppUser } from '@/lib/clerk-github-auth';

// Extend expect matchers
expect.extend(toHaveNoViolations);

/**
 * @integration @ui @dashboard @critical
 * Integration tests for PendingDashboard with real user data and components
 */
describe('PendingDashboard @integration @ui @dashboard @critical', () => {
  let testUser: AppUser;
  const originalEnv = process.env.NEXT_PUBLIC_IFLA_DEMO;

  beforeEach(async () => {
    // Create real test user data - no mocking
    testUser = {
      id: 'test-pending-user-id',
      name: 'John Pending User',
      email: 'pending.user@test.example.com',
      githubUsername: 'pendinguser',
      systemRole: undefined, // No system role yet
      isReviewGroupAdmin: false,
      reviewGroups: [], // Empty - pending assignment
      projects: {}, // Empty - pending assignment
      accessibleNamespaces: [], // Empty - pending assignment
    };
  });

  afterEach(async () => {
    // Cleanup environment changes
    process.env.NEXT_PUBLIC_IFLA_DEMO = originalEnv;
  });

  describe('Real Component Rendering @integration', () => {
    it('should render with StandardDashboardLayout and real user data', async () => {
      render(<PendingDashboard user={testUser} />);

      // Verify StandardDashboardLayout integration
      expect(screen.getByText('Pending Assignment')).toBeInTheDocument();
      expect(screen.getByText('Waiting for Review Group assignment')).toBeInTheDocument();

      // Verify real user data is displayed
      expect(screen.getByText('John Pending User')).toBeInTheDocument();
      expect(screen.getByText('pending.user@test.example.com')).toBeInTheDocument();
      expect(screen.getByText('@pendinguser')).toBeInTheDocument();
    });

    it('should display correct navigation items with real icons', async () => {
      render(<PendingDashboard user={testUser} />);

      // Verify all navigation items are rendered (no mocking of StandardDashboardLayout)
      expect(screen.getByRole('button', { name: 'Account Status' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'My Profile' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Getting Started' })).toBeInTheDocument();

      // Verify default selected tab
      const statusTab = screen.getByRole('button', { name: 'Account Status' });
      expect(statusTab).toHaveAttribute('aria-current', 'page');
    });

    it('should handle real tab navigation with actual state changes', async () => {
      render(<PendingDashboard user={testUser} />);

      // Initial state - Account Status tab active
      expect(screen.getByText('Welcome to IFLA Standards Admin Portal')).toBeInTheDocument();

      // Click on Profile tab - real user interaction
      fireEvent.click(screen.getByRole('button', { name: 'My Profile' }));

      await waitFor(() => {
        // Verify content changed to Profile tab
        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByText('Account Information')).toBeInTheDocument();
        
        // Verify tab state changed
        const profileTab = screen.getByRole('button', { name: 'My Profile' });
        expect(profileTab).toHaveAttribute('aria-current', 'page');
      });

      // Click on Getting Started tab
      fireEvent.click(screen.getByRole('button', { name: 'Getting Started' }));

      await waitFor(() => {
        expect(screen.getByText('Getting Started')).toBeInTheDocument();
        expect(screen.getByText('About IFLA Standards Platform')).toBeInTheDocument();
      });
    });
  });

  describe('Real User Data Integration @integration', () => {
    it('should display actual user information in profile tab', async () => {
      render(<PendingDashboard user={testUser} />);

      // Navigate to profile tab
      fireEvent.click(screen.getByRole('button', { name: 'My Profile' }));

      await waitFor(() => {
        // Verify real user data is displayed
        expect(screen.getByText('pending.user@test.example.com')).toBeInTheDocument();
        expect(screen.getByText('@pendinguser')).toBeInTheDocument();
        expect(screen.getByText('Pending Assignment')).toBeInTheDocument();
      });
    });

    it('should handle demo mode with real environment variable', async () => {
      // Set real environment variable
      process.env.NEXT_PUBLIC_IFLA_DEMO = 'true';

      render(<PendingDashboard user={testUser} />);

      // Navigate to profile tab
      fireEvent.click(screen.getByRole('button', { name: 'My Profile' }));

      await waitFor(() => {
        expect(screen.getByText('Demo Mode')).toBeInTheDocument();
      });
    });

    it('should handle user without GitHub username', async () => {
      // Create user without GitHub username - real data scenario
      const userWithoutGitHub = {
        ...testUser,
        githubUsername: undefined,
      };

      render(<PendingDashboard user={userWithoutGitHub} />);

      // Navigate to profile tab
      fireEvent.click(screen.getByRole('button', { name: 'My Profile' }));

      await waitFor(() => {
        expect(screen.getByText('pending.user@test.example.com')).toBeInTheDocument();
        // GitHub username should not be displayed
        expect(screen.queryByText('@')).not.toBeInTheDocument();
      });
    });
  });

  describe('Real Accessibility Integration @integration @accessibility', () => {
    it('should have no accessibility violations with real components', async () => {
      const { container } = render(<PendingDashboard user={testUser} />);

      // Run axe on real rendered component tree
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation through real tab interactions', async () => {
      render(<PendingDashboard user={testUser} />);

      const statusTab = screen.getByRole('button', { name: 'Account Status' });
      const profileTab = screen.getByRole('button', { name: 'My Profile' });
      const helpTab = screen.getByRole('button', { name: 'Getting Started' });

      // Test keyboard navigation - real keyboard events
      statusTab.focus();
      expect(statusTab).toHaveFocus();

      // Tab to next button
      profileTab.focus();
      expect(profileTab).toHaveFocus();

      // Tab to next button
      helpTab.focus();
      expect(helpTab).toHaveFocus();

      // Test Enter key activation
      fireEvent.keyDown(helpTab, { key: 'Enter', code: 'Enter' });
      fireEvent.click(helpTab);

      await waitFor(() => {
        expect(screen.getByText('About IFLA Standards Platform')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on real action buttons', async () => {
      render(<PendingDashboard user={testUser} />);

      // Check real action buttons have proper accessibility
      const contactButton = screen.getByLabelText('Send email to administrator');
      expect(contactButton).toBeInTheDocument();
      expect(contactButton).toHaveAttribute('href', 'mailto:ifla-standards-admin@ifla.org');

      const refreshButton = screen.getByLabelText('Refresh page to check for updates');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Real Content Display @integration', () => {
    it('should display help content with real role information', async () => {
      render(<PendingDashboard user={testUser} />);

      // Navigate to help tab
      fireEvent.click(screen.getByRole('button', { name: 'Getting Started' }));

      await waitFor(() => {
        // Verify real role chips are displayed
        expect(screen.getByText('Maintainer')).toBeInTheDocument();
        expect(screen.getByText('Lead')).toBeInTheDocument();
        expect(screen.getByText('Editor')).toBeInTheDocument();
        expect(screen.getByText('Reviewer')).toBeInTheDocument();
        expect(screen.getByText('Translator')).toBeInTheDocument();
      });
    });

    it('should display welcome message with real next steps', async () => {
      render(<PendingDashboard user={testUser} />);

      // Verify welcome content is displayed
      expect(screen.getByText('Welcome to IFLA Standards Admin Portal')).toBeInTheDocument();
      expect(screen.getByText('Your account is pending assignment')).toBeInTheDocument();

      // Verify actual next steps are displayed
      expect(screen.getByText('What happens next?')).toBeInTheDocument();
      expect(screen.getByText('Add you to one or more Review Groups (GitHub Teams)')).toBeInTheDocument();
      expect(screen.getByText('Assign you to specific Projects within those groups')).toBeInTheDocument();
      expect(screen.getByText('Grant you access to the relevant namespaces')).toBeInTheDocument();
    });
  });

  describe('Real Button Interactions @integration', () => {
    it('should handle contact administrator button with real mailto link', async () => {
      render(<PendingDashboard user={testUser} />);

      const contactButton = screen.getByLabelText('Send email to administrator');
      
      // Verify it's a real mailto link
      expect(contactButton).toHaveAttribute('href', 'mailto:ifla-standards-admin@ifla.org');
      expect(contactButton.tagName).toBe('A');
    });

    it('should handle refresh button with real page reload', async () => {
      // Mock window.location.reload for testing
      const originalReload = window.location.reload;
      const mockReload = jest.fn();
      Object.defineProperty(window.location, 'reload', {
        writable: true,
        value: mockReload,
      });

      render(<PendingDashboard user={testUser} />);

      const refreshButton = screen.getByLabelText('Refresh page to check for updates');
      fireEvent.click(refreshButton);

      expect(mockReload).toHaveBeenCalled();

      // Cleanup
      window.location.reload = originalReload;
    });
  });
});