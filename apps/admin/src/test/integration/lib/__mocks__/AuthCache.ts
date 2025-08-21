import { vi } from 'vitest';

export const mockCache = {
  getCachedAuthContext: vi.fn(),
  cacheAuthContext: vi.fn(),
  getCachedPermission: vi.fn(),
  cachePermission: vi.fn(),
  invalidateUser: vi.fn(),
  getStatistics: vi.fn(() => ({
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalCached: 0,
  })),
};

vi.mock('../../../../lib/cache/AuthCache', () => ({
  getAuthCache: () => mockCache,
}));
