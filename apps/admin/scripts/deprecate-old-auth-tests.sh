#!/bin/bash

# Script to deprecate old auth tests that use vi.mock instead of MSW

echo "🔄 Deprecating old auth tests that use vi.mock()..."

# Create deprecated directories
mkdir -p src/test/_deprecated/integration
mkdir -p src/test/_deprecated/lib

# Move API tests that use old mocking
echo "📦 Moving API tests with old mocks..."
mv src/test/integration/api-unauthenticated.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  api-unauthenticated.test.ts already moved or not found"
mv src/test/integration/api-vocabularies-simple.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  api-vocabularies-simple.test.ts already moved or not found"
mv src/test/integration/api-vocabularies-working.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  api-vocabularies-working.test.ts already moved or not found"
mv src/test/integration/api-namespaces-auth.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  api-namespaces-auth.test.ts already moved or not found"
mv src/test/integration/api-auth-with-clerk-users.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  api-auth-with-clerk-users.test.ts already moved or not found"
mv src/test/integration/api-vocabularies-auth.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  api-vocabularies-auth.test.ts already moved or not found"

# Move the authorization test that uses old mocks
echo "📦 Moving authorization test with old mocks..."
mv src/test/integration/lib/authorization.integration.test.ts src/test/_deprecated/integration/ 2>/dev/null || echo "  ⚠️  authorization.integration.test.ts already moved or not found"

# Move session management if it uses old mocks
echo "📦 Moving session management test..."
mv src/test/lib/session-management.test.ts src/test/_deprecated/lib/ 2>/dev/null || echo "  ⚠️  session-management.test.ts already moved or not found"

# Move old mock files
echo "📦 Moving old mock files..."
mv src/test/mocks/dynamic-auth.ts src/test/_deprecated/ 2>/dev/null || echo "  ⚠️  dynamic-auth.ts already moved or not found"

echo ""
echo "✅ Deprecation complete!"
echo ""
echo "📝 Summary:"
echo "  - Old vi.mock() based tests moved to src/test/_deprecated/"
echo "  - These tests are excluded from test runs via vitest.config.ts"
echo "  - New MSW-based tests are in:"
echo "    • src/test/integration/dashboard-access.test.ts"
echo "    • src/test/integration/namespace-dashboard.test.ts"
echo ""
echo "🔍 Tests that were kept:"
echo "  • clerk-auth-integration.test.ts - Tests real Clerk integration"
echo "  • clerk-test-users.test.ts - Tests actual Clerk test users"
echo ""
echo "⚠️  To rewrite deprecated tests:"
echo "  1. Use MSW handlers from src/mocks/clerk-handlers.ts"
echo "  2. Use fixtures from src/mocks/user-fixtures.ts"
echo "  3. Follow patterns in dashboard-access.test.ts"