#!/bin/bash
echo "Stopping Nx daemon..."
pnpm nx daemon --stop

echo "Clearing Nx cache..."
rm -rf .nx/cache

echo "Resetting Nx..."
pnpm nx reset

echo "Starting Nx daemon..."
pnpm nx daemon --start

echo "Generating Nx graph..."
pnpm nx graph

echo "Listing Nx projects..."
pnpm nx show projects

echo "Done! Please restart VS Code."