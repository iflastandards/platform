/**
 * Next.js-specific ESLint configuration
 * For Next.js applications with App Router support
 */
import nextPlugin from '@next/eslint-plugin-next';

export default [
  // Add Next.js plugin and recommended rules
  {
    name: 'ifla/next-plugin',
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js Core Web Vitals rules (recommended)
      '@next/next/google-font-display': 'warn',
      '@next/next/google-font-preconnect': 'warn',
      '@next/next/inline-script-id': 'error',
      '@next/next/next-script-for-ga': 'warn',
      '@next/next/no-assign-module-variable': 'error',
      '@next/next/no-async-client-component': 'error',
      '@next/next/no-before-interactive-script-outside-document': 'warn',
      '@next/next/no-css-tags': 'warn',
      '@next/next/no-document-import-in-page': 'error',
      '@next/next/no-duplicate-head': 'error',
      '@next/next/no-head-element': 'warn',
      '@next/next/no-head-import-in-document': 'error',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-script-component-in-head': 'error',
      '@next/next/no-styled-jsx-in-document': 'error',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-title-in-document-head': 'warn',
      '@next/next/no-typos': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
    },
  },

  // Next.js App Router patterns
  {
    files: ['**/app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Allow async components in App Router
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'off',

      // Next.js specific patterns
      'react/display-name': 'off', // Not needed for App Router components
      'import/no-default-export': 'off', // Pages require default exports

      // Allow require in config files
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Server Components and Actions
  {
    files: [
      '**/*.(server|action).{js,jsx,ts,tsx}',
      '**/actions/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'no-console': 'off', // Server-side logging is acceptable
      'react-hooks/rules-of-hooks': 'off', // Hooks don't apply to Server Components
    },
  },

  // Next.js config files
  {
    files: ['next.config.{js,mjs,ts}', 'middleware.{js,ts}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // API routes
  {
    files: ['**/app/api/**/*.{js,ts}', '**/pages/api/**/*.{js,ts}'],
    rules: {
      'no-console': 'off', // API logging is acceptable
      'import/no-default-export': 'off', // API routes use default exports
      '@typescript-eslint/require-await': 'off',
    },
  },

  // Page components
  {
    files: [
      '**/app/**/page.{js,jsx,ts,tsx}',
      '**/app/**/layout.{js,jsx,ts,tsx}',
      '**/app/**/error.{js,jsx,ts,tsx}',
      '**/app/**/loading.{js,jsx,ts,tsx}',
      '**/app/**/not-found.{js,jsx,ts,tsx}',
    ],
    rules: {
      'import/no-default-export': 'off', // Required by Next.js
      'react/display-name': 'off',
    },
  },
];
