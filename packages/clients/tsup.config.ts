import { defineConfig } from 'tsup';

export default defineConfig({
  // The entry points for the package.
  // Tsup will look for `src/index.ts`, `src/supabase/index.ts`, etc.
  entry: ['src/index.ts', 'src/supabase/index.ts', 'src/github/index.ts'],
  // Generate ESM and CJS modules
  format: ['esm', 'cjs'],
  // Generate type definitions
  dts: true,
  // Clean the `dist` directory before building
  clean: true,
  // Split code into chunks for better tree-shaking
  splitting: true,
});