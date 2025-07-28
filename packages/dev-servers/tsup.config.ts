import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  external: ['child_process', 'fs', 'path', 'process'],
  target: 'node18',
  outDir: 'dist',
});
