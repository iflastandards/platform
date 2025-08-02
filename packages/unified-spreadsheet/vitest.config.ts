import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/unified-spreadsheet',

  plugins: [nxViteTsPaths()],

  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/unified-spreadsheet',
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80
      }
    }
  }
});