import type { Session } from 'next-auth';

// Mock session data for testing
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://avatars.githubusercontent.com/u/12345',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

export const mockUnauthorizedSession = null;

// Mock site data for testing
export const mockSiteData = {
  portal: {
    siteKey: 'portal',
    title: 'IFLA Standards Portal',
    code: 'PORTAL',
    description: 'Central hub for IFLA standards',
    url: 'https://standards.ifla.org',
    status: 'active',
  },
  newtest: {
    siteKey: 'newtest',
    title: 'New Test Site',
    code: 'NEWTEST',
    description: 'Testing site for development',
    url: 'https://standards.ifla.org/newtest',
    status: 'development',
  },
  isbdm: {
    siteKey: 'isbdm',
    title: 'ISBD Monograph',
    code: 'ISBDM',
    description: 'International Standard Bibliographic Description for Monographs',
    url: 'https://standards.ifla.org/isbdm',
    status: 'active',
  },
} as const;

// Mock GitHub data for testing
export const mockGitHubData = {
  repo: 'iflastandards/standards-dev',
  issues: [
    {
      id: 1,
      number: 123,
      title: 'Example issue for testing',
      state: 'open',
      url: 'https://github.com/iflastandards/standards-dev/issues/123',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T15:30:00Z',
    },
    {
      id: 2,
      number: 124,
      title: 'Another test issue',
      state: 'closed',
      url: 'https://github.com/iflastandards/standards-dev/issues/124',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-12T16:45:00Z',
    },
  ],
  pullRequests: [
    {
      id: 1,
      number: 45,
      title: 'Test pull request',
      state: 'open',
      url: 'https://github.com/iflastandards/standards-dev/pull/45',
      created_at: '2024-01-14T11:30:00Z',
      updated_at: '2024-01-14T14:20:00Z',
    },
  ],
};

// Mock environment configurations
export const mockEnvironments = {
  local: {
    name: 'local',
    baseUrl: 'http://localhost:3000',
    adminPortalUrl: 'http://localhost:3007',
  },
  development: {
    name: 'development',
    baseUrl: 'https://dev.standards.ifla.org',
    adminPortalUrl: 'https://admin-dev.standards.ifla.org',
  },
  production: {
    name: 'production',
    baseUrl: 'https://standards.ifla.org',
    adminPortalUrl: 'https://admin.standards.ifla.org',
  },
} as const;

// Mock form data for testing
export const mockFormData = {
  siteUpdate: {
    title: 'Updated Site Title',
    description: 'Updated site description',
    status: 'active' as const,
  },
  contentUpdate: {
    type: 'documentation',
    title: 'New Documentation Page',
    content: '# Test Content\n\nThis is test markdown content.',
    tags: ['test', 'documentation'],
  },
} as const;

// Test utilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

export const createMockError = (message: string, status = 500) => ({
  ok: false,
  status,
  statusText: message,
  json: async () => ({ error: message }),
});