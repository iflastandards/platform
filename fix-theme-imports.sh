#!/bin/bash

# Fix imports in @ifla/theme package
cd packages/theme

# Replace package imports with relative imports in test files
find src/tests -name "*.tsx" -o -name "*.ts" | while read file; do
  # Replace @ifla/theme/components imports with relative imports
  sed -i '' 's|from "@ifla/theme/components/\([^"]*\)"|from "../../components/\1"|g' "$file"
  sed -i '' 's|from "@ifla/theme/components"|from "../../components"|g' "$file"
done

# Fix imports in component files that import from @ifla/theme
find src/components -name "*.tsx" -o -name "*.ts" | while read file; do
  # Replace @ifla/theme imports with relative imports
  sed -i '' 's|from "@ifla/theme/components/\([^"]*\)"|from "./\1"|g' "$file"
  sed -i '' 's|from "@ifla/theme/components"|from "."|g' "$file"
done

echo "Fixed @ifla/theme imports"