import config, { docusaurus } from '@ifla/eslint-config';

// Use the default TypeScript configuration for the monorepo
// Only apply Docusaurus rules to documentation sites
export default [
  ...config,

  // Apply Docusaurus-specific rules ONLY to Docusaurus documentation sites
  ...docusaurus.map((docConfig) => ({
    ...docConfig,
    files: [
      'portal/src/**/*.{js,jsx,ts,tsx}',
      'standards/*/src/**/*.{js,jsx,ts,tsx}',
      'apps/docs/src/**/*.{js,jsx,ts,tsx}',
    ],
  })),

  // Ignore all markdown and MDX files
  {
    ignores: [
      '**/*.md',
      '**/*.mdx',
      '**/package.json',
      '**/dist',
      '**/build',
      '**/.next',
      '**/.docusaurus',
      '**/node_modules',
      '**/coverage',
      '.nx',
    ],
  },

  // Ignore ISBDM template components - they are templates/examples not used directly
  {
    ignores: ['standards/ISBDM/src/components/templates/**/*.jsx'],
  },

  // Configure module boundaries to prevent circular dependencies
  {
    files: ['packages/theme/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:theme',
              onlyDependOnLibsWithTags: ['scope:theme', 'scope:tooling'],
            },
          ],
          banTransitiveDependencies: true,
          enforceBuildableLibDependency: true,
        },
      ],
    },
  },

  // Disable module boundaries for test files that import from scripts
  {
    files: ['packages/theme/src/tests/scripts/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },

  // Disable module boundaries for e2e utils and dev server scripts
  {
    files: [
      'e2e/global-setup.integration.ts',
      'e2e/utils/auth-helpers.ts',
      'e2e/utils/clerk-auth-helpers.ts',
      'e2e/utils/clerk-auth.ts',
      'test/port-manager.test.ts',
      'scripts/debug-test-users.ts',
      'scripts/scaffold-template/**',
      'scripts/test-servers.ts',
      'scripts/update-clerk-test-users.ts',
      'scripts/verify-clerk-test-users.ts',
      'scripts/test-server-manager.ts',
      'scripts/dev-servers.ts',
      'scripts/dev-servers.test.ts',
    ],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },

  // Special rules for ISBDM editor page (prototype/demo)
  {
    files: ['standards/ISBDM/src/pages/editor/**/*.tsx'],
    rules: {
      'jsx-a11y/anchor-is-valid': 'off', // Placeholder links
      'react/button-has-type': 'off', // Demo buttons without forms
      'react/self-closing-comp': 'warn',
    },
  },

  // Allow Docusaurus-specific imports in documentation sites
  {
    files: [
      'standards/**/src/**/*.{js,jsx,ts,tsx}',
      'portal/src/**/*.{js,jsx,ts,tsx}',
      'apps/docs/src/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      '@nx/enforce-module-boundaries': 'off', // Docusaurus uses special aliases like @theme, @docusaurus, @site
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'], // Docusaurus Link component uses 'to' prop instead of 'href'
          specialLink: ['to'],
          aspects: ['noHref', 'invalidHref', 'preferButton'],
        },
      ],
    },
  },
];
