/**
 * Simplified Dashboard Rendering Tests
 * Basic smoke tests for dashboard components after MUI to Ant Design migration
 * @integration @dashboard @ui @high-priority
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type AppUser } from '@/lib/clerk-github-auth';

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Import dashboard components
import AuthorDashboard from '../../app/(authenticated)/dashboard/author/AuthorDashboard';
import EditorDashboard from '../../app/(authenticated)/dashboard/editor/EditorDashboard';
import AdminDashboard from '../../app/(authenticated)/dashboard/AdminDashboard';
import PendingDashboard from '../../app/(authenticated)/dashboard/pending/PendingDashboard';
import ReviewGroupDashboard from '../../app/(authenticated)/dashboard/rg/ReviewGroupDashboard';
import NamespaceDashboard from '../../app/(authenticated)/namespaces/[namespace]/NamespaceDashboard';

/**
 * @integration @ui @high-priority @dashboard
 */

describe('Dashboard Components - Basic Rendering @integration @dashboard', () => {
  let testUser: AppUser;

  beforeEach(() => {
    // Create basic test user
    testUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      githubUsername: 'testuser',
      systemRole: undefined,
      isReviewGroupAdmin: false,
      reviewGroups: ['isbd'],
      projects: {
        '1': {
          number: 1,
          title: 'Test Project',
          role: 'editor',
          namespaces: ['isbd'],
        },
      },
      accessibleNamespaces: ['isbd'],
    };

    // Mock console to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('AuthorDashboard', () => {
    it('should render without crashing', () => {
      const authorUser = {
        ...testUser,
        projects: { '1': { ...testUser.projects['1'], role: 'reviewer' } },
      };
      const { container } = render(<AuthorDashboard user={authorUser} />);
      expect(container).toBeTruthy();
    });

    it('should display user welcome message', () => {
      const authorUser = {
        ...testUser,
        projects: { '1': { ...testUser.projects['1'], role: 'translator' } },
      };
      render(<AuthorDashboard user={authorUser} />);
      expect(screen.getByText(/Welcome.*Test User/)).toBeInTheDocument();
    });
  });

  describe('EditorDashboard', () => {
    it('should render without crashing', () => {
      const { container } = render(<EditorDashboard user={testUser} />);
      expect(container).toBeTruthy();
    });

    it('should display editor role information', () => {
      render(<EditorDashboard user={testUser} />);
      // Use getAllByText and check if at least one exists
      const editorTexts = screen.getAllByText(/editor/i);
      expect(editorTexts.length).toBeGreaterThan(0);
    });
  });

  describe('AdminDashboard', () => {
    it('should render without crashing for superadmin', () => {
      const { container } = render(
        <AdminDashboard
          userRoles={['superadmin']}
          userName="Test Admin"
          userEmail="admin@test.com"
        />,
      );
      expect(container).toBeTruthy();
    });

    it('should display admin dashboard title', () => {
      render(
        <AdminDashboard
          userRoles={['superadmin']}
          userName="Test Admin"
          userEmail="admin@test.com"
        />,
      );
      // Look for any heading with Admin text
      const headings = screen.getAllByRole('heading');
      const adminHeading = headings.find((h) =>
        h.textContent?.includes('Admin'),
      );
      expect(adminHeading).toBeTruthy();
    });
  });

  describe('PendingDashboard', () => {
    it('should render without crashing', () => {
      const pendingUser = { ...testUser, projects: {} };
      const { container } = render(<PendingDashboard user={pendingUser} />);
      expect(container).toBeTruthy();
    });

    it('should display pending status message', () => {
      const pendingUser = { ...testUser, projects: {} };
      render(<PendingDashboard user={pendingUser} />);
      // Use getAllByText to handle multiple elements
      const pendingTexts = screen.getAllByText(/pending/i);
      expect(pendingTexts.length).toBeGreaterThan(0);
    });
  });

  describe('ReviewGroupDashboard', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ReviewGroupDashboard
          userRoles={['rg-admin']}
          userName="Test User"
          userEmail="test@example.com"
          reviewGroups={['isbd']}
        />,
      );
      expect(container).toBeTruthy();
    });

    it('should display review group information', () => {
      render(
        <ReviewGroupDashboard
          userRoles={['rg-admin']}
          userName="Test User"
          userEmail="test@example.com"
          reviewGroups={['isbd']}
        />,
      );
      // Check for review group related content - use getAllByText
      const contents = screen.getAllByText(/review group/i);
      expect(contents.length).toBeGreaterThan(0);
    });
  });

  describe('NamespaceDashboard', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <NamespaceDashboard
          namespace="isbd"
          userId="test-user"
          isDemo={false}
        />,
      );
      expect(container).toBeTruthy();
    });

    it('should display namespace information', () => {
      render(
        <NamespaceDashboard
          namespace="isbd"
          userId="test-user"
          isDemo={false}
        />,
      );
      // Check for namespace-specific content - use getAllByText since there might be multiple
      const contents = screen.getAllByText(/isbd/i);
      expect(contents.length).toBeGreaterThan(0);
    });
  });
});
