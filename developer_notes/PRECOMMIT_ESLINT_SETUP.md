# Pre-commit ESLint Integration

This document describes how the centralized ESLint configuration integrates with pre-commit hooks for consistent code quality.

## 🎯 Overview

The monorepo uses Husky + lint-staged to automatically run ESLint on staged files before commit, ensuring code quality issues are caught early.

## 🔧 Current Configuration

### Lint-staged Configuration

Located in root `package.json`:

```json
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx}": [
      "eslint --quiet --fix"
    ]
  }
}
```

### Pre-commit Hook

Located in `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

## 🚀 How It Works

1. **Staging Files**: When you stage files with `git add`
2. **Pre-commit Trigger**: Husky runs the pre-commit hook
3. **Lint-staged Execution**: lint-staged finds staged files matching patterns
4. **ESLint Processing**: ESLint runs with `--quiet --fix` on each file
5. **Auto-fixing**: ESLint automatically fixes issues where possible
6. **Commit Decision**: 
   - If no errors: commit proceeds
   - If errors remain: commit is blocked with error details

## 📋 File Processing

### File Patterns Processed

- `**/*.js` - JavaScript files
- `**/*.jsx` - React JSX files  
- `**/*.ts` - TypeScript files
- `**/*.tsx` - TypeScript React files

### Configuration Resolution

Each file is linted using the nearest `eslint.config.mjs`:

1. **Workspace Config**: `apps/admin/eslint.config.mjs` (Next.js rules)
2. **Package Config**: `packages/theme/eslint.config.mjs` (React rules)
3. **Root Config**: `eslint.config.mjs` (TypeScript rules)

### Rules Applied

- **Production Code**: Strict rules, errors block commits
- **Test Files**: Relaxed rules, allows testing patterns
- **Config Files**: Minimal rules, build flexibility

## 🛠️ Commands

### Manual Lint-staged

```bash
# Run lint-staged manually (useful for testing)
pnpm lint-staged

# Run on specific files
pnpm exec lint-staged --config '{"*.ts": ["eslint --fix"]}'
```

### Bypass Pre-commit (Emergency)

```bash
# Skip pre-commit hooks (use sparingly)
git commit --no-verify -m "emergency fix"

# Clean up afterwards
pnpm lint:fix
git add .
git commit -m "fix: address linting issues"
```

## 📊 Expected Behavior

### Successful Commit

```bash
$ git commit -m "feat: add new component"
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[main abc1234] feat: add new component
 2 files changed, 45 insertions(+)
```

### Blocked Commit

```bash
$ git commit -m "feat: broken component"
✔ Preparing lint-staged...
✖ Running tasks for staged files...
  → eslint --quiet --fix:
    /path/to/file.tsx
      45:10  error  Missing return type  @typescript-eslint/explicit-function-return-type
      52:5   error  'console' is not allowed  no-console

✖ lint-staged failed
```

## 🎨 Customization

### Workspace-Specific Lint-staged

For workspace-specific behavior, you can override in individual packages:

```json
// apps/admin/package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Alternative Hook Commands

```bash
# In .husky/pre-commit

# Option 1: Full affected linting (slower but comprehensive)
pnpm lint

# Option 2: Standard lint-staged (current, recommended)
pnpm lint-staged

# Option 3: Custom combination
pnpm lint-staged && pnpm typecheck
```

## 🧪 Testing Pre-commit Integration

### Test Setup

```bash
# Make a change to trigger linting
echo "const unused = 'test';" >> apps/admin/src/test.ts

# Stage the file
git add apps/admin/src/test.ts

# Attempt commit (should be blocked)
git commit -m "test: trigger linting"

# Clean up
git reset HEAD apps/admin/src/test.ts
rm apps/admin/src/test.ts
```

### Verify Configuration

```bash
# Check lint-staged configuration
pnpm exec lint-staged --help

# Check which files would be processed
pnpm exec lint-staged --list-different

# Test ESLint on specific file
pnpm exec eslint apps/admin/src/app/page.tsx
```

## 🚨 Troubleshooting

### Common Issues

#### Lint-staged Not Running

```bash
# Check Husky installation
ls -la .husky/

# Reinstall hooks
pnpm exec husky install

# Check pre-commit hook permissions
chmod +x .husky/pre-commit
```

#### ESLint Config Not Found

```bash
# Verify config exists
ls -la */eslint.config.mjs

# Check config resolution
pnpm exec eslint --print-config your-file.ts
```

#### Performance Issues

```bash
# Enable ESLint caching
pnpm exec eslint --cache your-files

# Or update lint-staged config
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx}": [
      "eslint --cache --quiet --fix"
    ]
  }
}
```

#### Rules Too Strict

1. **Temporary**: Use `--no-verify` to commit
2. **Fix Issues**: Run `pnpm lint:fix` to auto-fix
3. **Adjust Rules**: Update shared config if rules are problematic

### Debug Commands

```bash
# Debug lint-staged execution
DEBUG=lint-staged* pnpm lint-staged

# Debug ESLint execution
DEBUG=eslint:* pnpm exec eslint your-file.ts

# Dry run lint-staged
pnpm exec lint-staged --dry-run
```

## 📈 Performance Optimization

### Current Settings

- `--quiet`: Reduces output noise
- `--fix`: Automatically fixes issues
- File-level processing: Only changed files are linted

### Additional Optimizations

```json
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx}": [
      "eslint --cache --quiet --fix --max-warnings=0"
    ]
  }
}
```

### Selective Linting

For large codebases, consider workspace-specific configs:

```json
// Large workspace package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --quiet --fix --no-eslintrc --config eslint.config.critical.mjs"
    ]
  }
}
```

## 🔄 Integration with CI/CD

The pre-commit hooks work alongside CI checks:

1. **Pre-commit**: Fast feedback on individual changes
2. **CI Pipeline**: Comprehensive validation on full codebase
3. **Consistent Rules**: Same ESLint config used in both

### CI Configuration

Your existing GitHub Actions already handle this:

```yaml
# .github/workflows/ci.yml
- name: Run linting
  run: pnpm lint  # Uses nx affected
```

This ensures consistency between local pre-commit checks and CI validation.

## 📚 Best Practices

1. **Run Pre-commit Locally**: Always test before pushing
2. **Keep Rules Consistent**: Same config everywhere
3. **Fix Issues Early**: Address linting issues immediately
4. **Use Auto-fix**: Let ESLint fix what it can automatically
5. **Document Exceptions**: Comment any lint disable rules
6. **Regular Updates**: Keep ESLint rules current with team standards

The pre-commit integration ensures that code quality standards are enforced consistently across the monorepo while providing fast feedback to developers.