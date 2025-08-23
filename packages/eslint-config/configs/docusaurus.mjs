import docusaurusPlugin from '@docusaurus/eslint-plugin';

/**
 * Docusaurus-specific ESLint configuration
 * For Docusaurus documentation sites with v3.8+ best practices
 */
export default [
  // Ignore MDX/MD files - they cause too many false positives with current tooling
  // These files are better handled by dedicated markdown linters
  {
    ignores: ['**/*.{md,mdx}'],
  },

  // Apply Docusaurus plugin to all JS/TS files in Docusaurus projects
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@docusaurus': docusaurusPlugin,
    },
    rules: {
      // Docusaurus-specific rules
      '@docusaurus/no-untranslated-text': 'off', // Turn off i18n enforcement by default
      '@docusaurus/prefer-docusaurus-heading': 'warn',
      '@docusaurus/no-html-links': 'error', // Enforce @docusaurus/Link usage
      '@docusaurus/string-literal-i18n-messages': 'off', // Turn off for non-i18n sites
    },
    settings: {
      // Configure import resolver for Docusaurus aliases
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
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
    files: [
      '**/src/pages/**/*.{js,jsx,ts,tsx}',
      '**/src/components/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'import/no-default-export': 'off', // Pages use default exports
    },
  },
];
