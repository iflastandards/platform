import { defineConfig } from 'tsup';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    config: 'src/config/index.ts',
    'config/siteConfigCore': 'src/config/siteConfigCore.ts',
    'config/siteConfig': 'src/config/siteConfig.ts',
    'config/siteConfig.server': 'src/config/siteConfig.server.ts',
    'config/docusaurus': 'src/config/docusaurus.ts',
    'components/SiteLink': 'src/components/SiteLink.tsx',
    'components/ElementReference': 'src/components/ElementReference/index.tsx',
    'hooks/useDocsEnv': 'src/hooks/useDocsEnv.ts',
    'hooks/usePrevious': 'src/hooks/usePrevious.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true, // Generate .d.ts files
  splitting: true, // Code splitting for better tree-shaking
  sourcemap: true,
  clean: true, // Clean output directory before build
  outDir: 'dist',
  target: 'es2020', // Or your desired target
  platform: 'browser', // 'node' or 'browser' if specific, 'neutral' for libraries
  jsx: 'react-jsx', // Handle JSX syntax
  external: [
    'react',
    'react-dom',
    /^@docusaurus\/.*/,
    /^@theme\/.*/,
    'clsx',
    'prism-react-renderer',
  ],
  esbuildPlugins: [sassPlugin({ transform: postcssModules({}) })],
});
