/**
 * @unit @ui @low-priority @vocabulary
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Unique } from '../../components/Unique';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';


expect.extend(toHaveNoViolations);

describe('Unique Component', () => {
  it('renders with default props', () => {
    render(<Unique />);
    
    const element = screen.getByText('1');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('unique');
    expect(element).toHaveAttribute('title', 'Unique');
    expect(element).toHaveAttribute('aria-label', 'Unique');
  });
  
  it('renders with custom symbol', () => {
    render(<Unique symbol="U" />);
    
    const element = screen.getByText('U');
    expect(element).toBeInTheDocument();
  });
  
  it('renders with custom tooltip', () => {
    render(<Unique tooltipText="Must be unique" />);
    
    const element = screen.getByText('1');
    expect(element).toHaveAttribute('title', 'Must be unique');
    expect(element).toHaveAttribute('aria-label', 'Must be unique');
  });
  
  it('applies additional className when provided', () => {
    render(<Unique className="custom-class" />);
    
    const element = screen.getByText('1');
    expect(element).toHaveClass('custom-class');
  });
  
  it('combines all custom props', () => {
    render(
      <Unique 
        symbol="*" 
        tooltipText="One per record" 
        className="highlight-unique"
      />
    );
    
    const element = screen.getByText('*');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('title', 'One per record');
    expect(element).toHaveAttribute('aria-label', 'One per record');
    expect(element).toHaveClass('highlight-unique');
  });
  
  it('passes accessibility test', async () => {
    const { container } = render(<Unique />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});