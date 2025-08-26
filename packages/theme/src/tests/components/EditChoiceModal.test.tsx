/**
 * @integration @ui @critical @accessibility
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditChoiceModal } from '../../components/EditChoiceModal';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock window.open for testing GitHub URL generation
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  configurable: true,
});

describe('EditChoiceModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    editUrl: 'https://github.com/iflastandards/standards-dev/edit/main/standards/ISBDM/docs/elements/1025.mdx',
    pageUrl: 'http://localhost:3001/ISBDM/docs/elements/1025',
    siteKey: 'ISBDM',
    pageTitle: 'has manifestation statement',
  };

  beforeEach(() => {
    mockWindowOpen.mockClear();
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up any event listeners
    document.body.style.overflow = '';
  });

  it('renders modal when isOpen is true', () => {
    render(<EditChoiceModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('How would you like to contribute?')).toBeInTheDocument();
    expect(screen.getByText('Edit on GitHub')).toBeInTheDocument();
    expect(screen.getByText('Report an Issue')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<EditChoiceModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditChoiceModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close dialog');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking backdrop', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditChoiceModal {...defaultProps} onClose={onClose} />);
    
    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditChoiceModal {...defaultProps} onClose={onClose} />);
    
    const modalTitle = screen.getByText('How would you like to contribute?');
    await user.click(modalTitle);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation - Escape key', () => {
    const onClose = vi.fn();
    
    render(<EditChoiceModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - Enter key on edit button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditChoiceModal {...defaultProps} onClose={onClose} />);
    
    const editButton = screen.getByText('Edit on GitHub').closest('button')!;
    editButton.focus();
    await user.keyboard('{Enter}');
    
    expect(mockWindowOpen).toHaveBeenCalledWith(defaultProps.editUrl, '_blank');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation - Enter key on report button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditChoiceModal {...defaultProps} onClose={onClose} />);
    
    const reportButton = screen.getByText('Report an Issue').closest('button')!;
    reportButton.focus();
    await user.keyboard('{Enter}');
    
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/iflastandards/standards-dev/issues/new'),
      '_blank'
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens correct edit URL when Edit on GitHub is clicked', async () => {
    const user = userEvent.setup();
    
    render(<EditChoiceModal {...defaultProps} />);
    
    const editButton = screen.getByText('Edit on GitHub').closest('button')!;
    await user.click(editButton);
    
    expect(mockWindowOpen).toHaveBeenCalledWith(defaultProps.editUrl, '_blank');
  });

  it('generates correct GitHub issue URL when Report an Issue is clicked', async () => {
    const user = userEvent.setup();
    
    render(<EditChoiceModal {...defaultProps} />);
    
    const reportButton = screen.getByText('Report an Issue').closest('button')!;
    await user.click(reportButton);
    
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const calledUrl = mockWindowOpen.mock.calls[0][0];
    
    // Verify the URL structure
    expect(calledUrl).toContain('https://github.com/iflastandards/standards-dev/issues/new');
    expect(calledUrl).toContain('template=documentation-issue.yml');
    expect(calledUrl).toContain('labels=documentation%2Cisbdm');
    expect(calledUrl).toContain('title=%5BISBDM%5D+Issue+with%3A+has+manifestation+statement');
    expect(calledUrl).toContain('page-url=http%3A%2F%2Flocalhost%3A3001%2FISBDM%2Fdocs%2Felements%2F1025');
  });

  it('generates issue URL without page title when not provided', async () => {
    const user = userEvent.setup();
    const propsWithoutTitle = { ...defaultProps, pageTitle: undefined };
    
    render(<EditChoiceModal {...propsWithoutTitle} />);
    
    const reportButton = screen.getByText('Report an Issue').closest('button')!;
    await user.click(reportButton);
    
    const calledUrl = mockWindowOpen.mock.calls[0][0];
    expect(calledUrl).toContain('title=%5BISBDM%5D+Documentation+Issue');
  });

  it('displays page information correctly', () => {
    render(<EditChoiceModal {...defaultProps} />);
    
    expect(screen.getByText('Page:')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.pageUrl)).toBeInTheDocument();
  });

  it('prevents body scrolling when modal is open', async () => {
    const { rerender } = render(<EditChoiceModal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
    
    rerender(<EditChoiceModal {...defaultProps} isOpen={true} />);
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  it('restores body scrolling when modal is closed', async () => {
    const { rerender } = render(<EditChoiceModal {...defaultProps} isOpen={true} />);
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
    
    rerender(<EditChoiceModal {...defaultProps} isOpen={false} />);
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('handles different site keys correctly', async () => {
    const user = userEvent.setup();
    const lrmProps = { ...defaultProps, siteKey: 'LRM' };
    
    render(<EditChoiceModal {...lrmProps} />);
    
    const reportButton = screen.getByText('Report an Issue').closest('button')!;
    await user.click(reportButton);
    
    const calledUrl = mockWindowOpen.mock.calls[0][0];
    expect(calledUrl).toContain('labels=documentation%2Clrm');
    expect(calledUrl).toContain('title=%5BLRM%5D+');
  });

  it('has proper ARIA attributes', () => {
    render(<EditChoiceModal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'edit-choice-title');
    
    const title = screen.getByText('How would you like to contribute?');
    expect(title).toHaveAttribute('id', 'edit-choice-title');
  });

  it('has descriptive button text and labels', () => {
    render(<EditChoiceModal {...defaultProps} />);
    
    expect(screen.getByText('Edit on GitHub')).toBeInTheDocument();
    expect(screen.getByText('Make changes directly to the documentation')).toBeInTheDocument();
    expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    expect(screen.getByText('Let others know about a problem you found')).toBeInTheDocument();
  });

  it('passes accessibility tests', async () => {
    const { container } = render(<EditChoiceModal {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes accessibility tests when closed', async () => {
    const { container } = render(<EditChoiceModal {...defaultProps} isOpen={false} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('URL encoding and special characters', () => {
    it('handles page URLs with special characters', async () => {
      const user = userEvent.setup();
      const specialProps = {
        ...defaultProps,
        pageUrl: 'http://localhost:3001/ISBDM/docs/elements/P1025?test=value&other=test#section',
        pageTitle: 'Title with "quotes" and & symbols',
      };
      
      render(<EditChoiceModal {...specialProps} />);
      
      const reportButton = screen.getByText('Report an Issue').closest('button')!;
      await user.click(reportButton);
      
      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain(encodeURIComponent(specialProps.pageUrl));
      expect(calledUrl).toContain('Title+with+%22quotes%22+and+%26+symbols');
    });

    it('handles non-ASCII characters in page titles', async () => {
      const user = userEvent.setup();
      const unicodeProps = {
        ...defaultProps,
        pageTitle: 'Título con acentos y símbolos çñü',
      };
      
      render(<EditChoiceModal {...unicodeProps} />);
      
      const reportButton = screen.getByText('Report an Issue').closest('button')!;
      await user.click(reportButton);
      
      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('T%C3%ADtulo+con+acentos+y+s%C3%ADmbolos+%C3%A7%C3%B1%C3%BC');
    });
  });

  describe('Component cleanup and memory leaks', () => {
    it('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<EditChoiceModal {...defaultProps} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('properly manages effect dependencies', () => {
      const { rerender } = render(<EditChoiceModal {...defaultProps} isOpen={false} />);
      
      // Should not add listeners when closed
      expect(document.body.style.overflow).toBe('');
      
      // Should add listeners when opened
      rerender(<EditChoiceModal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      // Should clean up when closed again
      rerender(<EditChoiceModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });
});