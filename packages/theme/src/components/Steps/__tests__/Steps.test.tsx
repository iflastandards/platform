/**
 * @testing-library @unit @high-priority @ui @docs
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Steps from '../index';

describe('Steps Component', () => {
  it('renders children correctly', () => {
    render(
      <Steps>
        <ol>
          <li>First step</li>
          <li>Second step</li>
        </ol>
      </Steps>,
    );

    expect(screen.getByText('First step')).toBeDefined();
    expect(screen.getByText('Second step')).toBeDefined();
  });

  it('applies default data attributes', () => {
    const { container } = render(
      <Steps>
        <ol>
          <li>Test step</li>
        </ol>
      </Steps>,
    );

    const stepsWrapper = container.firstChild as HTMLElement;
    expect(stepsWrapper?.getAttribute('data-list-level1')).toBe('decimal');
    expect(stepsWrapper?.getAttribute('data-list-level2')).toBe('lower-alpha');
    expect(stepsWrapper?.getAttribute('data-list-level3')).toBe('lower-roman');
  });

  it('applies custom numbering styles via props', () => {
    const { container } = render(
      <Steps level1="upper-roman" level2="decimal" level3="upper-alpha">
        <ol>
          <li>Test step</li>
        </ol>
      </Steps>,
    );

    const stepsWrapper = container.firstChild as HTMLElement;
    expect(stepsWrapper?.getAttribute('data-list-level1')).toBe('upper-roman');
    expect(stepsWrapper?.getAttribute('data-list-level2')).toBe('decimal');
    expect(stepsWrapper?.getAttribute('data-list-level3')).toBe('upper-alpha');
  });

  it('maintains semantic HTML structure', () => {
    const { container } = render(
      <Steps>
        <ol>
          <li>Step 1</li>
          <li>Step 2</li>
        </ol>
      </Steps>,
    );

    // Check for proper ol and li elements
    const orderedList = container.querySelector('ol');
    const listItems = container.querySelectorAll('li');

    expect(orderedList).toBeDefined();
    expect(listItems.length).toBe(2);
  });

  it('applies CSS module classes', () => {
    const { container } = render(
      <Steps>
        <ol>
          <li>Test step</li>
        </ol>
      </Steps>,
    );

    const stepsWrapper = container.firstChild as HTMLElement;
    expect(stepsWrapper.className).toContain('steps');
  });
});
