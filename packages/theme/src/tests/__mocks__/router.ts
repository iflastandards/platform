import { vi } from 'vitest';

export const useLocation = () => ({
  pathname: '/test-path',
  search: '',
  hash: '',
  state: null,
  key: 'test-key'
});

export const useHistory = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  goBack: vi.fn(),
  goForward: vi.fn(),
  block: vi.fn(),
  listen: vi.fn()
});
