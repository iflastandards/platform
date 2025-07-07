import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Docusaurus modules
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({ 
    colorMode: 'light', 
    setColorMode: vi.fn(),
    setLightTheme: vi.fn(),
    setDarkTheme: vi.fn(),
  }),
  useThemeConfig: () => ({
    navbar: {},
    footer: {},
  }),
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
  }),
  useHistory: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@theme/Layout', () => ({
  default: ({ children }: any) => React.createElement('div', { 'data-testid': 'layout' }, children),
}));

// Mock MUI components that might have SSR issues
vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual('@mui/material/styles') as any;
  return {
    ...actual,
    useTheme: () => ({
      palette: { 
        mode: 'light',
        primary: { main: '#4a8f5b' },
        secondary: { main: '#4a9d8e' },
      },
      breakpoints: { 
        up: (key: string) => `@media (min-width:${key})`,
        down: (key: string) => `@media (max-width:${key})`,
      },
      spacing: (value: number) => `${value * 8}px`,
    }),
  };
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Setup for fetch mocking
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});