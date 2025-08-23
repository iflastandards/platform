import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'index.ts',
    'schemas/Job.zod': 'schemas/Job.zod.ts',
    'schemas/Vocabulary.zod': 'schemas/Vocabulary.zod.ts',
    'schemas/RdfBuild.zod': 'schemas/RdfBuild.zod.ts',
    'schemas/User.zod': 'schemas/User.zod.ts',
    'schemas/validation': 'schemas/validation.ts',
    'src/config/siteConfig': 'src/config/siteConfig.ts',
  },
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  sourcemap: true,
});
