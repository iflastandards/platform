# File Organization Strategy

This document explains the project's file organization strategy for managing output files.

## Overview

The project follows a clear file organization strategy for managing output files:

### Output Files We Wish to Keep → `output/` folder
- **Purpose**: Files that should be preserved and tracked by git
- **Organization**: Organized by purpose for easy retrieval
- **Examples**: Generated spreadsheets, processed vocabularies, validation reports
- **Git Status**: Tracked and committed to repository

### Output Files We Don't Wish to Keep → `tmp/` folder
- **Purpose**: Temporary files that don't need preservation
- **Cleanup**: Auto-cleaned nightly by automated processes
- **Git Status**: Not tracked by git (excluded in .gitignore)
- **Manual Cleanup**: Not required - automatic cleanup handles this

## Temporary Files Directory (`tmp/`)

The `tmp/` directory contains temporary files that we don't wish to keep. Files in this directory are:

- **Auto-cleaned nightly** - Automated cleanup processes remove old files
- **Not tracked by git** - This directory is excluded from version control
- **No manual deletion required** - You don't need to manually clean up files here

### Current Contents

- `apps/` - Temporary application-related files
- `packages/` - Temporary package-related files
- `*.js` files - Temporary script files and mock data

### Usage Guidelines

When creating scripts or processes that generate temporary files:

1. **Use this directory** for any output that doesn't need to be preserved
2. **Don't worry about cleanup** - files are automatically cleaned nightly
3. **Organize by purpose** if creating subdirectories (e.g., `tmp/builds/`, `tmp/tests/`)
4. **Use descriptive names** to help identify file purposes during development

### Examples

```bash
# Good - temporary build artifacts
./tmp/build-test-artifacts/

# Good - temporary test data
./tmp/test-data-$(date +%Y%m%d)/

# Good - temporary downloads
./tmp/downloads/dependency-check.json
```

## Key Principle

**Remember: If you want to keep the output, put it in the `output/` folder instead!**

## Implementation

This strategy is implemented through:

- **`.gitignore`**: Excludes `tmp/` from version control
- **Documentation**: Clear guidelines in README.md and this document
- **Scripts**: Automated cleanup processes for `tmp/` directory
- **Developer Guidelines**: Clear instructions for where to place different types of output
