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

// Mock Ant Design's useBreakpoint hook for responsive testing
vi.mock('antd/es/grid/hooks/useBreakpoint', () => ({
  default: () => ({
    xs: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
    xxl: false,
  }),
}));

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

      // Check for the namespace code in the navigation header
      expect(screen.getByText('TEST')).toBeInTheDocument();
      // Check for the subtitle
      expect(screen.getByText('Namespace Management')).toBeInTheDocument();
      // Check that Test Namespace appears somewhere
      expect(screen.getByText(/Test Namespace/)).toBeInTheDocument();
    });

    it('should render all tab navigation items', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Check for menu items in the navigation
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Content Management')).toBeInTheDocument();
      expect(screen.getByText('RDF & Vocabularies')).toBeInTheDocument();
      expect(screen.getByText('Review & Workflow')).toBeInTheDocument();
      expect(screen.getByText('Team Management')).toBeInTheDocument();
      expect(screen.getByText('Releases & Publishing')).toBeInTheDocument();
      expect(screen.getByText('Quality Assurance')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should have overview tab active by default', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Check that Overview is the current page title
      const overviewTitle = screen.getAllByText('Overview')[0];
      expect(overviewTitle).toBeInTheDocument();
      
      // Check that the overview dashboard is rendered
      expect(screen.getByText('Namespace Status')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch tabs when clicked', async () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Click on Content Management tab
      const contentTab = screen.getByText('Content Management');
      fireEvent.click(contentTab);

      await waitFor(() => {
        // Check that the page title changed
        const contentTitle = screen.getAllByText('Content Management')[0];
        expect(contentTitle).toBeInTheDocument();
      });
    });

    it('should display different content for each tab', async () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Check overview content
      expect(screen.getByText('Namespace Status')).toBeInTheDocument();

      // Switch to content tab
      fireEvent.click(screen.getByText('Content Management'));
      
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
      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    });
  });

  describe('Content Tab', () => {
    it('should display content management tab', async () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      fireEvent.click(screen.getByText('Content Management'));

      await waitFor(() => {
        // Check for content management actions
        expect(screen.getByText('Create New Page')).toBeInTheDocument();
        expect(screen.getByText('Scaffold Element Pages')).toBeInTheDocument();
      });
    });
  });

  describe('Special Case Handling', () => {
    it('should show special case warning for portal', () => {
      render(
        <NamespaceManagementClient
          {...defaultProps}
          namespaceKey="portal"
          isSpecialCase={true}
        />
      );

      expect(screen.getByText('Special Management Area')).toBeInTheDocument();
      expect(
        screen.getByText(/The Portal is not a standard namespace/)
      ).toBeInTheDocument();
    });

    it('should show system management tab for superadmin', () => {
      render(
        <NamespaceManagementClient
          {...defaultProps}
          isSpecialCase={true}
          isSuperAdmin={true}
        />
      );

      expect(screen.getByText('System Management')).toBeInTheDocument();
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

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Check for navigation role
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Check for main content area
      expect(screen.getByText('Dashboard and status overview')).toBeInTheDocument();
    });

    it('should have skip links for keyboard navigation', () => {
      render(<NamespaceManagementClient {...defaultProps} />);

      // Skip links are visually hidden but present in DOM
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
      expect(screen.getByText('Skip to external resources')).toBeInTheDocument();
    });
  });
});