# Branch Protection Configuration

Documentation of branch protection rules for the IFLA Standards Platform repository.

## Overview

The repository uses GitHub branch protection to enforce quality gates and workflows while balancing security with developer productivity.

## Branch: `main` (Production)

**Status:** Full protection with strict requirements

**Protection Rules:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date before merging
- ✅ Include administrators (no bypass allowed)

**Purpose:** Production branch - maximum safety, zero direct pushes allowed.

## Branch: `preview` (Staging/Development)

**Status:** Protected with admin bypass privileges

**Last Updated:** October 2, 2025

### Protection Rules

```json
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "Validate PR (Lint, Typecheck, Test)",
      "Build Preview"
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "enforce_admins": false,
  "required_linear_history": false,
  "allow_force_pushes": true,
  "allow_deletions": false
}
```

### Access Levels

**Organization Owners & Repository Admins:**
- ✅ Can push directly to `preview`
- ✅ Can bypass pull request requirements
- ✅ Can bypass review requirements
- ✅ Can force push
- ✅ Can edit files directly on GitHub

**All Other Contributors:**
- ❌ Cannot push directly to `preview`
- ✅ Must create pull requests
- ✅ Must receive 1 approving review
- ✅ Must pass required status checks
- ❌ Cannot edit files directly on GitHub

### Required Status Checks

Both checks must pass before merging PRs:

1. **"Validate PR (Lint, Typecheck, Test)"**
   - Runs linting checks
   - Runs TypeScript type checking
   - Runs unit and integration tests
   - Workflow: `.github/workflows/pr-validation.yml`

2. **"Build Preview"**
   - Builds all affected documentation sites
   - Validates build success
   - Collects build warnings
   - Workflow: `.github/workflows/pr-validation.yml`

### Rationale

The `preview` branch protection is designed to:

1. **Enforce PR workflow for contributors** - Ensures all external contributions go through review
2. **Maintain flexibility for maintainers** - Allows quick hotfixes and direct pushes when needed
3. **Preserve local development workflow** - Pre-push hooks handle validation for direct pushes
4. **Balance safety with productivity** - Strict for team, flexible for ownership

## Local Development Workflow

### For Organization Owners/Admins

**Recommended workflow:**
```bash
# Make changes locally
git checkout -b feature/my-feature
git commit -m "feat: description"

# Pre-push hook validates:
# - TypeScript compilation
# - Linting
# - Unit tests
# - Integration tests (affected only)
# - Builds (affected only)

git push origin preview  # Direct push allowed
```

**Or via PR (optional):**
```bash
git push origin feature/my-feature
gh pr create --base preview --title "..." --body "..."
```

### For Contributors

**Required workflow:**
```bash
# Make changes locally
git checkout -b feature/my-feature
git commit -m "feat: description"

# Push to feature branch
git push origin feature/my-feature

# Create PR (required)
gh pr create --base preview --title "..." --body "..."

# Wait for:
# 1. Status checks to pass
# 2. 1 approving review
# 3. Merge by admin
```

## Pre-Push Hook Protection

Local git hooks provide validation before code reaches remote:

**Pre-commit (Group 3):**
- YAML validation
- Test file tagging validation
- Smart affected checks (typecheck, lint, unit tests)
- Auto-formatting

**Pre-push (Group 4):**
- Integration tests (affected only, Nx cached)
- Production builds (affected only, Nx cached)
- Smoke tests (if sites affected)
- E2E tests (if critical projects affected)

**Performance:**
- Leverages Nx intelligent caching
- ~90% faster for docs/workflow changes (cache hits)
- ~60% faster for typical code changes (selective re-runs)
- Full validation when code actually changed

See: `scripts/pre-push-check.js` for implementation details

## Safety Gates Summary

| Gate | Contributors | Admins | Enforced By |
|------|-------------|--------|-------------|
| Pre-commit validation | ✅ | ✅ | Local git hook |
| Pre-push validation | ✅ | ✅ | Local git hook |
| PR requirement | ✅ | ❌ (optional) | GitHub branch protection |
| Status checks | ✅ | ❌ (optional) | GitHub branch protection |
| Code review | ✅ (1 required) | ❌ (optional) | GitHub branch protection |

## Updating Branch Protection

### Via GitHub CLI (Recommended)

```bash
# View current protection
gh api repos/iflastandards/platform/branches/preview/protection

# Update protection (example)
gh api -X PUT repos/iflastandards/platform/branches/preview/protection \
  --input protection-config.json
```

### Via GitHub Web UI

1. Navigate to: Settings → Branches → Branch protection rules
2. Select `preview` branch rule
3. Modify settings
4. Save changes

**Important:** Always maintain `enforce_admins: false` to preserve admin bypass privileges.

## Related Documentation

- **Pre-push optimization:** See git history (commit 84b282ae)
- **Testing strategy:** `developer_notes/TESTING_STRATEGY.md`
- **Git workflow:** `CLAUDE.md` (Rules section)
- **CI/CD pipelines:** `.github/workflows/`

## History

**2025-10-02:** Initial branch protection configuration
- Added PR requirements for non-admin contributors
- Configured admin bypass privileges
- Required status checks: validation and build preview
- Allowed force pushes for admins
- Required 1 approving review for non-admins

---

*This document should be updated whenever branch protection rules change.*
