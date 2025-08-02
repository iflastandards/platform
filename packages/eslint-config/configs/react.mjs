import pluginReact from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

/**
 * React-specific ESLint configuration
 * For React components and JSX files
 */
export default [
  // React configuration
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react': pluginReact,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/self-closing-comp': 'error',
      'react/void-dom-elements-no-children': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/no-array-index-key': 'warn',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
      
      // Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Performance
      'react/jsx-no-bind': ['warn', {
        allowArrowFunctions: true,
        allowFunctions: false,
        allowBind: false,
      }],
      
      // Accessibility hints (basic)
      'react/button-has-type': 'error',
      'react/no-access-state-in-setstate': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // Allow JSX in .js files for backwards compatibility
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      'react': pluginReact,
    },
    rules: {
      'react/jsx-filename-extension': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];