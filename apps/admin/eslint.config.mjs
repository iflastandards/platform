/**
 * ESLint configuration for the Next.js admin app
 * Extends the shared configuration with Next.js-specific rules
 */
import { next } from '@ifla/eslint-config';

export default [
  ...next,
  // Admin-specific overrides
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Keep 'any' as warning since there are many existing uses
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow console for debugging in development
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];
