/**
 * @unit @ui @vocabulary @low-priority
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Mandatory } from '../../components/Mandatory';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

vi.mock('@docusaurus/useBaseUrl');

expect.extend(toHaveNoViolations);

describe('Mandatory Component', () => {
  it('renders with default props', () => {
    render(<Mandatory />);
    
    const element = screen.getByTitle('Mandatory');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('mandatory');
    
    const link = screen.getByRole('link', { name: 'Mandatory - click for more information' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/docs/intro#i022');
    expect(link).toHaveAttribute('aria-label', 'Mandatory - click for more information');
  });
  
  it('renders with custom props', () => {
    render(
      <Mandatory
        link="/custom/link"
        symbol="*"
        tooltipText="Required Field"
        className="custom-class"
      />
    );
    
    const element = screen.getByTitle('Required Field');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('custom-class');
    
    const link = screen.getByRole('link', { name: 'Required Field - click for more information' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/custom/link');
    expect(link).toHaveAttribute('aria-label', 'Required Field - click for more information');
  });
  
  it('processes link through useBaseUrl', () => {
    render(<Mandatory link="docs/intro#i022" />);
    
    const link = screen.getByRole('link', { name: 'Mandatory - click for more information' });
    expect(link).toHaveAttribute('href', '/docs/intro#i022');
  });
  
  it('has proper accessibility attributes', () => {
    render(<Mandatory tooltipText="Required Element" />);
    
    const element = screen.getByTitle('Required Element');
    expect(element).toHaveAttribute('aria-label', 'Required Element');
    
    const link = screen.getByRole('link', { name: 'Mandatory - click for more information' });
    expect(link).toHaveAttribute('aria-label', 'Required Element - click for more information');
  });
  
  it('applies additional className when provided', () => {
    render(<Mandatory className="extra-class" />);
    
    const element = screen.getByTitle('Mandatory');
    expect(element).toHaveClass('extra-class');
  });
  
  it('passes accessibility test', async () => {
    const { container } = render(<Mandatory />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
