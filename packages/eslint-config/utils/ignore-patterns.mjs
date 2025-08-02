/**
 * Shared ignore patterns for all ESLint configurations
 * These patterns are applied globally across the monorepo
 */
export const ignorePatterns = [
  // Build outputs and generated files
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.docusaurus/**',
  '**/coverage/**',
  '**/tmp/**',
  '**/output/**',
  '**/playwright-report/**',
  '**/test-results/**',
  
  // Dependencies and caches
  '**/node_modules/**',
  '**/.nx/**',
  '**/.pnpm/**',
  
  // IDE and system files
  '**/.vscode/**',
  '**/.idea/**',
  '**/.DS_Store',
  
  // Static and runtime files
  '**/static/runtime.js',
  '**/*.min.js',
  '**/*.d.ts',
  
  // Config file timestamps
  '**/vite.config.*.timestamp*',
  '**/vitest.config.*.timestamp*',
  
  // Environment files
  '**/.env*',
];

/**
 * Additional patterns specific to certain environments
 */
export const testIgnorePatterns = [
  ...ignorePatterns,
  // Exclude fixtures from linting
  '**/fixtures/**',
  '**/test-data/**',
];

export const productionIgnorePatterns = [
  ...ignorePatterns,
  // Development-only files
  '**/*.test.{js,jsx,ts,tsx}',
  '**/*.spec.{js,jsx,ts,tsx}',
  '**/tests/**',
  '**/test/**',
  '**/__tests__/**',
  '**/e2e/**',
  '**/__mocks__/**',
];