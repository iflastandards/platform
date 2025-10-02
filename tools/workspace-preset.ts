/**
 * IFLA Standards Platform - Custom Workspace Preset
 * 
 * This preset provides standardized scaffolding for new projects in the workspace.
 * It ensures consistent setup for Docusaurus sites, Next.js apps, and shared libraries.
 */

import { Preset } from '@nx/devkit';

const preset: Preset = {
  name: 'ifla-standards-preset',
  
  generators: {
    // Docusaurus site generator
    'docusaurus-site': {
      description: 'Generate a new IFLA standards documentation site with Docusaurus',
      factory: './generators/docusaurus-site/generator',
      schema: './generators/docusaurus-site/schema.json',
    },
    
    // Next.js admin app generator  
    'nextjs-admin': {
      description: 'Generate a new Next.js admin application with Refine.dev',
      factory: './generators/nextjs-admin/generator', 
      schema: './generators/nextjs-admin/schema.json',
    },
    
    // Shared library generator
    'shared-library': {
      description: 'Generate a new shared TypeScript library',
      factory: './generators/shared-library/generator',
      schema: './generators/shared-library/schema.json',
    },
  },
  
  // Default project configuration
  projectDefaults: {
    sourceRoot: 'src',
    targets: {
      build: {
        executor: '@nx/vite:build',
        options: {
          outputPath: 'dist/{projectName}',
        },
        configurations: {
          production: {
            mode: 'production',
          },
          development: {
            mode: 'development',
          },
        },
      },
      
      test: {
        executor: '@nx/vitest:vitest',
        outputs: ['{workspaceRoot}/coverage/{projectName}'],
        options: {
          passWithNoTests: true,
          reportsDirectory: '{workspaceRoot}/coverage/{projectName}',
        },
      },
      
      lint: {
        executor: '@nx/eslint:lint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: ['{projectRoot}/**/*.{ts,tsx,js,jsx}'],
        },
      },
      
      typecheck: {
        executor: 'nx:run-commands',
        options: {
          command: 'tsc --noEmit --project {projectRoot}/tsconfig.json',
        },
      },
    },
    
    tags: [], // Will be populated by generators
    
    implicitDependencies: [
      'package.json',
      'nx.json',
      'tsconfig.base.json',
      'eslint.config.mjs',
    ],
  },
};

export default preset;
