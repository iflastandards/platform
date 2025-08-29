/**
 * @unit @ui @accessibility
 * Tests for the Figure component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Figure from '../../../components/Figure';

expect.extend(toHaveNoViolations);

// Mock useBaseUrl
vi.mock('@docusaurus/useBaseUrl', () => ({
  default: (url: string) => url,
}));

// Mock React.useId for consistent testing
let idCounter = 0;
vi.spyOn(React, 'useId').mockImplementation(() => `test-id-${idCounter++}`);

/**
 * @unit @ui @accessibility @high-priority
 */

describe('Figure component @unit @ui', () => {
  beforeEach(() => {
    idCounter = 0;
  });

  it('renders correctly with required props', () => {
    const { container } = render(
      <Figure
        src="/img/test-image.png"
        caption="Test figure caption"
      />
    );

    // Check wrapper
    const wrapper = container.querySelector('[role="group"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('aria-labelledby', 'fig-caption-test-id-0');

    // Check figure element
    const figure = container.querySelector('figure');
    expect(figure).toBeInTheDocument();
    expect(figure).toHaveClass('figure', 'border', 'border-gray-400', 'p-2', 'rounded', 'text--center');

    // Check image
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/img/test-image.png');
    expect(image).toHaveAttribute('alt', 'Test figure caption'); // Uses caption as default alt
    expect(image).toHaveClass('img-fluid', 'rounded');

    // Check caption
    const caption = screen.getByText('Test figure caption');
    expect(caption).toBeInTheDocument();
    expect(caption.tagName).toBe('FIGCAPTION');
    expect(caption).toHaveAttribute('id', 'fig-caption-test-id-0');
    expect(caption).toHaveClass('figure-caption');

    // Should not have expand link
    const link = screen.queryByRole('link');
    expect(link).not.toBeInTheDocument();
  });

  it('renders with custom alt text', () => {
    render(
      <Figure
        src="/img/test-image.png"
        caption="Test figure caption"
        alt="Custom alt text for accessibility"
      />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Custom alt text for accessibility');
  });

  it('renders with expand link', () => {
    render(
      <Figure
        src="/img/test-image.png"
        caption="Test figure caption"
        expandLink="/img/full-size.png"
      />
    );

    // Should have one figcaption
    const captions = screen.getAllByRole('figure')[0].querySelectorAll('figcaption');
    expect(captions).toHaveLength(1);

    // Check expand link
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/img/full-size.png');
    expect(link).toHaveClass('linkImage');
    expect(link).toHaveAttribute('aria-label', 'Expand image - view full size Test figure caption');
    expect(link).toHaveTextContent('[Expand image]');
  });

  it('renders with custom expand text', () => {
    render(
      <Figure
        src="/img/test-image.png"
        caption="Test figure caption"
        expandLink="/img/full-size.png"
        expandText="View larger version"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('View larger version');
  });

  it('uses custom alt text in expand link aria-label', () => {
    render(
      <Figure
        src="/img/test-image.png"
        caption="Test figure caption"
        alt="Diagram of component relationships"
        expandLink="/img/full-size.png"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Expand image - view full size Diagram of component relationships');
  });

  it('processes URLs through useBaseUrl', () => {
    render(
      <Figure
        src="/img/test-image.png"
        caption="Test caption"
        expandLink="/docs/fullimages/test.html"
      />
    );

    // Both src and expandLink should be processed by useBaseUrl
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/img/test-image.png');

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/docs/fullimages/test.html');
  });

  it('applies correct CSS module classes', () => {
    const { container } = render(
      <Figure
        src="/img/test.png"
        caption="Test"
        expandLink="/expand"
      />
    );

    // CSS modules will generate hashed class names, so just check that classes exist
    const wrapper = container.querySelector('[role="group"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.className).toContain('figureWrapper');

    const figure = container.querySelector('figure');
    expect(figure).toBeInTheDocument();
    expect(figure?.className).toContain('figure');

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.className).toContain('figureImage');

    const caption = container.querySelector('figcaption');
    expect(caption).toBeInTheDocument();
    expect(caption?.className).toContain('figureCaption');

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.className).toContain('figureLink');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Figure
        src="/img/test-image.png"
        caption="Accessible figure with proper ARIA attributes"
        alt="Test image showing accessibility"
        expandLink="/img/full-size.png"
        expandText="View full size image"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('generates unique IDs for multiple instances', () => {
    const { container } = render(
      <>
        <Figure src="/img/1.png" caption="First figure" />
        <Figure src="/img/2.png" caption="Second figure" />
      </>
    );

    const captions = container.querySelectorAll('figcaption');
    expect(captions[0]).toHaveAttribute('id', 'fig-caption-test-id-0');
    expect(captions[1]).toHaveAttribute('id', 'fig-caption-test-id-1');

    const wrappers = container.querySelectorAll('[role="group"]');
    expect(wrappers[0]).toHaveAttribute('aria-labelledby', 'fig-caption-test-id-0');
    expect(wrappers[1]).toHaveAttribute('aria-labelledby', 'fig-caption-test-id-1');
  });
});