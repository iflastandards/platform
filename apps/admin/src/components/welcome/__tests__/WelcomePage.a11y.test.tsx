import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import WelcomePage from '../WelcomePage';

expect.extend(toHaveNoViolations);

// Mock the child components to avoid complex dependencies
vi.mock('../RequestInviteButton', () => ({
  default: function MockRequestInviteButton() {
    return (
      <button type="button" aria-label="Request invitation">
        Request Invitation
      </button>
    );
  },
}));

vi.mock('../../auth/SafeSignInButton', () => ({
  default: function MockSafeSignInButton({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

describe('WelcomePage Accessibility @integration @accessibility @ui @high-priority', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<WelcomePage />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(<WelcomePage />);
    
    // Check for main heading
    const mainHeading = container.querySelector('h1');
    expect(mainHeading).toBeTruthy();
    expect(mainHeading?.textContent).toContain('IFLA Standards Management Toolkit');
    
    // Check for section headings
    const sectionHeadings = container.querySelectorAll('h4');
    expect(sectionHeadings.length).toBeGreaterThan(0);
  });

  it('should have accessible alert with proper ARIA attributes', () => {
    const { container } = render(<WelcomePage />);
    
    // Check for alert with proper role
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });

  it('should use semantic HTML elements', () => {
    const { container } = render(<WelcomePage />);
    
    // Check for main element
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    
    // Check for header element
    const header = container.querySelector('header');
    expect(header).toBeTruthy();
    
    // Check for section elements
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
    
    // Check for footer element
    const footer = container.querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('should have properly labeled decorative icons', () => {
    const { container } = render(<WelcomePage />);
    
    // Check for icons with aria-label and role="img"
    const decorativeIcons = container.querySelectorAll('[role="img"][aria-label]');
    expect(decorativeIcons.length).toBeGreaterThan(0);
    
    // Check for specific icon labels
    const securityIcon = container.querySelector('[aria-label="Security"]');
    const collaborationIcon = container.querySelector('[aria-label="Collaboration"]');
    const multilingualIcon = container.querySelector('[aria-label="Multilingual"]');
    
    expect(securityIcon).toBeTruthy();
    expect(collaborationIcon).toBeTruthy();
    expect(multilingualIcon).toBeTruthy();
  });

  it('should have accessible buttons with proper labels', () => {
    const { container } = render(<WelcomePage />);
    
    // Check for all buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check for Sign In button (should be one of the buttons)
    const signInButton = Array.from(buttons).find(btn => 
      btn.textContent?.includes('Sign In')
    );
    expect(signInButton).toBeTruthy();
    
    // Check for Request Invitation button (should be one of the buttons)
    const requestButton = Array.from(buttons).find(btn => 
      btn.textContent?.includes('Request Invitation') || 
      btn.getAttribute('aria-label')?.includes('Request invitation')
    );
    expect(requestButton).toBeTruthy();
  });

  it('should render without errors', () => {
    const { container } = render(<WelcomePage />);
    
    // Ensure the component renders without throwing
    expect(container).toBeTruthy();
    
    // Check that main content areas are present
    const heroSection = container.querySelector('h1');
    expect(heroSection).toBeTruthy();
  });
});