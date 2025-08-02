# @ifla/eslint-config

Centralized ESLint configuration for the IFLA Standards monorepo. Provides consistent code quality rules across all workspaces using ESLint 9+ flat config format.

## 🎯 Overview

This package eliminates ESLint configuration drift by providing shared, tested configurations that all workspaces extend from. It supports TypeScript, React, Next.js, Docusaurus, and testing environments with appropriate rules for each.

## 📦 Installation

```bash
# Already installed in the monorepo
pnpm add -D @ifla/eslint-config
```

## 🚀 Usage

### Quick Start

Create an `eslint.config.mjs` in your workspace:

```javascript
// For Next.js applications
import { next } from '@ifla/eslint-config';
export default next;

// For Docusaurus sites  
import { docusaurus } from '@ifla/eslint-config';
export default docusaurus;

// For TypeScript libraries
import { typescript } from '@ifla/eslint-config';
export default typescript;
```

### Available Presets

- **`typescript`** - Base TypeScript + testing rules (default)
- **`react`** - TypeScript + React component rules
- **`next`** - React + Next.js App Router rules
- **`docusaurus`** - React + Docusaurus + MDX rules
- **`node`** - TypeScript + Node.js (for tools/scripts)
- **`javascript`** - Base JavaScript only

## 🔧 Configuration Details

### Base Rules (All Files)

- Modern JavaScript (ES2022)
- Error prevention (`no-debugger`, `no-unused-vars`)
- Code consistency (`prefer-const`, `prefer-template`)
- Performance best practices

### TypeScript Rules

- Type safety enforcement
- Unused import cleanup
- Consistent type imports
- Nullable type handling
- Best practices for TS patterns

### React Rules

- Hook compliance (`rules-of-hooks`, `exhaustive-deps`)
- JSX best practices
- Performance patterns (avoid inline functions)
- Accessibility hints
- Modern React patterns (no need for `React` import)

### Next.js Rules

- App Router patterns
- Server Component support
- API route conventions
- Static optimization
- Server Action patterns

### Docusaurus Rules

- MDX support and processing
- Documentation patterns
- Internationalization support
- Content structure rules

### Test Rules (Relaxed)

- Allow `any` in tests (with documentation)
- Console logging permitted
- Flexible patterns for mocking
- E2E test accommodations
- Unused variable exceptions

## 🎨 Customization

### Adding Workspace Rules

```javascript
import { next } from '@ifla/eslint-config';

export default [
  ...next,
  // Workspace-specific overrides
  {
    files: ['src/critical/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // Stricter than default
      'no-console': 'error',
    },
  },
  // Add custom ignores
  {
    ignores: ['src/generated/**'],
  },
];
```

### File-Specific Rules

```javascript
export default [
  ...typescript,
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'react/display-name': 'error', // Required for components
    },
  },
  {
    files: ['src/pages/**/*.tsx'],
    rules: {
      'import/no-default-export': 'off', // Pages need default exports
    },
  },
];
```

## 🧪 Rule Philosophy

### Strictness Levels

1. **Production Code**: Strict rules, errors block builds
   - Security issues → error
   - Type safety violations → error  
   - Critical bugs → error

2. **Test Code**: Relaxed rules, pragmatic patterns allowed
   - `any` with justification → allowed
   - Console logs → allowed
   - Flexible mocking patterns → allowed

3. **Config Files**: Minimal rules, build-time flexibility
   - Node.js patterns → allowed
   - Dynamic requires → allowed

### Error vs Warning Policy

- **Errors**: Block builds, must be fixed immediately
- **Warnings**: Should be addressed, but don't block development
- **Off**: Rule disabled for specific valid reasons

## 📊 Configuration Architecture

```
@ifla/eslint-config/
├── index.mjs                    # Main exports with presets
├── configs/
│   ├── base.mjs                # Core JavaScript rules
│   ├── typescript.mjs          # TypeScript-specific rules
│   ├── react.mjs              # React component rules
│   ├── next.mjs               # Next.js patterns
│   ├── docusaurus.mjs         # Docusaurus + MDX
│   └── test.mjs               # Relaxed test rules
├── utils/
│   └── ignore-patterns.mjs    # Shared ignore patterns
└── tsconfig.eslint.json       # TypeScript config for ESLint
```

## 🔍 Debugging

### Check Effective Configuration

```bash
# For a specific file
pnpm exec eslint --print-config apps/admin/src/app/page.tsx

# With our helper script
pnpm lint:check-config apps/admin/src/app/page.tsx
```

### Debug Rule Resolution

```bash
# Debug mode
pnpm lint:debug apps/admin/src/

# Or with environment variable
DEBUG=eslint:* pnpm exec eslint your-file.ts
```

## 🚨 Common Issues

### "Cannot resolve configuration"

```bash
# Ensure package is installed
pnpm install

# Check import path
import { typescript } from '@ifla/eslint-config';  // ✅ Correct
import config from '@ifla/eslint-config/typescript';  // ❌ Wrong
```

### "Parsing error" in TypeScript files

- Ensure `tsconfig.json` exists in workspace
- Check TypeScript version compatibility (`>=5.0.0`)
- Verify file patterns match your source structure

### Rules not applying

- Check file patterns in your config match your files
- Verify workspace config extends the right preset
- Use debug mode to see rule resolution

### Performance issues

- Configs avoid project-aware TypeScript rules by default
- Enable caching: `eslint --cache`
- Consider excluding large generated directories

## 📈 Version Management

### Updating ESLint Rules

1. Update dependencies in this package
2. Test changes across representative workspaces
3. Update shared configs as needed
4. Document breaking changes

### Adding New Presets

```javascript
// In index.mjs
export const yourPreset = createPreset([
  baseConfig,
  typescriptConfig,
  yourCustomConfig,
  testConfig,
]);
```

## 🤝 Contributing

### Testing Changes

```bash
# Test configuration resolution
pnpm exec eslint --print-config test-file.ts

# Test across workspaces
pnpm lint:all

# Test specific preset
cd apps/admin && pnpm exec eslint src/
```

### Adding Rules

1. Add to appropriate config file
2. Consider impact on existing code
3. Test with representative files
4. Document rationale for new rules

## 📚 References

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ESLint React Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [Nx ESLint Integration](https://nx.dev/nx-api/eslint)

## 📄 License

ISC License - Same as the monorepo root.