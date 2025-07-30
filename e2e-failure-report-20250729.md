# E2E Test Failures Report - 2025-07-29

## Summary
- **Total Tests Run**: 210
- **Total Failures**: 21  
- **Success Rate**: 90%
- **Main Issue Categories**: 
  1. Navigation menu timeouts (16 failures)
  2. Admin dashboard 404 errors (5 failures)

## Failure Details

| # | Spec File | Test Title | Browser | Error Type | Error Message/Stack | Screenshot | Video |
|---|-----------|------------|---------|------------|---------------------|------------|-------|
| 1 | `site-validation.spec.ts` | Portal site validation › should have all links matching correct environment pattern | Chromium | Link Check | Expected length: 0, Received length: 1, Received array: `[{"href": "http://localhost:3007/admin/dashboard", "status": 404}]` | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-chromium/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-chromium/video.webm) |
| 2 | `site-validation.spec.ts` | Portal site validation › should have all links matching correct environment pattern | Firefox | Link Check | Expected length: 0, Received length: 1, Received array: `[{"href": "http://localhost:3007/admin/dashboard", "status": 404}]` | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-firefox/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-firefox/video.webm) |
| 3 | `site-validation.spec.ts` | Portal site validation › should have all links matching correct environment pattern | WebKit | Link Check | Expected length: 0, Received length: 1, Received array: `[{"href": "http://localhost:3007/admin/dashboard", "status": 404}]` | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-webkit/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-webkit/video.webm) |
| 4 | `site-validation.spec.ts` | Portal site validation › should have all links matching correct environment pattern | Mobile Chrome | Link Check | Expected length: 0, Received length: 1, Received array: `[{"href": "http://localhost:3007/admin/dashboard", "status": 404}]` | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-Mobile-Chrome/video.webm) |
| 5 | `site-validation.spec.ts` | Portal site validation › should have all links matching correct environment pattern | Mobile Safari | Link Check | Expected length: 0, Received length: 1, Received array: `[{"href": "http://localhost:3007/admin/dashboard", "status": 404}]` | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-efe99-correct-environment-pattern-Mobile-Safari/video.webm) |
| 6 | `site-validation.spec.ts` | ISBDM site validation › should have working navigation menu | Chromium | Timeout | Test timeout of 30000ms exceeded. Error: locator.click: Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-chromium/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-chromium/video.webm) |
| 7 | `site-validation.spec.ts` | ISBDM site validation › should have working navigation menu | Firefox | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-firefox/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-firefox/video.webm) |
| 8 | `site-validation.spec.ts` | ISBDM site validation › should have working navigation menu | WebKit | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-webkit/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-webkit/video.webm) |
| 9 | `site-validation.spec.ts` | Portal site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 10 | `site-validation.spec.ts` | ISBDM site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-0dcaf-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-0dcaf-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 11 | `site-validation.spec.ts` | LRM site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-4ac3c-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-4ac3c-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 12 | `site-validation.spec.ts` | FRBR site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-6b607-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-6b607-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 13 | `site-validation.spec.ts` | ISBD site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-709e9-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-709e9-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 14 | `site-validation.spec.ts` | MulDiCat site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-9df4d-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-9df4d-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 15 | `site-validation.spec.ts` | UNIMARC site validation › should have working navigation menu | Mobile Chrome | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-d10bf-ave-working-navigation-menu-Mobile-Chrome/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-d10bf-ave-working-navigation-menu-Mobile-Chrome/video.webm) |
| 16 | `site-validation.spec.ts` | Portal site validation › should have working navigation menu | Mobile Safari | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-72c09-ave-working-navigation-menu-Mobile-Safari/video.webm) |
| 17 | `site-validation.spec.ts` | ISBDM site validation › should have working navigation menu | Mobile Safari | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-0dcaf-ave-working-navigation-menu-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-0dcaf-ave-working-navigation-menu-Mobile-Safari/video.webm) |
| 18 | `site-validation.spec.ts` | LRM site validation › should have working navigation menu | Mobile Safari | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-4ac3c-ave-working-navigation-menu-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-4ac3c-ave-working-navigation-menu-Mobile-Safari/video.webm) |
| 19 | `site-validation.spec.ts` | FRBR site validation › should have working navigation menu | Mobile Safari | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-6b607-ave-working-navigation-menu-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-6b607-ave-working-navigation-menu-Mobile-Safari/video.webm) |
| 20 | `site-validation.spec.ts` | ISBD site validation › should have working navigation menu | Mobile Safari | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-709e9-ave-working-navigation-menu-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-709e9-ave-working-navigation-menu-Mobile-Safari/video.webm) |
| 21 | `site-validation.spec.ts` | MulDiCat site validation › should have working navigation menu | Mobile Safari | Timeout | Test timeout of 30000ms exceeded. | [test-failed-1.png](./tmp/e2e-regression-20250729/site-validation-Site-Valid-9df4d-ave-working-navigation-menu-Mobile-Safari/test-failed-1.png) | [video.webm](./tmp/e2e-regression-20250729/site-validation-Site-Valid-9df4d-ave-working-navigation-menu-Mobile-Safari/video.webm) |

## Root Cause Analysis

### 1. Admin Dashboard 404 Errors (5 failures)
**Issue**: The admin dashboard link `http://localhost:3007/admin/dashboard` returns 404 status.
**Root Cause**: Based on server logs, the admin server is running but the `/dashboard` route is being redirected to a `/sign-in` page (307 redirect), which then returns 404. This suggests:
- Missing authentication middleware handling
- Route protection not properly configured
- Admin basePath configuration issues

**Server Log Evidence**:
```
[admin:ERROR] Error: NEXT_HTTP_ERROR_FALLBACK;404
[admin:ERROR]     at notFound (../../../src/client/components/not-found.ts:25:16)
[admin:ERROR]     at eval (src/middleware.ts:20:9)
[admin] HEAD /dashboard 307 in 2707ms
[admin] HEAD /sign-in?redirect_url=/dashboard 404 in 431ms
```

### 2. Navigation Menu Timeouts (16 failures)
**Issue**: Navigation menu interactions timeout after 30 seconds across all sites and browsers.
**Root Cause**: The test is trying to click on navigation elements that may be:
- Not fully loaded/hydrated
- Blocked by overlays or other elements
- Using dropdown/hover behavior that requires different interaction patterns

**Test Pattern**: All failures occur on the "should have working navigation menu" test, specifically when trying to click the 3rd navigation link (`nth(2)`).

## Next Steps

### Immediate Actions
1. **Fix Admin Authentication**: 
   - Review `apps/admin/src/middleware.ts` for route protection logic
   - Ensure `/sign-in` route exists and is properly configured
   - Verify basePath handling for admin routes

2. **Fix Navigation Timeouts**:
   - Increase timeout for navigation tests or add proper wait conditions
   - Review dropdown/menu interaction patterns in the test
   - Add wait for hydration/JavaScript loading before navigation clicks

3. **Update Test Configuration**:
   - Consider running admin tests separately with different setup
   - Add retry logic for flaky navigation interactions
   - Implement better error handling for timeouts

### Test Environment Issues
- Admin server startup was problematic during test setup (timeout after 30s)
- Multiple admin:dev processes were running simultaneously
- Server management in global setup needs improvement

## Files Generated
- **Screenshots**: 21 failure screenshots in `tmp/e2e-regression-20250729/`
- **Videos**: 21 failure videos (WebM format) for debugging
- **Error Context**: Detailed page snapshots for each failure
- **This Report**: `e2e-failure-report-20250729.md`
