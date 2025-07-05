/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/tools/sheet-sync',

  plugins: [],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/tools/sheet-sync',
      provider: 'v8',
    },
  },

  define: {
    'import.meta.vitest': undefined,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});