import docusaurusPlugin from '@docusaurus/eslint-plugin';
import mdxPlugin from 'eslint-plugin-mdx';

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
    rules: {
      // MDX specific rules
      'mdx/no-unescaped-entities': 'warn',
      'mdx/no-unused-expressions': 'error',
      
      // Docusaurus specific
      '@docusaurus/no-untranslated-text': 'off', // Too restrictive for development
      '@docusaurus/prefer-docusaurus-heading': 'warn',
      '@docusaurus/no-html-links': 'warn',
      
      // Relax some rules for documentation
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
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
      'mdx/no-unescaped-entities': 'off', // Common in blog posts
    },
  },
];