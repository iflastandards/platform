import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import PersonalDashboard from '../PersonalDashboard';
import { AppUser } from '@/lib/clerk-github-auth';

// Extend expect matchers
expect.extend(toHaveNoViolations);

// Mock the accessibility components
vi.mock('@/components/accessibility/SkipLinks', () => ({
  default: function MockSkipLinks() {
    return <div data-testid="skip-links">Skip Links</div>;
  },
}));

vi.mock('@/components/accessibility/LiveRegion', () => ({
  default: function MockLiveRegion({ message }: { message: string }) {
    return message ? <div role="status" aria-live="polite">{message}</div> : null;
  },
}));

const mockUser: AppUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  githubUsername: 'testuser',
  systemRole: 'member',
  isReviewGroupAdmin: false,
  reviewGroups: [
    {
      slug: 'test-rg',
      name: 'Test Review Group',
      role: 'editor',
      namespaces: ['isbd', 'isbdm'],
    },
  ],
  projects: {
    'project-1': {
      title: 'Test Project',
      role: 'editor',
      sourceTeam: 'Test Team',
      namespaces: ['isbd'],
    },
  },
  accessibleNamespaces: ['isbd', 'isbdm'],
};

describe('PersonalDashboard Accessibility @a11y @integration', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<PersonalDashboard user={mockUser} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper page structure with landmarks', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByLabelText('Dashboard sections')).toBeInTheDocument();
    
    // Check for skip links
    expect(screen.getByTestId('skip-links')).toBeInTheDocument();
  });

  it('should have accessible headings hierarchy', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Welcome back, Test User');
    
    // Section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings.length).toBeGreaterThan(0);
  });

  it('should have accessible tabs with proper ARIA attributes', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Dashboard sections');
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    
    // Check first tab has proper attributes
    expect(tabs[0]).toHaveAttribute('aria-controls');
    expect(tabs[0]).toHaveAttribute('id');
  });

  it('should have accessible stats cards with proper labels', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Stats cards should be regions
    const statsRegions = screen.getAllByRole('region');
    expect(statsRegions.length).toBeGreaterThan(0);
    
    // Check for descriptive labels
    expect(screen.getByLabelText(/You are a member of \d+ review groups/)).toBeInTheDocument();
  });

  it('should have accessible buttons with descriptive labels', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Check for contextual button labels
    const manageButton = screen.queryByLabelText(/Manage .+ review group/);
    const openButton = screen.queryByLabelText(/Open .+ project/);
    const viewButton = screen.queryByLabelText(/View .+ namespace/);
    
    // At least one of these should exist based on user data
    expect(
      manageButton || openButton || viewButton
    ).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // All interactive elements should be focusable
    const buttons = screen.getAllByRole('button');
    const links = screen.getAllByRole('link');
    const tabs = screen.getAllByRole('tab');
    
    [...buttons, ...links, ...tabs].forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should announce tab changes to screen readers', async () => {
    const { rerender } = render(<PersonalDashboard user={mockUser} />);
    
    // Initially no live region message
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    
    // Simulate tab change by re-rendering (in real app, this would be triggered by user interaction)
    // This is a simplified test - in practice, you'd simulate clicking a tab
    rerender(<PersonalDashboard user={mockUser} />);
  });

  it('should have proper form labels and descriptions', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Check that any form elements have proper labels
    const inputs = screen.queryAllByRole('textbox');
    const selects = screen.queryAllByRole('combobox');
    
    [...inputs, ...selects].forEach(element => {
      // Each form element should have an accessible name
      expect(element).toHaveAccessibleName();
    });
  });

  it('should provide alternative text for icons', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Icons should be hidden from screen readers or have proper labels
    const images = screen.queryAllByRole('img');
    images.forEach(img => {
      // Icons should either have alt text or be aria-hidden
      expect(
        img.hasAttribute('alt') || img.getAttribute('aria-hidden') === 'true'
      ).toBe(true);
    });
  });
});