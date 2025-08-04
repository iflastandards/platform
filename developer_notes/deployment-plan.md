# Deployment Plan

This document tracks deployment tasks and phases for the IFLA Standards Platform, following the project rule for maintaining comprehensive planning documentation with completion checkboxes.

## Deploy preview branch – 2025-01-08

### Phase 1: Pre-Deployment Validation
- [ ] Run comprehensive health check (`pnpm health`)
- [ ] Verify all affected tests pass (`pnpm test`)
- [ ] Run typecheck on affected projects (`pnpm typecheck`)
- [ ] Run linting on affected projects (`pnpm lint`)
- [ ] Validate site builds for affected projects (`pnpm test:builds:affected`)
- [ ] Run E2E tests to ensure core functionality (`pnpm test:e2e`)
- [ ] Check for security and performance advisories
- [ ] Verify basePath configurations are correct
- [ ] Ensure environment-aware URLs are properly configured

### Phase 2: Build System Preparation
- [ ] Optimize Nx cache and daemon (`pnpm nx:optimize`)
- [ ] Start Nx daemon for performance (`pnpm nx:daemon:start`)
- [ ] Clear any stale build artifacts if needed (`pnpm nx:cache:clear`)
- [ ] Verify Nx Cloud integration is functioning
- [ ] Check port availability and kill conflicting processes (`pnpm ports:kill`)
- [ ] Validate workspace configuration (`nx workspace`)
- [ ] Run build regression tests (`scripts/test-site-builds-affected.js`)

### Phase 3: Content and Configuration Validation
- [ ] Verify all namespace configurations are valid
- [ ] Check cross-site navigation links
- [ ] Validate vocabulary management features
- [ ] Test admin portal authentication flows
- [ ] Verify API endpoints respond correctly
- [ ] Check static asset paths use proper utilities
- [ ] Validate environment-specific configurations
- [ ] Test mobile responsiveness and accessibility

### Phase 4: CI/CD Pipeline Preparation
- [ ] Review GitHub Actions workflow status
- [ ] Verify all required secrets are configured
- [ ] Check Nx Cloud agent availability for distributed builds
- [ ] Validate branch protection rules
- [ ] Ensure Vercel preview deployment configuration is correct
- [ ] Test webhook configurations for automated deployments
- [ ] Verify GitHub Pages deployment settings

### Phase 5: Final Checks and Deployment
- [ ] Create final commit with deployment-ready changes
- [ ] Run pre-push validation (`pnpm test:pre-push:flexible`)
- [ ] Push changes to preview branch
- [ ] Monitor GitHub Actions deployment pipeline
- [ ] Verify Vercel preview deployment succeeds
- [ ] Test deployed preview site functionality
- [ ] Validate all site navigation and cross-links
- [ ] Check admin portal functionality on preview
- [ ] Verify vocabulary management features work
- [ ] Test authentication flows on deployed environment
- [ ] Document any deployment issues or lessons learned

### Phase 6: Post-Deployment Validation
- [ ] Perform smoke tests on all deployed sites
- [ ] Verify search functionality works across sites
- [ ] Test form submissions and API integrations
- [ ] Check performance metrics and load times
- [ ] Validate SSL certificates and security headers
- [ ] Monitor error logs for any deployment-related issues
- [ ] Confirm analytics and monitoring are working
- [ ] Update deployment documentation if needed
- [ ] Notify stakeholders of successful preview deployment
- [ ] Plan next steps for production deployment

---

## Deployment Status

**Started:** [Date to be filled when deployment begins]  
**Completed:** [Date to be filled when deployment completes]  
**Deployed by:** [Name to be filled]  
**Preview URL:** https://iflastandards.github.io/platform/  
**Vercel Preview:** [URL to be filled when available]

## Notes

Use this section to document any issues encountered, lessons learned, or special considerations for this deployment.

---

## Template for Future Deployments

When creating a new deployment plan, copy the checklist above and:

1. Update the date in the heading (YYYY-MM-DD format)
2. Customize tasks based on specific changes being deployed
3. Add any project-specific validation steps
4. Update the deployment status section as work progresses

