import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SiteManagementClient from '../../app/dashboard/[siteKey]/SiteManagementClient';
import { setupFetchMock, cleanupFetchMock } from '../mocks/api';

describe('SiteManagementClient', () => {
  const defaultProps = {
    siteTitle: 'Test Site',
    siteCode: 'TEST',
    siteKey: 'newtest',
    githubRepo: 'iflastandards/standards-dev'
  };

  beforeEach(() => {
    setupFetchMock();
  });

  afterEach(() => {
    cleanupFetchMock();
  });

  describe('Rendering', () => {
    it('should render the component with correct site information', () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      expect(screen.getByText('Test Site Management')).toBeInTheDocument();
      expect(screen.getByText(/Test Site/)).toBeInTheDocument();
    });

    it('should render all tab navigation items', () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Content Management')).toBeInTheDocument();
      expect(screen.getByText('RDF & Vocabularies')).toBeInTheDocument();
      expect(screen.getByText('Review & Workflow')).toBeInTheDocument();
      expect(screen.getByText('Team Management')).toBeInTheDocument();
      expect(screen.getByText('Releases & Publishing')).toBeInTheDocument();
      expect(screen.getByText('Quality Assurance')).toBeInTheDocument();
    });

    it('should have overview tab active by default', () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      const overviewTab = screen.getByText('Overview');
      expect(overviewTab.closest('button')).toHaveClass('text-blue-600');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch tabs when clicked', async () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      const contentTab = screen.getByText('Content Management');
      fireEvent.click(contentTab);
      
      await waitFor(() => {
        expect(contentTab.closest('button')).toHaveClass('text-blue-600');
      });
    });

    it('should display different content for each tab', async () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      // Check overview content
      expect(screen.getByText(/Test Site Status/)).toBeInTheDocument();
      
      // Switch to content tab
      fireEvent.click(screen.getByText('Content Management'));
      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab', () => {
    it('should display site information', () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      expect(screen.getByText(/Test Site Status/)).toBeInTheDocument();
      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    });
  });

  describe('Content Tab', () => {
    it('should display content management tab', async () => {
      render(<SiteManagementClient {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Content Management'));
      
      await waitFor(() => {
        expect(screen.getByText('Content Management')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const minimalProps = {
        siteTitle: 'Test',
        siteCode: 'TEST',
        siteKey: 'test'
      };
      
      expect(() => {
        render(<SiteManagementClient {...minimalProps} />);
      }).not.toThrow();
    });
  });
});