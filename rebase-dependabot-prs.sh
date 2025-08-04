#!/bin/bash

# Temporarily unset GITHUB_TOKEN to use keyring credentials
unset GITHUB_TOKEN

echo "Rebasing Dependabot PRs..."

# Safe updates first (TypeScript definitions)
echo "Rebasing PR #21 (@types/node)..."
gh pr comment 21 --body "@dependabot rebase"

echo "Rebasing PR #20 (zod)..."
gh pr comment 20 --body "@dependabot rebase"

echo "Rebasing PR #18 (@hookform/resolvers)..."
gh pr comment 18 --body "@dependabot rebase"

echo "Rebasing PR #17 (algoliasearch)..."
gh pr comment 17 --body "@dependabot rebase"

echo "Rebasing PR #16 (lucide-react)..."
gh pr comment 16 --body "@dependabot rebase"

echo "Rebasing PR #15 (chalk)..."
gh pr comment 15 --body "@dependabot rebase"

echo "Done! Check the PRs in a few minutes for fresh CI runs."
echo "If these pass, you can then rebase the larger updates (nx, testing, mui groups)."