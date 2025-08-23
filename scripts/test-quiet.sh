#!/bin/bash

# Quiet test runner - suppresses build output and verbose logs
# Only shows test results and actual errors

# Set quiet environment variables
export NX_VERBOSE_LOGGING=false
export NX_CLOUD_SILENT=true
export NODE_NO_WARNINGS=1
export CI=true  # Many tools respect CI env for quieter output

# Parse command arguments
COMMAND="${1:-test}"
shift

# Function to run commands quietly
run_quiet() {
    local cmd="$1"
    shift
    
    # Run command, suppressing verbose output
    # Only show errors and test results
    $cmd "$@" 2>&1 | grep -v -E "(tsup|Building|Bundling|Created|Generating|⚡|📦|🔧|▶|✓ Built)" | grep -v "^$"
    return ${PIPESTATUS[0]}
}

# Main execution based on command
case "$COMMAND" in
    test)
        run_quiet "pnpm" "nx" "affected" "--target=test" "--parallel=3" "--uncommitted" "$@"
        ;;
    typecheck)
        run_quiet "pnpm" "nx" "affected" "--target=typecheck" "--parallel=3" "--uncommitted" "$@"
        ;;
    lint)
        # Use the existing lint:quiet:fix command for quieter output
        pnpm lint:quiet:fix 2>&1 | grep -v "^$"
        ;;
    build)
        run_quiet "pnpm" "nx" "affected" "--target=build" "--parallel=3" "--uncommitted" "$@"
        ;;
    *)
        echo "Usage: $0 [test|typecheck|lint|build] [additional args]"
        exit 1
        ;;
esac

exit $?