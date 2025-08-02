# ESLint Setup Guide - Step-by-Step Implementation

This guide provides step-by-step instructions for implementing the centralized ESLint strategy in an Nx monorepo.

## 🎯 Overview

This setup creates a shared ESLint configuration package that all workspaces extend from, eliminating configuration drift and ensuring consistency across the monorepo.

## 📋 Prerequisites

- Node.js 18+ with pnpm package manager
- Nx monorepo with TypeScript projects
- ESLint 9+ for flat config support

## 🚀 Step-by-Step Setup

### Step 1: Create Shared ESLint Package

```bash
# Create the package directory
mkdir -p packages/eslint-config

# Create package.json
cat > packages/eslint-config/package.json << 'EOF'
{
  "name": "@your-org/eslint-config",
  "version": "1.0.0",
  "description": "Shared ESLint configuration",
  "type": "module",
  "main": "./index.mjs",
  "exports": {
    ".": "./index.mjs",
    "./base": "./configs/base.mjs",
    "./typescript": "./configs/typescript.mjs",
    "./react": "./configs/react.mjs",
    "./next": "./configs/next.mjs",
    "./docusaurus": "./configs/docusaurus.mjs",
    "./test": "./configs/test.mjs"
  },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.38.0",
    "@typescript-eslint/parser": "^8.38.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "eslint-plugin-unused-imports": "^4.1.4",
    "globals": "^15.0.0",
    "typescript-eslint": "^8.38.0"
  },
  "peerDependencies": {
    "eslint": "^9.32.0",
    "typescript": ">=5.0.0"
  }
}
EOF

# Create Nx project configuration
cat > packages/eslint-config/project.json << 'EOF'
{
  "name": "@your-org/eslint-config",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/eslint-config",
  "projectType": "library",
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint",
      "options": {
        "lintFilePatterns": ["packages/eslint-config/**/*.{js,mjs,ts}"]
      }
    }
  }
}
EOF
```

### Step 2: Create Configuration Structure

```bash
# Create directories
mkdir -p packages/eslint-config/configs
mkdir -p packages/eslint-config/utils

# Create ignore patterns utility
cat > packages/eslint-config/utils/ignore-patterns.mjs << 'EOF'
export const ignorePatterns = [
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.docusaurus/**',
  '**/coverage/**',
  '**/node_modules/**',
  '**/.nx/**',
  '**/*.min.js',
  '**/*.d.ts',
];
EOF
```

### Step 3: Create Base Configuration

```bash
cat > packages/eslint-config/configs/base.mjs << 'EOF'
import globals from 'globals';
import { ignorePatterns } from '../utils/ignore-patterns.mjs';

export default [
  { ignores: ignorePatterns },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
EOF
```

### Step 4: Create TypeScript Configuration

```bash
cat > packages/eslint-config/configs/typescript.mjs << 'EOF'
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_' },
      ],
    },
  },
];
EOF
```

### Step 5: Create Framework-Specific Configurations

```bash
# React configuration
cat > packages/eslint-config/configs/react.mjs << 'EOF'
import pluginReact from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react': pluginReact,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
EOF

# Test configuration (relaxed rules)
cat > packages/eslint-config/configs/test.mjs << 'EOF'
export default [
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/tests/**/*.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
];
EOF
```

### Step 6: Create Main Entry Point

```bash
cat > packages/eslint-config/index.mjs << 'EOF'
import baseConfig from './configs/base.mjs';
import typescriptConfig from './configs/typescript.mjs';
import reactConfig from './configs/react.mjs';
import testConfig from './configs/test.mjs';

function createPreset(configs) {
  return configs.flat();
}

export const typescript = createPreset([
  baseConfig,
  typescriptConfig,
  testConfig,
]);

export const react = createPreset([
  baseConfig,
  typescriptConfig,
  reactConfig,
  testConfig,
]);

export const node = createPreset([
  baseConfig,
  typescriptConfig,
  testConfig,
]);

export default typescript;
EOF
```

### Step 7: Create TypeScript Config for ESLint

```bash
cat > packages/eslint-config/tsconfig.eslint.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "allowJs": true,
    "checkJs": false
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "**/*.mjs"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.min.js",
    "**/*.d.ts"
  ]
}
EOF
```

### Step 8: Update Root Package.json

Add the shared config as a workspace dependency:

```bash
# Add to root package.json dependencies
pnpm add @your-org/eslint-config --workspace-root
```

### Step 9: Create Root ESLint Config

```bash
cat > eslint.config.mjs << 'EOF'
import { typescript } from '@your-org/eslint-config';

export default typescript;
EOF
```

### Step 10: Create Workspace-Specific Configs

For each workspace, create an appropriate config:

```bash
# Next.js app
cat > apps/your-app/eslint.config.mjs << 'EOF'
import { react } from '@your-org/eslint-config';

export default [
  ...react,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // App-specific overrides
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
EOF

# Library package
cat > packages/your-lib/eslint.config.mjs << 'EOF'
import { typescript } from '@your-org/eslint-config';

export default typescript;
EOF
```

### Step 11: Update Package.json Scripts

```bash
# Add these scripts to root package.json
{
  "scripts": {
    "lint": "nx affected --target=lint --parallel=3 --skip-nx-cache",
    "lint:all": "nx run-many --target=lint --all --parallel=6",
    "lint:fix": "nx affected --target=lint --parallel=3 --skip-nx-cache -- --fix"
  }
}
```

### Step 12: Update Nx Project Configurations

For each project, ensure the lint target is configured:

```json
{
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["apps/your-app/**/*.{ts,tsx,js,jsx}"]
      }
    }
  }
}
```

## 🧪 Testing the Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Test Configuration Resolution

```bash
# Check config for a specific file
pnpm exec eslint --print-config apps/your-app/src/app/page.tsx
```

### Step 3: Run Linting

```bash
# Lint all affected files
pnpm lint

# Lint specific workspace
nx lint your-app

# Fix issues automatically
pnpm lint:fix
```

## 🔧 Pre-commit Integration

### Using Husky + lint-staged

```bash
# Install husky and lint-staged
pnpm add -D husky lint-staged

# Initialize husky
pnpm exec husky init

# Create pre-commit hook
echo "pnpm lint-staged" > .husky/pre-commit

# Configure lint-staged in package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix"]
  }
}
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
```

## 📊 Verification Checklist

- [ ] Shared config package created and configured
- [ ] Base, TypeScript, and framework configs implemented
- [ ] Root ESLint config uses shared package
- [ ] Workspace configs extend shared presets
- [ ] Package.json scripts updated
- [ ] Nx targets configured for linting
- [ ] Configuration resolution works (`--print-config`)
- [ ] Linting runs successfully (`pnpm lint`)
- [ ] Fix command works (`pnpm lint:fix`)
- [ ] Pre-commit hooks configured (optional)
- [ ] CI/CD pipeline includes linting

## 🎨 Customization

### Adding New Rules

1. Add rules to appropriate config in `packages/eslint-config/configs/`
2. Test with representative files
3. Update version and publish changes

### Creating New Presets

```javascript
// Add to packages/eslint-config/index.mjs
export const yourPreset = createPreset([
  baseConfig,
  typescriptConfig,
  yourCustomConfig,
  testConfig,
]);
```

### Workspace Overrides

```javascript
// In workspace eslint.config.mjs
import { react } from '@your-org/eslint-config';

export default [
  ...react,
  {
    files: ['src/critical/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
```

## 🚨 Troubleshooting

### Common Issues

1. **Module not found**: Ensure `pnpm install` was run after adding dependencies
2. **Config not found**: Check file paths and export names match
3. **Rules not applied**: Verify file patterns match your source files
4. **Performance issues**: Avoid project-aware TypeScript rules in large codebases

### Debug Commands

```bash
# Debug ESLint execution
DEBUG=eslint:* pnpm exec eslint your-file.ts

# Check effective configuration
pnpm exec eslint --print-config your-file.ts

# Lint with cache for performance
pnpm exec eslint --cache your-directory/
```

This setup provides a robust, centralized ESLint configuration that scales with your monorepo while maintaining flexibility for workspace-specific needs.