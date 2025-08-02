/**
 * Main entry point for @ifla/eslint-config
 * Provides complete ESLint configuration presets for different environments
 */
import baseConfig from './configs/base.mjs';
import typescriptConfig from './configs/typescript.mjs';
import reactConfig from './configs/react.mjs';
import nextConfig from './configs/next.mjs';
import docusaurusConfig from './configs/docusaurus.mjs';
import testConfig from './configs/test.mjs';

/**
 * Create a preset configuration by combining multiple configs
 */
function createPreset(configs) {
  return configs.flat();
}

/**
 * Full configuration for TypeScript + React projects
 * This is the most common configuration for the monorepo
 */
export const typescript = createPreset([
  baseConfig,
  typescriptConfig,
  testConfig,
]);

/**
 * Configuration for React applications (includes TypeScript)
 */
export const react = createPreset([
  baseConfig,
  typescriptConfig,
  reactConfig,
  testConfig,
]);

/**
 * Configuration for Next.js applications
 */
export const next = createPreset([
  baseConfig,
  typescriptConfig,
  reactConfig,
  nextConfig,
  testConfig,
]);

/**
 * Configuration for Docusaurus sites
 */
export const docusaurus = createPreset([
  baseConfig,
  typescriptConfig,
  reactConfig,
  docusaurusConfig,
  testConfig,
]);

/**
 * Configuration for Node.js libraries and tools
 */
export const node = createPreset([
  baseConfig,
  typescriptConfig,
  testConfig,
]);

/**
 * Minimal configuration for JavaScript-only projects
 */
export const javascript = createPreset([
  baseConfig,
  testConfig,
]);

/**
 * Default export is the full TypeScript + React configuration
 */
export default typescript;

/**
 * Named exports for all configurations
 */
export {
  baseConfig,
  typescriptConfig,
  reactConfig,
  nextConfig,
  docusaurusConfig,
  testConfig,
};