# ESLint Strategy - Centralized Configuration

This document outlines the centralized ESLint strategy for the IFLA Standards monorepo, designed to ensure consistent code quality across all workspaces.

## 🎯 Overview

The ESLint configuration is centralized in a shared package (`@ifla/eslint-config`) that all workspaces import from. This eliminates configuration drift, simplifies maintenance, and ensures consistent linting rules across the monorepo.

## 📦 Architecture

### Core Components

```
packages/eslint-config/
├── index.mjs                    # Main entry point with presets
├── configs/
│   ├── base.mjs                # Core JavaScript rules
│   ├── typescript.mjs          # TypeScript-specific rules
│   ├── react.mjs              # React component rules
│   ├── next.mjs               # Next.js App Router rules
│   ├── docusaurus.mjs         # Docusaurus + MDX rules
│   └── test.mjs               # Relaxed rules for test files
├── utils/
│   └── ignore-patterns.mjs    # Shared ignore patterns
└── tsconfig.eslint.json       # TypeScript config for ESLint
```

### Configuration Presets

The package exports several presets for different environments:

- **`typescript`**: Base + TypeScript + Tests (default)
- **`react`**: TypeScript + React components
- **`next`**: React + Next.js App Router patterns
- **`docusaurus`**: React + Docusaurus + MDX support
- **`node`**: TypeScript + Node.js (for tools/scripts)
- **`javascript`**: Base + Tests (no TypeScript)

## 🚀 Quick Setup

### 1. Install Dependencies

The shared config package is already installed. Ensure your workspace's `package.json` has the correct dependencies:

```json
{
  "devDependencies": {
    "@ifla/eslint-config": "workspace:*",
    "eslint": "^9.32.0"
  }
}
```

### 2. Create ESLint Config

Create an `eslint.config.mjs` in your workspace root:

```javascript
// For Next.js apps
import { next } from '@ifla/eslint-config';
export default next;

// For Docusaurus sites
import { docusaurus } from '@ifla/eslint-config';
export default docusaurus;

// For Node.js tools
import { node } from '@ifla/eslint-config';
export default node;
```

### 3. Add Scripts

Nx will automatically detect and use your ESLint config. The root package.json already has optimized scripts.

## 📋 Workspace Examples

### Next.js Admin App

```javascript
// apps/admin/eslint.config.mjs
import { next } from '@ifla/eslint-config';

export default [
  ...next,
  // App-specific overrides
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // Stricter than default
    },
  },
];
```

### Docusaurus Site

```javascript
// standards/isbd/eslint.config.mjs
import { docusaurus } from '@ifla/eslint-config';

export default docusaurus;
```

### Shared Package

```javascript
// packages/theme/eslint.config.mjs
import { react } from '@ifla/eslint-config';

export default react;
```

### Node.js Tool

```javascript
// tools/sheet-sync/eslint.config.mjs
import { node } from '@ifla/eslint-config';

export default node;
```

## 🛠️ Usage Commands

### Basic Linting

```bash
# Lint affected files (recommended)
pnpm lint

# Lint all files
pnpm lint:all

# Fix issues automatically
pnpm lint:fix
```

### Advanced Commands

```bash
# Check effective config for a specific file
pnpm lint:check-config apps/admin/src/app/page.tsx

# Debug ESLint execution
pnpm lint:debug apps/admin/src

# Lint specific workspace
pnpm lint:workspace admin

# Generate HTML report
pnpm lint:report
```

### Per-Workspace Commands

```bash
# Lint specific workspace
nx lint admin
nx lint portal
nx lint @ifla/theme
```

## 🧪 CI/CD Integration

The configuration is integrated with your existing CI workflows:

### Pre-commit (via Husky)

Already configured in your existing Git hooks:

```bash
# Pre-commit runs affected linting
pnpm lint  # nx affected --target=lint
```

### GitHub Actions

Your existing workflows use these commands:

```yaml
- name: Lint code
  run: pnpm lint:affected
```

## 🔧 Configuration Details

### Base Rules (All Files)

- Modern JavaScript (ES2022)
- Consistent code style
- Error prevention
- Performance best practices

### TypeScript Rules

- Type safety enforcement
- Import/export standards
- Unused code detection
- Best practices for TS

### React Rules

- Hook compliance
- JSX best practices
- Performance patterns
- Accessibility hints

### Next.js Rules

- App Router patterns
- Server Component support
- API route conventions
- Static optimization

### Docusaurus Rules

- MDX support
- Documentation patterns
- Internationalization
- Content structure

### Test Rules (Relaxed)

- Allow `any` in tests (with justification)
- Console logging permitted
- Flexible patterns for mocking
- E2E test accommodations

## 🎨 Customization

### Workspace-Specific Rules

Add overrides to your workspace's `eslint.config.mjs`:

```javascript
import { next } from '@ifla/eslint-config';

export default [
  ...next,
  {
    files: ['src/critical/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
];
```

### Ignore Patterns

Common ignores are centralized. Add workspace-specific ignores:

```javascript
export default [
  { ignores: ['src/generated/**'] },
  ...next,
];
```

## 📊 Rule Philosophy

### Strictness Levels

1. **Production Code**: Strict rules, errors block builds
2. **Test Code**: Relaxed rules, pragmatic patterns allowed
3. **Config Files**: Minimal rules, build-time flexibility
4. **Scripts**: Relaxed rules, console output allowed

### Error vs Warning Policy

- **Errors**: Block builds, must be fixed
  - Security issues
  - Type safety violations
  - Critical bugs

- **Warnings**: Should be fixed, but don't block
  - Code quality improvements
  - Performance suggestions
  - Style inconsistencies

## 🔍 Debugging Configuration

### Check Effective Config

```bash
pnpm lint:check-config apps/admin/src/app/page.tsx
```

### Debug Rule Resolution

```bash
pnpm lint:debug apps/admin/src/components
```

### VS Code Integration

ESLint should work automatically with the VS Code extension. If you see issues:

1. Reload VS Code window
2. Check ESLint output panel
3. Verify workspace config exists

## 📈 Version Management

### Upgrading ESLint Rules

1. Update dependencies in `packages/eslint-config/package.json`
2. Test changes across representative workspaces
3. Update shared configs if needed
4. Run full monorepo lint check
5. Commit and deploy

### Adding New Rules

1. Add rules to appropriate config in `packages/eslint-config/configs/`
2. Test with representative files
3. Consider impact on existing code
4. Document breaking changes

## 🚨 Troubleshooting

### Common Issues

#### "Cannot find module '@ifla/eslint-config'"

```bash
# Ensure package is built and linked
cd packages/eslint-config
pnpm install
cd ../../
pnpm install
```

#### "Parsing error" in TypeScript files

- Check `tsconfig.json` exists in workspace
- Verify TypeScript version compatibility
- Check `parserOptions` in config

#### Rules not applied

- Verify `eslint.config.mjs` exists in workspace
- Check file patterns match your files
- Use `pnpm lint:debug` to see rule resolution

#### Performance Issues

- ESLint configs avoid project-aware rules by default
- Use `--cache` for repeated runs
- Consider excluding large generated files

### Getting Help

1. Check this documentation
2. Review existing workspace configs
3. Use debug commands to understand rule resolution
4. Check ESLint output for specific error messages

## 📚 References

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ESLint React Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [Nx ESLint Integration](https://nx.dev/nx-api/eslint)