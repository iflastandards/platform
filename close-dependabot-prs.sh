#!/bin/bash

# Temporarily unset GITHUB_TOKEN to use keyring credentials
unset GITHUB_TOKEN

echo "Closing manually updated Dependabot PRs..."

# PRs we've manually updated
prs_to_close=(20 19 18 17 16 15 12)
pr_descriptions=(
  "zod 4.0.14"
  "@types/react 19.1.9" 
  "@hookform/resolvers 5.2.1"
  "algoliasearch 5.35.0"
  "lucide-react 0.536.0"
  "chalk 5.5.0"
  "nx group updates"
)

for i in "${!prs_to_close[@]}"; do
  pr_num=${prs_to_close[$i]}
  description=${pr_descriptions[$i]}
  echo "Closing PR #$pr_num ($description)..."
  gh pr close $pr_num --comment "Manually updated $description locally. Closing this PR." || echo "Failed to close PR #$pr_num"
done

echo "Done closing PRs!"