import docusaurusPlugin from '@docusaurus/eslint-plugin';
import * as mdxPlugin from 'eslint-plugin-mdx';

/**
 * Docusaurus-specific ESLint configuration
 * For Docusaurus documentation sites
 */
export default [
  // MDX files
  {
    files: ['**/*.{md,mdx}'],
    processor: 'mdx/remark',
    plugins: {
      'mdx': mdxPlugin,
      '@docusaurus': docusaurusPlugin,
    },
    languageOptions: {
      globals: {
        React: 'readonly',
      },
    },
    rules: {
      // MDX specific rules - disabled as they cause issues with code blocks
      // The mdx/remark processor handles most MDX-specific issues
      
      // Docusaurus specific
      '@docusaurus/no-untranslated-text': 'off', // Too restrictive for development
      '@docusaurus/prefer-docusaurus-heading': 'warn',
      '@docusaurus/no-html-links': 'warn',
      
      // Disable JS/TS rules that don't apply to documentation
      'no-unused-vars': 'off',
      'no-undef': 'off', // Code examples may reference undefined vars
      'no-console': 'off', // Examples often use console
      'no-redeclare': 'off', // Examples may redeclare for clarity
      'no-unused-expressions': 'off', // JSX expressions in MDX
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'react/jsx-no-undef': 'off', // Components may be globally available
      'react/react-in-jsx-scope': 'off', // React 17+ doesn't need this
      'react/no-unescaped-entities': 'off', // False positives in prose
      'import/no-unresolved': 'off', // Example imports may not resolve
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
  
  // Docusaurus config files
  {
    files: ['**/docusaurus.config.{js,ts}', '**/sidebars.{js,ts}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'import/no-default-export': 'off',
    },
  },
  
  // Docusaurus theme components
  {
    files: ['**/src/theme/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-default-export': 'off', // Theme components use default exports
      'react/display-name': 'off',
    },
  },
  
  // Docusaurus pages and components
  {
    files: ['**/src/pages/**/*.{js,jsx,ts,tsx}', '**/src/components/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-default-export': 'off', // Pages use default exports
    },
  },
  
  // Blog posts
  {
    files: ['**/blog/**/*.{md,mdx}'],
    rules: {
      // Relaxed rules for blog posts
    },
  },
];