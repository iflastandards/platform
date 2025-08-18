import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'schemas/index.ts',
    'schemas/Job.zod': 'schemas/Job.zod.ts',
    'schemas/Vocabulary.zod': 'schemas/Vocabulary.zod.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
