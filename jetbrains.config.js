// JetBrains IDE Configuration Helper
// This file helps JetBrains IDEs understand the monorepo structure

module.exports = {
  // Monorepo structure
  monorepo: {
    type: 'nx',
    root: __dirname,
    apps: ['apps/*', 'standards/*', 'portal'],
    libs: ['packages/*'],
  },

  // Path mappings for imports
  paths: {
    '@ifla/theme': './packages/theme/src',
    '@ifla/theme/*': './packages/theme/src/*',
    '@/*': './apps/admin/src/*',
  },

  // Nx configuration
  nx: {
    defaultProject: 'portal',
    cacheDirectory: '.nx/cache',
    plugins: ['@nx/next', '@nx/vite', '@nx/jest', '@nx/eslint'],
  },

  // Test configuration
  testing: {
    runner: 'vitest',
    config: './vitest.config.ts',
    coverage: true,
  },

  // Code style
  codeStyle: {
    indent: 2,
    quotes: 'single',
    semicolons: true,
    trailingComma: 'es5',
    printWidth: 100,
  },

  // Environment variables
  env: {
    NX_DAEMON: 'true',
    NX_PARALLEL: '8',
    NODE_OPTIONS: '--max-old-space-size=8192',
  },

  // Recommended plugins
  plugins: [
    'com.intellij.plugins.github',
    'com.jetbrains.plugins.node-remote-interpreter',
    'com.intellij.plugins.watcher',
    'org.jetbrains.plugins.node-remote-interpreter',
    'com.jetbrains.nodejs',
    'JavaScript and TypeScript',
    'Prettier',
    'ESLint',
  ],
};