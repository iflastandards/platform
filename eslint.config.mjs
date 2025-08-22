import config from '@ifla/eslint-config';
import * as mdxPlugin from 'eslint-plugin-mdx';

// Combine base config with MDX support for root-level markdown files
export default [
  ...config,
  // Additional configuration for all markdown files in the repository
  {
    files: ['**/*.md', '**/*.mdx'],
    processor: 'mdx/remark',
    plugins: {
      'mdx': mdxPlugin,
    },
    languageOptions: {
      globals: {
        React: 'readonly',
      },
    },
    rules: {
      // Disable JS/TS rules that don't apply to documentation
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': 'off',
      'no-redeclare': 'off',
      'no-unused-expressions': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'react/jsx-no-undef': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
];
