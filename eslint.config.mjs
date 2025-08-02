/**
 * Root ESLint configuration for IFLA Standards monorepo
 * Uses the shared @ifla/eslint-config package for consistency
 */
import { typescript } from '@ifla/eslint-config';

// The typescript preset includes base, TypeScript, and test configurations
export default typescript;