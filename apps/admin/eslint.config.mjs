/**
 * ESLint configuration for the Next.js admin app
 * Extends the shared configuration with Next.js-specific rules
 */
import { next } from '@ifla/eslint-config';

export default [
  ...next,
  // Add any admin-specific overrides here
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Example: Stricter rules for admin app
      '@typescript-eslint/no-explicit-any': 'error', // Upgrade from warn to error
      'no-console': ['error', { allow: ['warn', 'error'] }], // Stricter console usage
    },
  },
];