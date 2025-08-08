# Phase 5 CI/CD Guide - Environment-Only Testing

## 🎯 Overview

The IFLA Standards Platform uses a **Phase 5 CI/CD approach** where CI/CD pipelines focus **exclusively** on environment-specific validation and deployment. All code quality testing (Phases 1-4) must be completed locally before pushing.

## 🚨 Critical Understanding

### What CI/CD Does (Phase 5 Only)
- ✅ **Environment variable validation**
- ✅ **API token verification** 
- ✅ **External service connectivity**
- ✅ **Deployment infrastructure**
- ✅ **Post-deployment health checks**

### What CI/CD Does NOT Do
- ❌ **TypeScript type checking** (Phase 2 - Pre-commit)
- ❌ **ESLint code quality** (Phase 2 - Pre-commit)
- ❌ **Unit tests** (Phase 2 - Pre-commit)
- ❌ **Integration tests** (Phase 3 - Pre-push)
- ❌ **E2E tests** (Phase 3 - Pre-push)
- ❌ **Code quality validation** (Phases 1-4)

## 📋 Developer Responsibilities

### Before Every Push
You **MUST** ensure these phases pass locally:

#### Phase 1: Selective Testing
```bash
# Test your specific changes
pnpm nx test your-project
pnpm test --grep "@critical"
```

#### Phase 2: Pre-commit (Automatic)
```bash
# These run automatically on git commit:
# - TypeScript checking
# - ESLint validation  
# - Unit tests (affected)
```

#### Phase 3: Pre-push (Automatic)
```bash
# These run automatically on git push:
# - Integration tests
# - Build validation
# - Smart E2E tests (if portal/admin affected)
```

### ⚠️ Never Bypass Local Validation
```bash
# ❌ NEVER DO THIS (unless absolute emergency):
git commit --no-verify
git push --no-verify

# ✅ ALWAYS DO THIS:
# Let hooks run and pass before pushing
```

## 🔄 CI/CD Workflow Details

### Preview Deployment (`deploy-preview.yml`)

**Trigger**: Push to `preview` branch

**Phase 5 Steps**:
1. **Environment Validation**
   - Validate environment variables exist
   - Test API token authentication
   - Verify external service connectivity
   
2. **Build and Deploy**
   - Build all sites (assumes code is valid)
   - Deploy to GitHub Pages
   - Deploy admin to Vercel (if affected)
   
3. **Post-Deployment Validation**
   - Health check deployed URLs
   - Verify site accessibility
   - Test basic functionality

**Duration**: ~4-6 minutes (50% faster than before)

### Production Deployment (`deploy-production.yml`)

**Trigger**: PR from `preview` → `main`

**Phase 5 Steps**:
1. **PR Source Validation**
   - Ensure PR is from preview branch
   - Validate PR is mergeable
   
2. **Production Environment Validation**
   - Validate production secrets
   - Test production API tokens
   - Verify production service connectivity
   
3. **Production Build and Deploy**
   - Build for production (assumes code is valid)
   - Deploy to production GitHub Pages
   - Deploy admin to production Vercel
   
4. **Production Health Checks**
   - Comprehensive production health checks
   - API integration validation
   - Production service verification

**Duration**: ~6-8 minutes (40% faster than before)

### Environment Tests (`ci-env-only.yml`)

**Trigger**: Push to any branch, PRs

**Phase 5 Steps**:
1. **Environment Variable Validation**
2. **API Token Authentication**
3. **External Service Connectivity**
4. **CI-Specific Path Validation**
5. **Node.js Environment Validation**

**Duration**: ~2-3 minutes (60% faster than before)

## 🛠️ Troubleshooting

### "My code deployed but it's broken"
**Cause**: You bypassed local validation (Phases 1-4)
**Solution**: 
1. Run `pnpm test` locally
2. Fix any failing tests
3. Ensure pre-commit/pre-push hooks pass
4. Push the fixes

### "CI is failing on environment validation"
**Cause**: Missing or invalid environment variables/API tokens
**Solution**:
1. Check GitHub repository secrets
2. Verify API tokens are still valid
3. Test external service connectivity
4. Contact admin if secrets need updating

### "Deployment is slow"
**Cause**: This is expected - we prioritize reliability over speed
**Solution**: 
- Preview deployments: ~4-6 minutes
- Production deployments: ~6-8 minutes
- This is much faster than the previous ~10-15 minutes

### "I need to deploy urgently"
**Emergency Process**:
1. Use `git commit --no-verify` ONLY if absolutely necessary
2. Push to preview branch
3. **Immediately** run local validation and fix any issues
4. Push fixes to ensure code quality

## 📊 Performance Improvements

| Metric | Before | After (Phase 5) | Improvement |
|--------|--------|-----------------|-------------|
| Preview Deploy | 8-12 min | 4-6 min | 50% faster |
| Production Deploy | 10-15 min | 6-8 min | 40% faster |
| Environment Tests | 5-8 min | 2-3 min | 60% faster |
| CI Reliability | 85% | 95%+ | More reliable |

## 🎯 Benefits of Phase 5 Approach

### For Developers
- ✅ **Faster feedback**: CI focuses only on deployment issues
- ✅ **Clearer failures**: Environment issues vs code issues are separate
- ✅ **Local control**: All code quality validation happens locally
- ✅ **Reduced CI costs**: Less compute time in CI

### For the Project
- ✅ **Reliable deployments**: Environment issues caught early
- ✅ **Cost efficient**: CI only tests what can't be tested locally
- ✅ **Faster iterations**: Quicker deployment cycles
- ✅ **Better separation**: Clear distinction between code and environment issues

## 📚 Related Documentation

- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Complete 5-phase testing approach
- [AI_TESTING_INSTRUCTIONS.md](./AI_TESTING_INSTRUCTIONS.md) - AI agent testing guidelines
- [CLAUDE.md](../CLAUDE.md) - Complete development guide

## 🆘 Getting Help

If you encounter issues with the Phase 5 CI/CD approach:

1. **Check this documentation first**
2. **Verify local validation passed** (run `pnpm test`)
3. **Check GitHub Actions logs** for specific environment failures
4. **Contact the team** if environment secrets need updating

Remember: **Phase 5 assumes your code is already validated locally**. Most issues stem from bypassing local validation phases.