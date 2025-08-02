/**
 * Next.js-specific ESLint configuration
 * For Next.js applications with App Router support
 */
export default [
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
    files: ['**/*.(server|action).{js,jsx,ts,tsx}', '**/actions/*.{js,jsx,ts,tsx}'],
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
    files: ['**/app/**/page.{js,jsx,ts,tsx}', '**/app/**/layout.{js,jsx,ts,tsx}', '**/app/**/error.{js,jsx,ts,tsx}', '**/app/**/loading.{js,jsx,ts,tsx}', '**/app/**/not-found.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-default-export': 'off', // Required by Next.js
      'react/display-name': 'off',
    },
  },
];