#!/bin/bash

# Admin Portal Testing Examples
# This script demonstrates how to run different types of tests for the admin

echo "🧪 Admin Portal Testing Examples"
echo "================================"

# Change to admin directory
cd "$(dirname "$0")/.." || exit 1

echo ""
echo "📍 Current directory: $(pwd)"
echo ""

# Function to run a command and show its output
run_test() {
    local test_name="$1"
    local command="$2"
    local description="$3"
    
    echo "🔹 $test_name"
    echo "   Description: $description"
    echo "   Command: $command"
    echo "   ---"
    
    if eval "$command"; then
        echo "   ✅ $test_name PASSED"
    else
        echo "   ❌ $test_name FAILED"
    fi
    echo ""
}

# Unit Tests
echo "🧩 UNIT TESTS"
echo "=============="
run_test "All Unit Tests" \
    "nx test admin" \
    "Run all unit and integration tests"

run_test "Unit Tests Only" \
    "nx run admin:test:unit" \
    "Run only unit tests (fast feedback)"

run_test "Integration Tests Only" \
    "nx run admin:test:integration" \
    "Run only integration tests (external dependencies)"

run_test "Watch Mode" \
    "echo 'To run in watch mode: nx run admin:test:watch'" \
    "Run tests in watch mode for development"

run_test "Coverage Report" \
    "nx run admin:test:coverage" \
    "Generate test coverage report"

echo ""
echo "🌐 E2E TESTS"
echo "============"
run_test "Admin Portal E2E" \
    "nx run admin:e2e" \
    "Run E2E tests using newtest as target site"

run_test "E2E with UI" \
    "echo 'To run with UI: playwright test --project=admin --ui'" \
    "Run E2E tests in interactive mode"

run_test "E2E Debug Mode" \
    "echo 'To debug: playwright test --project=admin --debug'" \
    "Run E2E tests in debug mode"

echo ""
echo "🔧 DEVELOPMENT WORKFLOW"
echo "======================="
run_test "Type Check" \
    "nx run admin:typecheck" \
    "Check TypeScript types"

run_test "Lint" \
    "nx run admin:lint" \
    "Check code quality with ESLint"

run_test "Build" \
    "nx run admin:build" \
    "Build admin for production"

echo ""
echo "🎯 TESTING TARGETS"
echo "=================="
echo "newtest site (localhost:3008):"
echo "  - Full Docusaurus site with real content"
echo "  - Safe testing environment"
echo "  - Integrated with admin workflow"
echo ""
echo "admin (localhost:3007):"
echo "  - Next.js application with NextAuth"
echo "  - Site management interface"
echo "  - Direct integration with Docusaurus sites"
echo ""

echo "🚀 QUICK START"
echo "=============="
echo "1. Start newtest site:     nx start newtest"
echo "2. Start admin:     nx serve admin"
echo "3. Run unit tests:         nx test admin"
echo "4. Run E2E tests:          playwright test --project=admin"
echo ""

echo "📖 TESTING PATTERNS"
echo "==================="
echo "Unit Tests:"
echo "  - Component rendering and behavior"
echo "  - Utility functions and helpers"
echo "  - Mocked external dependencies"
echo ""
echo "Integration Tests:"
echo "  - API interactions with real endpoints"
echo "  - Component workflows with external data"
echo "  - Authentication and authorization flows"
echo ""
echo "E2E Tests:"
echo "  - Full user workflows across both applications"
echo "  - Cross-site navigation (newtest ↔ admin)"
echo "  - Real browser interactions and validations"
echo ""

echo "✨ Testing setup complete! Use the commands above to run tests."