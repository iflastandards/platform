#!/bin/bash

# Environment switcher for testing
# Usage: ./scripts/switch-env.sh [test_mock|test_local|test_integration|staging|production]

ENV_TYPE=${1:-test_mock}
ADMIN_DIR="apps/admin"

echo "🔄 Switching to $ENV_TYPE environment..."

case $ENV_TYPE in
  test_mock)
    echo "📦 Using pure mocks (no external dependencies)"
    cp $ADMIN_DIR/.env.test.mock $ADMIN_DIR/.env.local
    echo "✅ Ready for mock testing"
    echo "📝 Run: pnpm test:unit"
    ;;
    
  test_local)
    echo "🐳 Using local Supabase (requires Orbstack)"
    cp $ADMIN_DIR/.env.test.local $ADMIN_DIR/.env.local
    
    # Check if Orbstack is running
    if ! docker ps > /dev/null 2>&1; then
      echo "⚠️  Orbstack/Docker not running!"
      echo "🚀 Start Orbstack: open -a OrbStack"
      exit 1
    fi
    
    # Check if Supabase is running
    if ! curl -s http://localhost:54321/rest/v1/ > /dev/null 2>&1; then
      echo "⚠️  Local Supabase not running!"
      echo "🚀 Start Supabase: cd $ADMIN_DIR && supabase start"
      exit 1
    fi
    
    echo "✅ Ready for local integration testing"
    echo "📝 Run: pnpm test:integration"
    ;;
    
  test_integration)
    echo "🌐 Using local Supabase + real APIs"
    cp $ADMIN_DIR/.env.test.integration $ADMIN_DIR/.env.local
    
    # Same checks as test_local
    if ! docker ps > /dev/null 2>&1; then
      echo "⚠️  Orbstack/Docker not running!"
      echo "🚀 Start Orbstack: open -a OrbStack"
      exit 1
    fi
    
    if ! curl -s http://localhost:54321/rest/v1/ > /dev/null 2>&1; then
      echo "⚠️  Local Supabase not running!"
      echo "🚀 Start Supabase: cd $ADMIN_DIR && supabase start"
      exit 1
    fi
    
    echo "✅ Ready for full integration testing"
    echo "📝 Run: pnpm test:e2e"
    ;;
    
  staging)
    echo "🚀 Using staging environment"
    cp $ADMIN_DIR/.env.staging $ADMIN_DIR/.env.local
    echo "✅ Ready for staging tests"
    echo "📝 Run: pnpm dev:admin"
    ;;
    
  production)
    echo "🏭 Using production environment"
    cp $ADMIN_DIR/.env.production $ADMIN_DIR/.env.local
    echo "⚠️  CAUTION: Connected to production!"
    echo "📝 Run: pnpm dev:admin (READ-ONLY recommended)"
    ;;
    
  *)
    echo "❌ Unknown environment: $ENV_TYPE"
    echo "Available: test_mock, test_local, test_integration, staging, production"
    exit 1
    ;;
esac

echo ""
echo "🔧 Current environment: $ENV_TYPE"
echo "📁 Config: $ADMIN_DIR/.env.local"
echo ""