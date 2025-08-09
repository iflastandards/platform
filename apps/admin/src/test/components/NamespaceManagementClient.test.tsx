import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NamespaceManagementClient from '../../app/(authenticated)/dashboard/[siteKey]/NamespaceManagementClient';
import { setupFetchMock, cleanupFetchMock } from '../../lib/test-helpers/api-mocks';

vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ userId: 'test-user-id' }),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  UserButton: () => null,
  SignInButton: () => null,
  SignUpButton: () => null,
  SignOutButton: () => null,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/newtest',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ siteKey: 'newtest' }),
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => false, // Mock as desktop view
    useTheme: () => ({
      breakpoints: {
        down: () => false,
        up: () => true,
      },
      palette: {
        primary: {
          main: '#1976d2',
        },
      },
    }),
  };
});

describe('NamespaceManagementClient @unit @ui @dashboard @low-priority', () => {
  const defaultProps = {
    namespaceTitle: 'Test Namespace',
    namespaceCode: 'TEST',
    namespaceKey: 'newtest',
    githubRepo: 'iflastandards/standards-dev',
  };

  beforeEach(() => {
    setupFetchMock();
  });

  afterEach(() => {
    cleanupFetchMock();
  });

  describe('Rendering', () => {
    it('should render the component with correct namespace information', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Check for the namespace code in the navigation header (may appear multiple times due to mobile/desktop)
      expect(screen.getAllByText('TEST').length).toBeGreaterThan(0);
      // Check for the subtitle (may appear multiple times due to mobile/desktop)
      expect(screen.getAllByText('Namespace Management').length).toBeGreaterThan(0);
      // Check that Test Namespace appears somewhere (don't be specific about where)
      expect(screen.getAllByText(/Test Namespace/).length).toBeGreaterThan(0);
    });

    it('should render all tab navigation items', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Overview' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Content Management' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'RDF & Vocabularies' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Review & Workflow' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Team Management' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Releases & Publishing' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Quality Assurance' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'GitHub' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Settings' }),
      ).toBeInTheDocument();
    });

    it('should have overview tab active by default', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      // Check for the active state aria attribute
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch tabs when clicked', async () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      const contentTab = screen.getByRole('button', {
        name: 'Content Management',
      });
      fireEvent.click(contentTab);

      await waitFor(() => {
        expect(contentTab).toHaveAttribute('aria-current', 'page');
      });
    });

    it('should display different content for each tab', async () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Check overview content
      expect(screen.getByText('Namespace Status')).toBeInTheDocument();

      // Switch to content tab
      fireEvent.click(
        screen.getByRole('button', { name: 'Content Management' }),
      );
      await waitFor(() => {
        // Content tab should show action cards
        expect(screen.getByText('Create New Page')).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab', () => {
    it('should display namespace information', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      expect(screen.getByText('Namespace Status')).toBeInTheDocument();
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });
  });

  describe('Content Tab', () => {
    it('should display content management tab', async () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Content Management' }),
      );

      await waitFor(() => {
        const activeTab = screen.getByRole('button', {
          name: 'Content Management',
        });
        expect(activeTab).toHaveAttribute('aria-current', 'page');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const minimalProps = {
        namespaceTitle: 'Test',
        namespaceCode: 'TEST',
        namespaceKey: 'test',
      };

      expect(() => {
        render(<NamespaceManagementClient {...minimalProps} />);
      }).not.toThrow();
    });
  });
});
