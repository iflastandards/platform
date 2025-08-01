// Mock data for testing
export const mockAuthUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  roles: ['site-admin', 'newtest-admin'],
  attributes: {
    rgs: { ISBD: 'admin' },
    sites: { newtest: 'admin' },
  },
};

export const mockClerkAuth = {
  userId: 'test-user-id',
  sessionId: 'test-session-id',
  sessionClaims: {
    roles: ['site-admin', 'newtest-admin'],
    rgs: { ISBD: 'admin' },
    sites: { newtest: 'admin' },
  },
};

export const mockSites = [
  {
    key: 'portal',
    title: 'IFLA Portal',
    description: 'Main IFLA portal site',
    url: 'http://localhost:3000',
  },
  {
    key: 'isbdm',
    title: 'ISBD Manual',
    description: 'International Standard Bibliographic Description Manual',
    url: 'http://localhost:3001',
  },
  {
    key: 'newtest',
    title: 'Test Site',
    description: 'Test site for development and testing',
    url: 'http://localhost:3008',
  },
];

export const mockSiteData = {
  newtest: {
    title: 'Test Site',
    code: 'newtest',
    description: 'Test site for development and testing',
    url: 'http://localhost:3008',
    status: 'active',
    lastBuild: '2024-01-15T10:30:00Z',
    repository: {
      name: 'standards-dev',
      owner: 'iflastandards',
      url: 'https://github.com/iflastandards/standards-dev',
    },
    settings: {
      theme: 'default',
      language: 'en',
      features: ['search', 'navigation'],
    },
  },
  portal: {
    title: 'IFLA Portal',
    code: 'portal',
    description: 'Main IFLA portal site',
    url: 'http://localhost:3000',
    status: 'active',
    lastBuild: '2024-01-15T09:15:00Z',
    repository: {
      name: 'standards-dev',
      owner: 'iflastandards',
      url: 'https://github.com/iflastandards/standards-dev',
    },
    settings: {
      theme: 'portal',
      language: 'en',
      features: ['search', 'navigation', 'dashboard'],
    },
  },
  isbdm: {
    title: 'ISBD Manual',
    code: 'isbdm',
    description: 'International Standard Bibliographic Description Manual',
    url: 'http://localhost:3001',
    status: 'active',
    lastBuild: '2024-01-15T08:45:00Z',
    repository: {
      name: 'standards-dev',
      owner: 'iflastandards',
      url: 'https://github.com/iflastandards/standards-dev',
    },
    settings: {
      theme: 'standard',
      language: 'en',
      features: ['search', 'navigation', 'vocabulary'],
    },
  },
};

export const createMockResponse = (data: any, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

export const createMockError = (message: string, status: number = 500) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
});

export const mockGitHubData = {
  repo: 'iflastandards/standards-dev',
  issues: [
    {
      id: 1,
      number: 123,
      title: 'Update ISBDM documentation',
      state: 'open',
      html_url: 'https://github.com/iflastandards/standards-dev/issues/123',
      created_at: '2024-01-15T10:00:00Z',
      user: {
        login: 'contributor1',
        avatar_url: 'https://github.com/contributor1.png',
      },
      labels: [
        { name: 'documentation', color: '0075ca' },
        { name: 'isbdm', color: 'd73a4a' },
      ],
    },
  ],
  pullRequests: [
    {
      id: 3,
      number: 125,
      title: 'Add new vocabulary terms',
      state: 'open',
      html_url: 'https://github.com/iflastandards/standards-dev/pull/125',
      created_at: '2024-01-13T11:45:00Z',
      user: {
        login: 'contributor3',
        avatar_url: 'https://github.com/contributor3.png',
      },
      labels: [
        { name: 'enhancement', color: 'a2eeef' },
        { name: 'vocabulary', color: '0e8a16' },
      ],
    },
  ],
};
