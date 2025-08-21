import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import PersonalDashboard from '../../../../app/(authenticated)/dashboard/PersonalDashboard';
import { AppUser } from '@/lib/clerk-github-auth';

// Extend expect matchers
expect.extend(toHaveNoViolations);

// Mock child components that are not relevant to this test
vi.mock('@/components/layout/TabBasedDashboardLayout', () => ({
  TabBasedDashboardLayout: ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div>
      <h1>{title}</h1>
      <main>{children}</main>
    </div>
  ),
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
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should have accessible headings hierarchy', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    // The layout mock provides the h1
    expect(screen.getByRole('heading', { level: 1, name: 'Personal Dashboard' })).toBeInTheDocument();
    
    // The component itself provides these
    expect(screen.getByRole('heading', { level: 2, name: 'Welcome back, Test User' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dashboard Overview' })).toBeInTheDocument();
  });

  it('should have accessible stats cards with proper labels', () => {
    render(<PersonalDashboard user={mockUser} />);
    
    const statsRegions = screen.getAllByRole('region');
    expect(statsRegions.length).toBeGreaterThan(0);
    
    expect(screen.getByLabelText(/You are a member of \d+ review groups/)).toBeInTheDocument();
    expect(screen.getByLabelText(/You have \d+ active projects/)).toBeInTheDocument();
    expect(screen.getByLabelText(/You have access to \d+ namespaces/)).toBeInTheDocument();
  });

  it('should provide alternative text for icons', () => {
    const { container } = render(<PersonalDashboard user={mockUser} />);
    
    const icons = container.querySelectorAll('.anticon');
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
