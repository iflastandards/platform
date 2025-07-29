import { beforeEach, afterEach } from 'vitest';

// Ensure clean environment for each test
beforeEach(() => {
  // Clear all environment variables that might affect tests
  delete process.env.BROWSER;
  
  // Reset process.argv to avoid CLI flag interference
  process.argv = ['node', 'test'];
});

afterEach(() => {
  // Additional cleanup if needed
});
