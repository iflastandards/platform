#!/bin/bash

# Nx Affected Test Runner
# Intelligently runs tests based on what changed and current context

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect context
detect_context() {
  # Check if we're in CI
  if [ -n "$CI" ]; then
    if [ -n "$DEPLOYED_URL" ] || [ -n "$PROD_URL" ]; then
      echo "post-deploy"
    elif [ -n "$PREVIEW_URL" ]; then
      echo "preview"
    else
      echo "ci-build"
    fi
  # Check git hooks
  elif [ -n "$PRE_COMMIT" ]; then
    echo "pre-commit"
  elif [ -n "$PRE_PUSH" ]; then
    echo "pre-push"
  # Default to local
  else
    echo "local"
  fi
}

# Get base for comparison
get_base() {
  local context=$1
  
  case $context in
    pre-commit)
      echo "HEAD~1"
      ;;
    pre-push|preview|ci-build)
      echo "origin/main"
      ;;
    post-deploy)
      echo "${BEFORE_SHA:-origin/main}"
      ;;
    local)
      # Check if there are uncommitted changes
      if [ -n "$(git status --porcelain)" ]; then
        echo "HEAD"
      else
        echo "HEAD~1"
      fi
      ;;
    *)
      echo "HEAD~1"
      ;;
  esac
}

# Get appropriate test tags for context
get_test_tags() {
  local context=$1
  
  case $context in
    pre-commit)
      echo "@unit|@integration --grep-invert @server-dependent"
      ;;
    pre-push)
      echo "@integration|@e2e"
      ;;
    preview)
      echo "@preview-safe --grep-invert @local-only"
      ;;
    ci-build)
      echo "@unit|@integration --grep-invert @server-dependent --grep-invert @local-only"
      ;;
    post-deploy)
      echo "@smoke|@health --grep @post-deploy"
      ;;
    local)
      echo "@unit|@integration|@e2e --grep-invert @ci-only --grep-invert @post-deploy"
      ;;
    *)
      echo "@unit"
      ;;
  esac
}

# Check for required servers
check_servers() {
  local context=$1
  
  if [ "$context" = "pre-push" ] || [ "$context" = "local" ]; then
    # Check if admin server is running
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3007/api/health | grep -q "200"; then
      echo -e "${YELLOW}⚠️  Admin server not running. Tests requiring @server-dependent will be skipped.${NC}"
      echo -e "${YELLOW}   Start with: nx run admin:dev${NC}"
    else
      echo -e "${GREEN}✓ Admin server is running on port 3007${NC}"
    fi
  fi
}

# Main execution
main() {
  echo -e "${BLUE}🧪 Nx Affected Test Runner${NC}"
  echo "================================"
  
  # Detect context
  CONTEXT=$(detect_context)
  echo -e "Context: ${GREEN}$CONTEXT${NC}"
  
  # Get base for comparison
  BASE=$(get_base "$CONTEXT")
  echo -e "Base: ${GREEN}$BASE${NC}"
  
  # Get test tags
  TAGS=$(get_test_tags "$CONTEXT")
  echo -e "Tags: ${GREEN}$TAGS${NC}"
  
  # Check servers if needed
  check_servers "$CONTEXT"
  
  echo ""
  echo -e "${BLUE}Running affected tests...${NC}"
  echo "--------------------------------"
  
  # Build the nx command
  NX_CMD="nx affected --target=test --base=$BASE"
  
  # Add grep patterns
  if [[ $TAGS == *"--grep-invert"* ]]; then
    # Handle grep-invert
    GREP_PATTERN=$(echo $TAGS | sed 's/--grep-invert.*//' | xargs)
    GREP_INVERT=$(echo $TAGS | sed 's/.*--grep-invert //')
    
    if [ -n "$GREP_PATTERN" ]; then
      NX_CMD="$NX_CMD --grep \"$GREP_PATTERN\""
    fi
    if [ -n "$GREP_INVERT" ]; then
      NX_CMD="$NX_CMD --grep-invert \"$GREP_INVERT\""
    fi
  else
    # Simple grep
    NX_CMD="$NX_CMD --grep \"$TAGS\""
  fi
  
  # Add any additional arguments passed to the script
  if [ $# -gt 0 ]; then
    NX_CMD="$NX_CMD $@"
  fi
  
  echo "Command: $NX_CMD"
  echo ""
  
  # Execute the command
  eval $NX_CMD
  
  # Check result
  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All affected tests passed!${NC}"
  else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
  fi
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      echo "Nx Affected Test Runner"
      echo ""
      echo "Usage: $0 [options]"
      echo ""
      echo "Automatically detects context and runs appropriate tests:"
      echo "  - pre-commit: Unit and mock integration tests"
      echo "  - pre-push: All integration and E2E tests"
      echo "  - preview: Preview-safe tests"
      echo "  - post-deploy: Smoke and health tests"
      echo "  - local: All non-CI tests"
      echo ""
      echo "Options:"
      echo "  --context <context>  Override auto-detected context"
      echo "  --base <ref>        Override base reference for comparison"
      echo "  --tags <pattern>    Override tag pattern"
      echo "  --help, -h          Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                          # Auto-detect and run"
      echo "  $0 --context pre-commit     # Force pre-commit tests"
      echo "  $0 --base main --tags @unit # Custom base and tags"
      exit 0
      ;;
    --context)
      CONTEXT="$2"
      shift 2
      ;;
    --base)
      BASE_OVERRIDE="$2"
      shift 2
      ;;
    --tags)
      TAGS_OVERRIDE="$2"
      shift 2
      ;;
    *)
      EXTRA_ARGS="$EXTRA_ARGS $1"
      shift
      ;;
  esac
done

# Apply overrides
if [ -n "$CONTEXT" ]; then
  export CONTEXT
fi
if [ -n "$BASE_OVERRIDE" ]; then
  export BASE="$BASE_OVERRIDE"
fi
if [ -n "$TAGS_OVERRIDE" ]; then
  export TAGS="$TAGS_OVERRIDE"
fi

# Run main function with any extra arguments
main $EXTRA_ARGS