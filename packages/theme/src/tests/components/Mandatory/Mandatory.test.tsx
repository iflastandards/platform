import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, describe, it, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import Mandatory from '../../../components/Mandatory';
import '@testing-library/jest-dom/vitest';

expect.extend(toHaveNoViolations);

// Mock useBaseUrl
vi.mock('@docusaurus/useBaseUrl', () => ({
  default: (url: string) => url,
}));

/**
 * @unit @ui @high-priority @accessibility
 */

describe('Mandatory component', () => {
  it('renders with default props', () => {
    const { container } = render(<Mandatory />);

    // Check wrapper
    const wrapper = container.querySelector('.mandatory');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('title', 'Mandatory');
    expect(wrapper).toHaveAttribute('aria-label', 'Mandatory');

    // Check link
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'docs/intro#i022');
    expect(link).toHaveTextContent('✽');
    expect(link).toHaveAttribute('aria-label', 'Mandatory - click for more information');
  });

  it('renders with custom link', () => {
    render(<Mandatory link="/custom/path" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/custom/path');
  });

  it('renders with custom symbol', () => {
    render(<Mandatory symbol="★" />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('★');
  });

  it('renders with custom tooltip text', () => {
    const { container } = render(<Mandatory tooltipText="Required field" />);

    const wrapper = container.querySelector('.mandatory');
    expect(wrapper).toHaveAttribute('title', 'Required field');
    expect(wrapper).toHaveAttribute('aria-label', 'Required field');

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Required field - click for more information');
  });

  it('renders with custom className', () => {
    const { container } = render(<Mandatory className="custom-mandatory" />);

    const wrapper = container.querySelector('.mandatory');
    expect(wrapper).toHaveClass('mandatory', 'custom-mandatory');
  });

  it('renders with all custom props', () => {
    const { container } = render(
      <Mandatory
        link="/help/required"
        symbol="†"
        tooltipText="This field is required"
        className="special-mandatory"
      />
    );

    const wrapper = container.querySelector('.mandatory');
    expect(wrapper).toHaveClass('mandatory', 'special-mandatory');
    expect(wrapper).toHaveAttribute('title', 'This field is required');
    expect(wrapper).toHaveAttribute('aria-label', 'This field is required');

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/help/required');
    expect(link).toHaveTextContent('†');
    expect(link).toHaveAttribute('aria-label', 'This field is required - click for more information');
  });

  it('handles custom tooltip text with default link correctly', () => {
    const { container } = render(<Mandatory tooltipText="Custom tooltip only" />);

    // Should have the hidden label for screen readers
    const hiddenLabel = container.querySelector('#mandatory-default-label');
    expect(hiddenLabel).toBeInTheDocument();
    expect(hiddenLabel).toHaveTextContent('Mandatory - click for more information');
    expect(hiddenLabel).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px'
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-labelledby', 'mandatory-default-label');
    expect(link).toHaveAttribute('aria-label', 'Custom tooltip only - click for more information');
  });

  it('does not render hidden label when both link and tooltip are custom', () => {
    const { container } = render(
      <Mandatory 
        link="/custom/help" 
        tooltipText="Custom tooltip with custom link" 
      />
    );

    const hiddenLabel = container.querySelector('#mandatory-default-label');
    expect(hiddenLabel).not.toBeInTheDocument();

    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('aria-labelledby');
    expect(link).toHaveAttribute('aria-label', 'Custom tooltip with custom link - click for more information');
  });

  it('processes relative URLs correctly', () => {
    // Without leading slash
    const { unmount } = render(<Mandatory link="relative/path" />);
    let link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'relative/path');
    unmount();

    // With leading slash
    render(<Mandatory link="/absolute/path" />);
    link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/absolute/path');
  });

  it('applies correct CSS module classes', () => {
    const { container } = render(<Mandatory />);

    const wrapper = container.querySelector('.mandatory');
    expect(wrapper?.className).toMatch(/mandatory/);

    const link = screen.getByRole('link');
    expect(link?.className).toMatch(/mandatoryLink/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Mandatory />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with custom props', async () => {
    const { container } = render(
      <Mandatory
        link="/help"
        symbol="*"
        tooltipText="Required information"
        className="custom"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with custom tooltip only', async () => {
    const { container } = render(
      <Mandatory tooltipText="Custom required field" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
