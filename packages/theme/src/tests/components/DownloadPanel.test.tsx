/**
 * @unit @ui @low-priority
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DownloadPanel } from '../../components';

// Mock Docusaurus Link component
vi.mock('@docusaurus/Link', () => ({
  default: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('DownloadPanel', () => {
  it('renders with default content', () => {
    render(<DownloadPanel />);

    expect(screen.getByText('Download Resources')).toBeInTheDocument();
    expect(screen.getByText('📄 Documentation')).toBeInTheDocument();
    expect(screen.getByText('🔗 RDF Formats')).toBeInTheDocument();
    expect(
      screen.getByText('Download the complete standard documentation'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Download the standard in various RDF serializations'),
    ).toBeInTheDocument();
  });

  it('shows "Coming Soon" buttons when no URLs are provided', () => {
    render(<DownloadPanel />);

    expect(screen.getByText('Download PDF (Coming Soon)')).toBeInTheDocument();
    expect(screen.getByText('TTL (Coming Soon)')).toBeInTheDocument();
    expect(screen.getByText('JSON-LD (Coming Soon)')).toBeInTheDocument();
    expect(screen.getByText('RDF/XML (Coming Soon)')).toBeInTheDocument();

    // All "Coming Soon" buttons should be disabled
    expect(screen.getByText('Download PDF (Coming Soon)')).toBeDisabled();
    expect(screen.getByText('TTL (Coming Soon)')).toBeDisabled();
    expect(screen.getByText('JSON-LD (Coming Soon)')).toBeDisabled();
    expect(screen.getByText('RDF/XML (Coming Soon)')).toBeDisabled();
  });

  it('renders active download links when URLs are provided', () => {
    const props = {
      pdfUrl: '/downloads/standard.pdf',
      ttlUrl: '/downloads/standard.ttl',
      jsonLdUrl: '/downloads/standard.jsonld',
      xmlUrl: '/downloads/standard.xml',
    };

    render(<DownloadPanel {...props} />);

    // Should show active links instead of "Coming Soon"
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('TTL (Turtle)')).toBeInTheDocument();
    expect(screen.getByText('JSON-LD')).toBeInTheDocument();
    expect(screen.getByText('RDF/XML')).toBeInTheDocument();

    // Links should have correct href attributes
    expect(screen.getByText('Download PDF').closest('a')).toHaveAttribute(
      'href',
      '/downloads/standard.pdf',
    );
    expect(screen.getByText('TTL (Turtle)').closest('a')).toHaveAttribute(
      'href',
      '/downloads/standard.ttl',
    );
    expect(screen.getByText('JSON-LD').closest('a')).toHaveAttribute(
      'href',
      '/downloads/standard.jsonld',
    );
    expect(screen.getByText('RDF/XML').closest('a')).toHaveAttribute(
      'href',
      '/downloads/standard.xml',
    );
  });

  it('handles partial URL configuration', () => {
    render(
      <DownloadPanel pdfUrl="/docs/standard.pdf" ttlUrl="/data/standard.ttl" />,
    );

    // Should show active links for provided URLs
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('TTL (Turtle)')).toBeInTheDocument();

    // Should show "Coming Soon" for missing URLs
    expect(screen.getByText('JSON-LD (Coming Soon)')).toBeInTheDocument();
    expect(screen.getByText('RDF/XML (Coming Soon)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<DownloadPanel className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper button styling classes', () => {
    render(<DownloadPanel pdfUrl="/test.pdf" />);

    const pdfButton = screen.getByText('Download PDF');
    expect(pdfButton).toHaveClass('button', 'button--primary', 'button--block');
  });

  it('has proper RDF button styling classes', () => {
    render(<DownloadPanel ttlUrl="/test.ttl" />);

    const ttlButton = screen.getByText('TTL (Turtle)');
    expect(ttlButton).toHaveClass(
      'button',
      'button--secondary',
      'button--block',
    );
  });

  it('renders all format sections with proper headings', () => {
    render(<DownloadPanel />);

    // Check main heading
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent('Download Resources');

    // Check section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(sectionHeadings).toHaveLength(2);
    expect(sectionHeadings[0]).toHaveTextContent('📄 Documentation');
    expect(sectionHeadings[1]).toHaveTextContent('🔗 RDF Formats');
  });
});
