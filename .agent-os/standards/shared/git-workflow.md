# Git Workflow Standards

## Branch Strategy

### IFLA Standards Platform Branch Model
```
production (GitHub Pages deployment)
├── preview (staging deployment) ← Default development branch
    ├── feature/admin-user-management
    ├── feature/isbd-vocabulary-update  
    ├── bugfix/navigation-mobile-menu
    └── hotfix/security-patch
```

### Branch Naming Conventions
- **Feature branches**: `feature/short-description`
- **Bug fixes**: `bugfix/issue-description`
- **Hotfixes**: `hotfix/critical-issue`
- **Documentation**: `docs/topic-update`
- **Refactoring**: `refactor/component-cleanup`

### Branch Rules
- **Never work directly** on `preview` or `production` branches
- **All work** must be done in feature branches
- **Feature branches** branch from and merge back to `preview`
- **Hotfixes** may branch from `production` for critical issues

## Git Workflow

### Starting New Work
```bash
# Ensure you're on preview and up to date
git checkout preview
git pull origin preview

# Create feature branch
git checkout -b feature/user-authentication

# Verify branch
git status
git branch
```

### Daily Workflow
```bash
# Check status before starting
git status
git branch  # Verify you're on feature branch, not preview/production

# Stage and commit changes
git add .
git diff --cached  # Review staged changes
git commit -m "feat: add user authentication middleware"

# Push regularly
git push -u origin feature/user-authentication
```

### Pre-Commit Requirements
- **Run quality checks**: `pnpm typecheck && pnpm lint`
- **Run affected tests**: `pnpm test`
- **Tag tests if needed**: `pnpm test:tag --staged`
- **Review staged changes**: `git diff --cached`

### Commit Message Standards

#### Conventional Commits Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feature or bug changes)
- **test**: Adding or updating tests
- **chore**: Build tasks, dependency updates, etc.

#### Examples
```bash
git commit -m "feat(admin): add user role management interface"
git commit -m "fix(isbd): correct Area 1 punctuation examples"
git commit -m "docs(api): update authentication endpoint documentation"
git commit -m "test(vocabulary): add integration tests for VocabularyTable"
git commit -m "refactor(theme): extract shared navigation component"
git commit -m "chore(deps): update Docusaurus to v3.8.1"
```

#### Multi-line Commit Messages
```bash
git commit -m "feat(admin): implement CSV import functionality

- Add file upload component with drag-and-drop
- Integrate with job queue for background processing  
- Add progress tracking and error handling
- Include validation for IFLA vocabulary format

Closes #123"
```

## Code Review Process

### Pull Request Requirements
1. **Clear title** following conventional commit format
2. **Comprehensive description** of changes and reasoning
3. **Link to related issues** or documentation
4. **Screenshots** for UI changes
5. **Test results** showing all checks pass

### PR Description Template
```markdown
## Changes
Brief description of what this PR accomplishes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)  
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally with `pnpm test`
- [ ] Build succeeds with `pnpm build:affected`
- [ ] TypeScript compiles without errors
- [ ] ESLint checks pass

## Screenshots (if applicable)
Include before/after screenshots for UI changes.

## Related Issues
Closes #[issue number]
```

### Review Checklist
- **Code quality**: Follows coding standards and best practices
- **Test coverage**: Adequate test coverage for new functionality
- **Documentation**: Code is well-commented and documented
- **Performance**: No obvious performance issues
- **Accessibility**: UI changes meet WCAG guidelines
- **Security**: No security vulnerabilities introduced

## Git Hooks

### Pre-Commit Hook (Automatic)
The pre-commit hook runs automatically and checks:
```bash
# .husky/pre-commit
#!/bin/sh
pnpm secrets:scan        # Scan for leaked secrets
pnpm typecheck          # TypeScript validation  
pnpm lint               # ESLint checks
pnpm test --affected    # Run affected tests only
pnpm test:tag --staged  # Tag new/modified tests
```

### Pre-Push Hook (Automatic)  
The pre-push hook runs automatically and checks:
```bash
# .husky/pre-push  
#!/bin/sh
pnpm test:pre-commit:robust  # Comprehensive test suite
pnpm build:affected          # Build affected projects
```

### Bypassing Hooks (Emergency Only)
```bash
# Only use in emergencies with explicit approval
git commit --no-verify -m "hotfix: critical security patch"
git push --no-verify
```

## Merge Strategy

### Squash and Merge (Preferred)
- **Clean history**: Multiple commits squashed into single commit
- **Clear changelog**: Each PR becomes one commit in main branch
- **Easy rollback**: Simple to revert entire features

### Merge Process
1. **Review approved** by at least one team member
2. **All checks pass** (tests, builds, quality gates)
3. **Squash and merge** with clean commit message
4. **Delete feature branch** after merge

## Release Process

### Version Tagging
```bash
# Create release tag
git checkout production
git pull origin production
git tag -a v2024.1.0 -m "Release v2024.1.0: ISBD vocabulary updates and admin improvements"
git push origin v2024.1.0
```

### Release Notes
```markdown
# Release v2024.1.0

## Features
- feat(admin): User role management interface
- feat(isbd): Interactive vocabulary browser
- feat(api): Authentication middleware

## Bug Fixes  
- fix(navigation): Mobile menu accessibility
- fix(vocabulary): Search filter persistence
- fix(build): Production build optimization

## Breaking Changes
None

## Upgrade Instructions
No action required for standard deployments.
```

## Emergency Procedures

### Hotfix Process
```bash
# For critical production issues
git checkout production
git pull origin production
git checkout -b hotfix/critical-security-fix

# Make minimal fix
git commit -m "hotfix: patch security vulnerability CVE-2024-1234"
git push -u origin hotfix/critical-security-fix

# Create PR to production (expedited review)
# After merge, also merge hotfix to preview
git checkout preview
git merge hotfix/critical-security-fix
git push origin preview
```

### Rollback Procedure
```bash
# If deployment fails, rollback immediately
git checkout production
git revert HEAD~1  # Revert last commit
git push origin production

# Or reset to last known good commit
git reset --hard [last-good-commit-hash]
git push --force-with-lease origin production
```

## Repository Health

### Daily Maintenance
- **Review open PRs** for stale reviews
- **Update dependencies** regularly with `pnpm update`
- **Check CI status** for failing builds
- **Monitor disk usage** and clean old branches

### Weekly Maintenance
```bash
# Clean up merged branches
git branch --merged | grep -v "preview\|production" | xargs -n 1 git branch -d

# Update local branches
git checkout preview
git pull origin preview
git remote prune origin

# Review dependency security
pnpm audit
```

### Branch Protection Rules
- **Preview branch**: Require PR, require status checks, no force push
- **Production branch**: Require PR, require admin review, no force push
- **All branches**: Require up-to-date branches before merge

## Security Considerations

### Sensitive Information
- **Never commit** API keys, passwords, or secrets
- **Use environment variables** for sensitive configuration
- **Scan commits** for secrets before pushing
- **Rotate credentials** if accidentally committed

### Access Control
- **Two-factor authentication** required for all contributors
- **Branch protection** enforced on main branches
- **Regular access review** for team members
- **Audit logs** monitored for suspicious activity

This Git workflow ensures code quality, maintains project history, and supports the collaborative development of the IFLA Standards Platform.