#!/bin/bash
# Build script that filters out Nx-specific flags

# Filter out --partition flag from arguments
FILTERED_ARGS=""
for arg in "$@"; do
  if [[ ! "$arg" =~ ^--partition ]]; then
    FILTERED_ARGS="$FILTERED_ARGS $arg"
  fi
done

# Run tsup with filtered arguments
pnpm exec tsup $FILTERED_ARGS

# Run tsc for declarations (it doesn't need the extra args)
npx tsc --project tsconfig.declarations.json