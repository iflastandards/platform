# Dual CI Architecture Implementation

## Summary
Successfully implemented dual CI architecture on June 30, 2025, separating development testing from client preview validation.

## Key Achievement
Solved the problem of running comprehensive Nx Cloud CI on the correct repository while maintaining fast client preview deployments.

## Architecture Components

### 1. Development Fork CI
- **Repository**: `jonphipps/standards-dev` (fork)
- **Workflow**: `.github/workflows/nx-optimized-ci.yml`
- **Purpose**: Comprehensive development testing with Nx Cloud
- **Nx Cloud Workspace**: `6857fccbb755d4191ce6fbe4`

### 2. Preview Repository CI  
- **Repository**: `iflastandards/standards-dev` (preview)
- **Workflow**: `.github/workflows/preview-ci.yml`
- **Purpose**: Lightweight deployment validation

## Workflow Configuration

### Git Aliases Added
```bash
git config --local alias.push-dev "push fork dev"
git config --local alias.push-preview "push origin dev"
```

### Daily Workflow
1. **Development**: `git push-dev` → Comprehensive CI on fork
2. **Client previews**: `git push-preview` → Lightweight CI + deployment

## Benefits Achieved
- ✅ Comprehensive testing during development (475+ tests)
- ✅ Fast client preview updates (< 3 minutes)
- ✅ Cost-efficient Nx Cloud usage on personal account
- ✅ Clean separation between development and preview environments
- ✅ Proper Nx Cloud workspace association

## Files Modified
- Created: `.github/workflows/preview-ci.yml`
- Updated: `.github/workflows/nx-optimized-ci.yml` (renamed and clarified)
- Updated: `CLAUDE.md` (added dual CI section)
- Created: `docs/architecture/dual-ci-architecture.md` (comprehensive documentation)

## Key Insight
The critical insight was that Nx Cloud should run on the **development repository** where iterative testing happens, not on the **preview repository** where only deployment validation is needed.

## Complete Documentation
See `docs/architecture/dual-ci-architecture.md` for the complete architecture documentation, including:
- Detailed workflow diagrams
- Troubleshooting guides
- Performance targets
- Maintenance procedures
- Quick reference commands

## Status
✅ **Complete and operational** - Both CI systems are running successfully with proper separation of concerns.