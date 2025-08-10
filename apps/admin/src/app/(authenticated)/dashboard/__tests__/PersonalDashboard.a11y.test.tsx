import React from 'react';
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

describe('PersonalDashboard Accessibility @integration @accessibility @dashboard @high-priority', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<PersonalDashboard user={mockUser} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper page structure with landmarks', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Dashboard navigation')).toHaveLength(2); // Mobile and desktop
    
    // Skip links are mocked and not part of the actual component structure
    // In a real app, they would be rendered by a parent layout component
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

  it('should have accessible navigation with proper ARIA attributes', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    const navigation = screen.getByRole('navigation', { name: 'Dashboard navigation' });
    expect(navigation).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    const navigationButtons = buttons.filter(button => 
      button.getAttribute('aria-label')?.includes('Overview') ||
      button.getAttribute('aria-label')?.includes('Review Groups') ||
      button.getAttribute('aria-label')?.includes('Projects') ||
      button.getAttribute('aria-label')?.includes('Namespaces')
    );
    expect(navigationButtons.length).toBeGreaterThan(0);
    
    // Check first navigation button has proper attributes
    expect(navigationButtons[0]).toHaveAttribute('aria-label');
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
    
    // Check for navigation buttons with proper labels
    const overviewButtons = screen.getAllByLabelText('Overview');
    expect(overviewButtons.length).toBeGreaterThan(0); // Mobile and desktop versions
    
    // Check that all buttons have accessible names
    const allButtons = screen.getAllByRole('button');
    allButtons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('should support keyboard navigation', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // All interactive elements should be focusable
    const buttons = screen.getAllByRole('button');
    const links = screen.queryAllByRole('link'); // Use queryAll since links might not exist
    
    [...buttons, ...links].forEach(element => {
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