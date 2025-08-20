import nxPlugin from '@nx/eslint-plugin';

/**
 * Nx-specific ESLint configuration
 * Provides dependency checking and module boundary enforcement
 */
export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      // Enforce module boundaries between projects
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    // Dependency checks only apply to package.json files
    files: ['**/package.json'],
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      // Check for missing, incorrect, or unused dependencies
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'],
          checkMissingDependencies: true,
          checkObsoleteDependencies: true,
          checkVersionMismatches: true,
          includeTransitiveDependencies: true,
          ignoredDependencies: [],
        },
      ],
    },
  },
];
