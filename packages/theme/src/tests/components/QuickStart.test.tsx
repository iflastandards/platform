import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickStart from '../../components/QuickStart';

// Mock Docusaurus Link component
vi.mock('@docusaurus/Link', () => ({
  default: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('QuickStart', () => {
  it('renders with default content and paths', () => {
    render(<QuickStart />);
    
    expect(screen.getByText('Quick Start for Cataloguers')).toBeInTheDocument();
    expect(screen.getByText('Get started with the key sections of this standard:')).toBeInTheDocument();
    
    // Check all navigation links
    expect(screen.getByText('📖 Introduction')).toBeInTheDocument();
    expect(screen.getByText('🔧 Elements')).toBeInTheDocument();
    expect(screen.getByText('💡 Examples')).toBeInTheDocument();
  });

  it('uses default paths when none are provided', () => {
    render(<QuickStart />);
    
    // Check default href attributes
    expect(screen.getByText('📖 Introduction').closest('a')).toHaveAttribute('href', '/docs/intro');
    expect(screen.getByText('🔧 Elements').closest('a')).toHaveAttribute('href', '/docs/elements');
    expect(screen.getByText('💡 Examples').closest('a')).toHaveAttribute('href', '/docs/examples');
  });

  it('uses custom paths when provided', () => {
    const customPaths = {
      introductionPath: '/custom/introduction',
      elementsPath: '/custom/elements',
      examplesPath: '/custom/examples',
    };
    
    render(<QuickStart {...customPaths} />);
    
    // Check custom href attributes
    expect(screen.getByText('📖 Introduction').closest('a')).toHaveAttribute('href', '/custom/introduction');
    expect(screen.getByText('🔧 Elements').closest('a')).toHaveAttribute('href', '/custom/elements');
    expect(screen.getByText('💡 Examples').closest('a')).toHaveAttribute('href', '/custom/examples');
  });

  it('applies custom className', () => {
    const { container } = render(<QuickStart className="custom-quickstart" />);
    
    expect(container.firstChild).toHaveClass('custom-quickstart');
  });

  it('has proper button styling classes', () => {
    render(<QuickStart />);
    
    const introButton = screen.getByText('📖 Introduction');
    const elementsButton = screen.getByText('🔧 Elements');
    const examplesButton = screen.getByText('💡 Examples');
    
    // Introduction button should be primary
    expect(introButton).toHaveClass('button', 'button--primary', 'button--lg');
    
    // Other buttons should be secondary
    expect(elementsButton).toHaveClass('button', 'button--secondary', 'button--lg');
    expect(examplesButton).toHaveClass('button', 'button--secondary', 'button--lg');
  });

  it('renders proper heading structure', () => {
    render(<QuickStart />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Quick Start for Cataloguers');
  });

  it('handles partial path configuration', () => {
    render(<QuickStart introductionPath="/custom/intro" />);
    
    // Custom path should be used
    expect(screen.getByText('📖 Introduction').closest('a')).toHaveAttribute('href', '/custom/intro');
    
    // Default paths should be used for others
    expect(screen.getByText('🔧 Elements').closest('a')).toHaveAttribute('href', '/docs/elements');
    expect(screen.getByText('💡 Examples').closest('a')).toHaveAttribute('href', '/docs/examples');
  });

  it('supports empty string paths', () => {
    render(<QuickStart 
      introductionPath=""
      elementsPath=""
      examplesPath=""
    />);
    
    // Empty paths should result in empty href attributes
    expect(screen.getByText('📖 Introduction').closest('a')).toHaveAttribute('href', '');
    expect(screen.getByText('🔧 Elements').closest('a')).toHaveAttribute('href', '');
    expect(screen.getByText('💡 Examples').closest('a')).toHaveAttribute('href', '');
  });

  it('renders all navigation links as clickable elements', () => {
    render(<QuickStart />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    
    // All links should be properly formed
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link.getAttribute('href')).toBeTruthy();
    });
  });

  it('maintains consistent styling across all buttons', () => {
    render(<QuickStart />);
    
    const buttons = screen.getAllByRole('link');
    
    buttons.forEach(button => {
      expect(button).toHaveClass('button', 'button--lg');
    });
    
    // First button (Introduction) should be primary
    expect(buttons[0]).toHaveClass('button--primary');
    
    // Other buttons should be secondary
    expect(buttons[1]).toHaveClass('button--secondary');
    expect(buttons[2]).toHaveClass('button--secondary');
  });
});