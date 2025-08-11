#!/bin/bash

# Run smoke tests against deployed environments
# Tests publicly accessible pages only - no authentication required
# Usage: ./scripts/run-smoke-tests.sh [preview|production]

set -e

ENVIRONMENT=${1:-preview}

if [ "$ENVIRONMENT" != "preview" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [preview|production]"
    exit 1
fi

if [ "$ENVIRONMENT" = "preview" ]; then
    BASE_URL="https://iflastandards.github.io/platform"
    ADMIN_URL="https://admin-iflastandards-preview.onrender.com"
else
    BASE_URL="https://www.iflastandards.info"
    ADMIN_URL="https://admin.iflastandards.info"
fi

echo "🧪 Running smoke tests against $ENVIRONMENT environment"
echo "🌐 Documentation Sites: $BASE_URL"
echo "🔧 Admin Portal: $ADMIN_URL"
echo ""
echo "📋 Testing:"
echo "  • Standards sites (LRM, ISBDM, FRBR, isbd, muldicat, unimarc)"
echo "  • Portal homepage"
echo "  • Admin homepage (public)"
echo "  • API health endpoints"
echo ""

# Set environment variables and run smoke tests
DOCS_ENV="$ENVIRONMENT" BASE_URL="$BASE_URL" pnpm exec playwright test \
    --config=playwright.config.smoke.ts \
    --reporter=list \
    --timeout=30000

echo ""
echo "✅ Smoke tests completed!"
echo "ℹ️  Note: These tests only cover publicly accessible pages."
echo "ℹ️  For authenticated functionality, run the full e2e test suite."