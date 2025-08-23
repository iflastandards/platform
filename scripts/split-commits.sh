#!/bin/bash

# Script to split large changeset into logical commits
# Run with: bash scripts/split-commits.sh

set -e

echo "🔄 Splitting large changeset into logical commits..."
echo "⚠️  This will reset your staged changes. Continue? (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Create backup branch
echo "📌 Creating backup branch..."
git branch backup-split-$(date +%s) 2>/dev/null || true

# Reset all staged files
echo "🔄 Resetting staged files..."
git reset HEAD .

# Commit 1: ESLint & Build Configuration
echo "📦 Commit 1: ESLint & Build Configuration"
git add .eslintignore 2>/dev/null || true
git add eslint.config.mjs
git add packages/eslint-config/
git add apps/docs/eslint.config.mjs 2>/dev/null || true
git add portal/eslint.config.mjs 2>/dev/null || true
git add standards/*/eslint.config.mjs 2>/dev/null || true
git commit -m "build(eslint): migrate to centralized ESLint configuration

- Remove individual eslint.config.mjs files from sites
- Consolidate ESLint configuration in root
- Update eslint-config package with new patterns
- Remove deprecated .eslintignore

BREAKING CHANGE: Projects now use centralized ESLint config"

# Commit 2: TypeScript Configuration
echo "📐 Commit 2: TypeScript Configuration"
git add tsconfig.base.json
git add tsconfig.json
git add e2e/tsconfig.json
git add apps/admin/tsconfig.json
git add apps/docs/tsconfig.json
git add portal/tsconfig.json
git add standards/newtest/tsconfig.json
git add packages/*/tsconfig.json
git add scripts/tsconfig.json
git commit -m "build(typescript): restructure TypeScript configuration hierarchy

- Add tsconfig.base.json for shared compiler options
- Update all project tsconfig files to extend base
- Standardize path aliases across projects
- Improve type checking consistency"

# Commit 3: Test Infrastructure
echo "🧪 Commit 3: Test Infrastructure"
git add e2e/
git add playwright.config.*.ts
git add vitest.config.platform.ts
git add apps/admin/vitest.config.ts
git add packages/unified-spreadsheet/vite.config.ts
git commit -m "test: update test infrastructure and E2E configuration

- Modernize Playwright configuration
- Update Vitest platform config
- Add E2E tsconfig for better type support
- Improve test reporters and helpers"

# Commit 4: Fixtures Reorganization
echo "🎭 Commit 4: Fixtures Reorganization"
git add packages/fixtures/
git commit -m "refactor(fixtures): reorganize test fixtures structure

- Move fixtures into src directory
- Add MSW handlers for Clerk
- Create user management helpers
- Improve fixture type exports"

# Commit 5: Config & Contract Relocation
echo "🏗️ Commit 5: Config & Contract Relocation"
git add packages/contracts/
git add packages/theme/src/config/siteConfig.ts 2>/dev/null || true
git commit -m "refactor: move siteConfig to contracts package

- Relocate siteConfig.ts to packages/contracts for better sharing
- Update contracts package exports
- Add new contract schemas and types"

# Commit 6: Admin Dashboard Updates
echo "💼 Commit 6: Admin Dashboard Updates"
git add apps/admin/src/app/
git add apps/admin/src/components/
git add apps/admin/src/hooks/
git add apps/admin/src/lib/
git add apps/admin/src/providers/
git add apps/admin/src/contexts/
git add apps/admin/src/mocks/
git add apps/admin/src/test*/
git add apps/admin/next.config.js
git add apps/admin/project.json
git commit -m "feat(admin): comprehensive dashboard component updates

- Update all dashboard components for consistency
- Improve auth and permission handling
- Enhance mock data and test coverage
- Update API routes and middleware"

# Commit 7: Theme Package Updates
echo "🎨 Commit 7: Theme Package Updates"
# First add everything in theme
git add packages/theme/
# Then unstage the test scripts that moved
git reset HEAD 'packages/theme/src/tests/scripts/*.test.ts' 2>/dev/null || true
git commit -m "feat(theme): update shared components and utilities

- Enhance VocabularyTable components
- Update component tests
- Improve type definitions
- Refactor utility functions"

# Commit 8: Scripts Consolidation
echo "🔧 Commit 8: Scripts Consolidation"
git add scripts/
git commit -m "refactor(scripts): consolidate test scripts and add tagging system

- Move test scripts from theme package to scripts directory
- Add new auto-tagging system for tests
- Update build and validation scripts
- Improve developer tooling"

# Commit 9: Docusaurus Sites Cleanup
echo "🌐 Commit 9: Docusaurus Sites Cleanup"
git add standards/
git add portal/
git add apps/docs/
git commit -m "refactor(sites): clean up Docusaurus site configurations

- Remove individual ESLint configs
- Update component imports
- Clean up utility patches
- Standardize site structures"

# Commit 10: Remaining Updates
echo "📝 Commit 10: Remaining Updates"
git add .
git commit -m "chore: update remaining packages and dependencies

- Update client packages
- Enhance dev-servers functionality
- Update unified-spreadsheet adapters
- Update tool configurations
- Add fix-theme-imports helper script"

echo "✅ Successfully split into 10 logical commits!"
echo "📊 Summary:"
git log --oneline -10