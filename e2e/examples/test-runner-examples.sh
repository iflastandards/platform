#!/bin/bash

# Examples of running Playwright tests with different configurations

echo "🎭 Playwright Test Runner Examples"
echo "================================="

echo "
1. Run all tests in headless Chrome (default):
   pnpm playwright test

2. Run tests in headed mode (see the browser):
   pnpm playwright test --headed

3. Run only Chrome tests:
   pnpm playwright test --project=chromium

4. Run specific test file:
   pnpm playwright test e2e/examples/multi-site-testing.spec.ts

5. Run tests matching a pattern:
   pnpm playwright test -g 'should load vocabularies'

6. Run integration tests only:
   pnpm playwright test --project=integration

7. Run with specific number of workers:
   pnpm playwright test --workers=4

8. Debug a specific test:
   pnpm playwright test --debug e2e/examples/server-integration.spec.ts

9. Run tests with custom config:
   pnpm playwright test --config=playwright.config.enhanced.ts

10. Run tests and update snapshots:
    pnpm playwright test --update-snapshots

11. Generate test report:
    pnpm playwright show-report

12. Run tests with environment variables:
    BASE_URL=http://localhost:4000 pnpm playwright test

13. Run server-dependent tests against production:
    DOCS_ENV=production pnpm playwright test e2e/server-dependent/

14. Run tests in UI mode (interactive):
    pnpm playwright test --ui

15. List all available tests:
    pnpm playwright test --list

16. Run tests with trace viewer:
    pnpm playwright test --trace on
    
17. View trace after test failure:
    pnpm playwright show-trace tmp/playwright-results/trace.zip

18. Run parallel tests with sharding (for CI):
    SHARD_CURRENT=1 SHARD_TOTAL=4 pnpm playwright test

19. Run tests with fail-fast (stop on first failure):
    FAIL_FAST=true pnpm playwright test

20. Run performance tests with DevTools:
    pnpm playwright test --project=performance
"

echo "
📝 Notes:
- Tests automatically start dev servers via globalSetup
- Use --project to run specific browser configurations
- Add --debug to open Playwright Inspector
- Use --ui for interactive test running
- Check ./output/playwright-report for HTML reports
"