/**
 * Unit Tests for ImportWorkflow Component
 * Part of the 5-level testing strategy - Level 1: Unit Tests
 * These are fast tests that run in pre-commit
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImportWorkflow from '../ImportWorkflow';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock data
vi.mock('@/lib/mock-data/namespaces-extended', () => ({
  mockNamespaces: {
    isbd: {
      slug: 'isbd',
      name: 'ISBD',
      description: 'International Standard Bibliographic Description',
    },
    lrm: {
      slug: 'lrm',
      name: 'LRM', 
      description: 'Library Reference Model',
    },
  },
}));

describe('ImportWorkflow - Fast Unit Tests', () => {
  it('should render without crashing', () => {
    render(
      <ImportWorkflow 
        userRoles={['ifla-admin']}
        userName="Test User"
        userEmail="test@example.com"
        accessibleNamespaces={['isbd', 'lrm']}
      />
    );

    expect(screen.getByText('Import Vocabulary')).toBeInTheDocument();
  });

  it('should show import progress stepper', () => {
    render(
      <ImportWorkflow 
        userRoles={['ifla-admin']}
        userName="Test User"
        userEmail="test@example.com"
        accessibleNamespaces={['isbd', 'lrm']}
      />
    );

    expect(screen.getByText('Import Progress')).toBeInTheDocument();
    expect(screen.getByText('Select Namespace')).toBeInTheDocument();
    expect(screen.getByText('Provide Source Data')).toBeInTheDocument();
    expect(screen.getByText('Configure Profile')).toBeInTheDocument();
    expect(screen.getByText('Validate & Preview')).toBeInTheDocument();
    expect(screen.getByText('Execute Import')).toBeInTheDocument();
  });

  it('should show namespace selection on first step', () => {
    render(
      <ImportWorkflow 
        userRoles={['ifla-admin']}
        userName="Test User"
        userEmail="test@example.com"
        accessibleNamespaces={['isbd', 'lrm']}
      />
    );

    expect(screen.getByText('Select Target Namespace')).toBeInTheDocument();
    expect(screen.getByText('Choose the namespace where your vocabulary will be imported.')).toBeInTheDocument();
  });

  it('should disable next button when no namespace selected', () => {
    render(
      <ImportWorkflow 
        userRoles={['ifla-admin']}
        userName="Test User"
        userEmail="test@example.com"
        accessibleNamespaces={['isbd', 'lrm']}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should show all 5 steps in stepper', () => {
    render(
      <ImportWorkflow 
        userRoles={['ifla-admin']}
        userName="Test User"
        userEmail="test@example.com"
        accessibleNamespaces={['isbd', 'lrm']}
      />
    );

    const steps = [
      'Select Namespace',
      'Provide Source Data',
      'Configure Profile',
      'Validate & Preview',
      'Execute Import',
    ];

    steps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });
});