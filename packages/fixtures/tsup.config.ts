import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Use tsc for declarations instead
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: ['msw'],
});
