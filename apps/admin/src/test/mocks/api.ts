import { vi } from 'vitest';
import {
  mockSiteData,
  mockGitHubData,
  createMockResponse,
  createMockError,
} from '../fixtures/mockData';

// Mock fetch responses
export const mockApiResponses = {
  // Site management endpoints
  getSites: () => createMockResponse(Object.values(mockSiteData)),
  getSite: (siteKey: string) => {
    const site = mockSiteData[siteKey as keyof typeof mockSiteData];
    return site
      ? createMockResponse(site)
      : createMockError('Site not found', 404);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSite: (siteKey: string, data: any) => {
    const site = mockSiteData[siteKey as keyof typeof mockSiteData];
    return site
      ? createMockResponse({ ...site, ...data })
      : createMockError('Site not found', 404);
  },

  // GitHub API endpoints
  getRepoInfo: () =>
    createMockResponse({
      name: 'standards-dev',
      full_name: mockGitHubData.repo,
      description: 'IFLA Standards Development Repository',
      html_url: `https://github.com/${mockGitHubData.repo}`,
      stargazers_count: 42,
      forks_count: 15,
      open_issues_count: 8,
    }),
  getIssues: () => createMockResponse(mockGitHubData.issues),
  getPullRequests: () => createMockResponse(mockGitHubData.pullRequests),

  // Content management endpoints
  getContent: (path: string) =>
    createMockResponse({
      path,
      content: `# Test Content\n\nThis is mock content for ${path}`,
      lastModified: new Date().toISOString(),
    }),
  updateContent: (path: string, content: string) =>
    createMockResponse({
      path,
      content,
      lastModified: new Date().toISOString(),
      success: true,
    }),

  // Build and deployment endpoints
  getBuildStatus: () =>
    createMockResponse({
      status: 'success',
      lastBuild: new Date().toISOString(),
      logs: [
        'Build started',
        'Dependencies installed',
        'Build completed successfully',
      ],
    }),
  triggerBuild: () =>
    createMockResponse({
      buildId: 'build-123',
      status: 'started',
      timestamp: new Date().toISOString(),
    }),

  // User management endpoints
  getUserPermissions: (siteKey: string) =>
    createMockResponse({
      siteKey,
      permissions: ['read', 'write', 'admin'],
      role: 'admin',
    }),
};

// Global fetch mock setup
export const setupFetchMock = () => {
  global.fetch = vi
    .fn()
    .mockImplementation(async (url: string, options?: RequestInit) => {
      const urlString = url.toString();
      const method = options?.method || 'GET';

      // Route API calls to appropriate mock responses
      if (urlString.includes('/api/sites') && method === 'GET') {
        if (urlString.match(/\/api\/sites\/[^/]+$/)) {
          const siteKey = urlString.split('/').pop();
          return mockApiResponses.getSite(siteKey || '');
        }
        return mockApiResponses.getSites();
      }

      if (urlString.includes('/api/sites') && method === 'PUT') {
        const siteKey = urlString.split('/').pop();
        const data = options?.body ? JSON.parse(options.body as string) : {};
        return mockApiResponses.updateSite(siteKey || '', data);
      }

      if (urlString.includes('/api/github/repo')) {
        return mockApiResponses.getRepoInfo();
      }

      if (urlString.includes('/api/github/issues')) {
        return mockApiResponses.getIssues();
      }

      if (urlString.includes('/api/github/pulls')) {
        return mockApiResponses.getPullRequests();
      }

      if (urlString.includes('/api/content') && method === 'GET') {
        const path = new URL(urlString).searchParams.get('path') || '';
        return mockApiResponses.getContent(path);
      }

      if (urlString.includes('/api/content') && method === 'PUT') {
        const path = new URL(urlString).searchParams.get('path') || '';
        const data = options?.body ? JSON.parse(options.body as string) : {};
        return mockApiResponses.updateContent(path, data.content);
      }

      if (urlString.includes('/api/build/status')) {
        return mockApiResponses.getBuildStatus();
      }

      if (urlString.includes('/api/build/trigger')) {
        return mockApiResponses.triggerBuild();
      }

      if (urlString.includes('/api/permissions')) {
        const siteKey = new URL(urlString).searchParams.get('siteKey') || '';
        return mockApiResponses.getUserPermissions(siteKey);
      }

      // Default fallback for unhandled requests
      return createMockError(`Unhandled request: ${method} ${urlString}`, 404);
    });
};

// Cleanup fetch mock
export const cleanupFetchMock = () => {
  vi.restoreAllMocks();
};

// Mock specific API calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockApiCall = (endpoint: string, response: any, status = 200) => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce(createMockResponse(response, status));
};

export const mockApiError = (
  endpoint: string,
  message: string,
  status = 500,
) => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce(createMockError(message, status));
};

// Helper for testing async operations
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock timers for testing
export const mockTimers = {
  setup: () => vi.useFakeTimers(),
  cleanup: () => vi.useRealTimers(),
  advance: (ms: number) => vi.advanceTimersByTime(ms),
  flush: () => vi.runAllTimers(),
};
