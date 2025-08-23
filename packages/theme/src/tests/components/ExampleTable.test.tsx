/**
 * @unit @ui @vocabulary @low-priority
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleTable, type ExampleEntry } from '../../components/ExampleTable';
import React from 'react';

describe('ExampleTable', () => {
  const sampleEntries: ExampleEntry[] = [
    {
      element: 'has manifestation statement of title',
      elementUrl: '/docs/statements/1028.html',
      value: '"The biographical dictionary"',
      detail: 'This is a detail about the statement.'
    },
    {
      element: 'has manifestation statement of edition',
      elementUrl: '/docs/statements/1029.html',
      value: '"First published in hardback"'
    }
  ];

  it('renders all entries correctly', () => {
    render(<ExampleTable entries={sampleEntries} />);
    
    // Check if all elements are rendered
    expect(screen.getByText('has manifestation statement of title')).toBeInTheDocument();
    expect(screen.getByText('"The biographical dictionary"')).toBeInTheDocument();
    expect(screen.getByText('has manifestation statement of edition')).toBeInTheDocument();
    expect(screen.getByText('"First published in hardback"')).toBeInTheDocument();
  });

  it('renders detail buttons only for entries with details', () => {
    render(<ExampleTable entries={sampleEntries} />);
    
    // There should be exactly one detail button
    const detailButtons = screen.getAllByText('⁇⁇');
    expect(detailButtons).toHaveLength(1);
  });

  it('shows details when button is clicked', () => {
    render(<ExampleTable entries={sampleEntries} />);
    
    // Initially, detail should be hidden
    const detailText = screen.queryByText('This is a detail about the statement.');
    expect(detailText).not.toBeInTheDocument();
    
    // Click the detail button
    const detailButton = screen.getByText('⁇⁇');
    fireEvent.click(detailButton);
    
    // Now detail should be visible
    expect(screen.getByText('This is a detail about the statement.')).toBeVisible();
  });

  it('hides details when button is clicked again', () => {
    render(<ExampleTable entries={sampleEntries} />);
    
    // Click the detail button to show details
    const detailButton = screen.getByText('⁇⁇');
    fireEvent.click(detailButton);
    
    // Verify details are shown
    expect(screen.getByText('This is a detail about the statement.')).toBeVisible();
    
    // Click again to hide
    fireEvent.click(detailButton);
    
    // Verify details are hidden
    const detailText = screen.queryByText('This is a detail about the statement.');
    expect(detailText).not.toBeInTheDocument();
  });

  it('applies correct classes to elements', () => {
    render(<ExampleTable entries={sampleEntries} />);
    
    // Check for link with proper class
    const link = screen.getByText('has manifestation statement of title');
    expect(link).toHaveClass('linkMenuElement');
    
    // Check that the link has correct href
    expect(link.closest('a')).toHaveAttribute('href', '/docs/statements/1028.html');
  });
});