import { defineConfig } from 'tsup';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import type { Plugin } from 'esbuild';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'components/SiteLink': 'src/components/SiteLink.tsx',
    'components/ElementReference': 'src/components/ElementReference/index.tsx',
    'components/SiteManagementLink':
      'src/components/SiteManagementLink/index.tsx',
    'components/CompactButton/index': 'src/components/CompactButton/index.tsx',
    'components/VocabularyCard/index': 'src/components/VocabularyCard/index.tsx',
    'components/NamespaceHub/index': 'src/components/NamespaceHub/index.tsx',
    'components/ElementSetCard/index': 'src/components/ElementSetCard/index.tsx',
    'hooks/usePrevious': 'src/hooks/usePrevious.ts',
    'utils/index': 'src/utils/index.ts',
    'config/index': 'src/config/index.ts',
    'config/siteConfig': 'src/config/siteConfig.ts',
    'theme/NavbarItem/ComponentTypes':
      'src/theme/NavbarItem/ComponentTypes.tsx',
  },
  format: ['esm', 'cjs'],
  // Disable built-in DTS generation - use separate tsc build
  dts: false,
  splitting: true, // Enable code splitting for better optimization
  sourcemap: true,
  clean: true, // Clean output directory before build
  outDir: 'dist',
  target: 'es2020', // Or your desired target
  platform: 'neutral', // Use neutral to avoid bundling platform-specific modules
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.treeShaking = true;
    options.minify = true;
    options.keepNames = false; // Allow mangling for smaller bundles
    options.drop = ['console', 'debugger']; // Remove console.log in production
    options.legalComments = 'none'; // Remove license comments for smaller size
    return options;
  },
  external: [
    'react',
    'react-dom',
    /^@docusaurus\/.*/,
    /^@theme\/.*/,
    'clsx',
    'prism-react-renderer',
    '@mui/material',
    '@mui/icons-material',
    /^@mui\/.*/,
  ],
  esbuildPlugins: [
    // Properly type the sass plugin
    sassPlugin({ transform: postcssModules({}) }) as Plugin,
  ],
});
