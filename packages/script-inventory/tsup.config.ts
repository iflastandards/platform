import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'api/index': 'src/api/index.ts',
    'api/server': 'src/api/server.ts'
  },
  format: ['cjs', 'esm'],
  dts: false, // Disable for now due to Express type complexity
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  target: 'node18',
  platform: 'node',
  external: ['sqlite3'],
  banner: {
    js: '#!/usr/bin/env node\n'
  },
  esbuildOptions(options) {
    options.conditions = ['node'];
  }
});