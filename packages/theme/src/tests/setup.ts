import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Mock Docusaurus modules globally
vi.mock('@docusaurus/Link', () => ({
  default: ({ to, href, children, ...props }: any) => {
    const url = to || href || '#';
    return React.createElement('a', { href: url, ...props }, children);
  },
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      title: 'Test Site',
      tagline: 'Test tagline',
      url: 'https://test.com',
      baseUrl: '/',
    },
    i18n: {
      currentLocale: 'en',
      locales: ['en'],
      defaultLocale: 'en',
    },
  }),
}));

vi.mock('@docusaurus/useBaseUrl', () => ({
  default: (path: string) => {
    if (typeof path !== 'string') return path;
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return '/' + path;
  },
}));

vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({ colorMode: 'light' }),
}));

vi.mock('@theme/Tabs', () => ({
  default: ({ children, ...props }: any) => React.createElement('div', props, children),
}));

vi.mock('@theme/TabItem', () => ({
  default: ({ children, ...props }: any) => React.createElement('div', props, children),
}));

vi.mock('@theme/CodeBlock', () => ({
  default: ({ children, ...props }: any) => React.createElement('pre', props, React.createElement('code', null, children)),
}));

vi.mock('@theme/Heading', () => ({
  default: ({ as: Component = 'h2', children, ...props }: any) => {
    return React.createElement(Component, props, children);
  },
}));

vi.mock('@docusaurus/router', () => ({
  useHistory: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    location: { pathname: '/' },
  }),
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@docusaurus/BrowserOnly', () => ({
  default: ({ children, fallback = null }: any) => {
    if (typeof children === 'function') {
      return children();
    }
    return children || fallback;
  },
}));

// Ensure DOM cleanup after each test
afterEach(() => {
  cleanup();
});