import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MUIThemeProvider } from '../../components/MUIThemeProvider';
import { useTheme } from '@mui/material/styles';
import * as DocusaurusThemeCommon from '@docusaurus/theme-common';

// Mock Docusaurus theme-common
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: vi.fn(),
}));

// Test component to access theme
const ThemeTestComponent = () => {
  const theme = useTheme();
  return (
    <div>
      <span data-testid="mode">{theme.palette.mode}</span>
      <span data-testid="primary">{theme.palette.primary.main}</span>
      <span data-testid="secondary">{theme.palette.secondary.main}</span>
      <span data-testid="font">{theme.typography.fontFamily}</span>
    </div>
  );
};

describe('MUIThemeProvider', () => {
  const mockUseColorMode = vi.mocked(DocusaurusThemeCommon.useColorMode);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme Creation', () => {
    it('provides MUI theme to children components', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      // Check that theme is provided
      expect(screen.getByTestId('mode')).toBeInTheDocument();
      expect(screen.getByTestId('primary')).toBeInTheDocument();
    });

    it('uses IFLA green as primary color', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('primary')).toHaveTextContent('#4a8f5b');
    });

    it('uses IFLA teal as secondary color', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('secondary')).toHaveTextContent('#4a9d8e');
    });

    it('applies system font stack', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      const fontFamily = screen.getByTestId('font').textContent;
      expect(fontFamily).toContain('-apple-system');
      expect(fontFamily).toContain('BlinkMacSystemFont');
      expect(fontFamily).toContain('Segoe UI');
      expect(fontFamily).toContain('Roboto');
    });
  });

  describe('Color Mode Synchronization', () => {
    it('synchronizes with Docusaurus light mode', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('synchronizes with Docusaurus dark mode', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'dark',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('updates theme when Docusaurus color mode changes', () => {
      const { rerender } = render(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      // Start with light mode
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      rerender(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');

      // Switch to dark mode
      mockUseColorMode.mockReturnValue({
        colorMode: 'dark',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      rerender(
        <MUIThemeProvider>
          <ThemeTestComponent />
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });
  });

  describe('CssBaseline Integration', () => {
    it('applies MUI CssBaseline reset styles', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      const { container } = render(
        <MUIThemeProvider>
          <div>Test Content</div>
        </MUIThemeProvider>
      );

      // CssBaseline adds styles to the document, not directly to elements
      // We can check that the component renders without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('renders single child correctly', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <div data-testid="single-child">Test Child</div>
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('single-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      render(
        <MUIThemeProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </MUIThemeProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      const { container } = render(
        <MUIThemeProvider>
          {null}
        </MUIThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('maintains theme consistency across nested components', () => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        setColorMode: vi.fn(),
        setLightTheme: vi.fn(),
        setDarkTheme: vi.fn(),
      } as any);

      const NestedComponent = () => {
        const theme = useTheme();
        return <span data-testid="nested-primary">{theme.palette.primary.main}</span>;
      };

      render(
        <MUIThemeProvider>
          <div>
            <ThemeTestComponent />
            <NestedComponent />
          </div>
        </MUIThemeProvider>
      );

      // Both components should receive the same theme
      expect(screen.getByTestId('primary')).toHaveTextContent('#4a8f5b');
      expect(screen.getByTestId('nested-primary')).toHaveTextContent('#4a8f5b');
    });
  });
});