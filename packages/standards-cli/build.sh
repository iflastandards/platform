#!/bin/bash
# Build script that filters out Nx-specific flags

# Filter out --partition flag from arguments
FILTERED_ARGS=""
for arg in "$@"; do
  if [[ ! "$arg" =~ ^--partition ]]; then
    FILTERED_ARGS="$FILTERED_ARGS $arg"
  fi
done

# Run tsc with filtered arguments
tsc -p tsconfig.json $FILTERED_ARGS