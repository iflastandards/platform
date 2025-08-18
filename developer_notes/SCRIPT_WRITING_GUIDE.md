# Script Writing Guide

Quick reference for writing well-documented scripts in the IFLA Standards repository.

## Required Documentation Template

Every script MUST include documentation at the top of the file:

### JavaScript/TypeScript
```javascript
#!/usr/bin/env node

/**
 * Script Name - Brief one-line description
 * 
 * Purpose: Detailed explanation of what this script does
 * Usage: How to run this script
 * Documentation: developer_notes/script-inventory-system.md
 * 
 * @category build|test|utility|analysis|deployment|development
 * @deprecated (if applicable)
 */
```

### Python
```python
#!/usr/bin/env python3

"""
Script Name - Brief one-line description

Purpose: Detailed explanation of what this script does
Usage: How to run this script  
Documentation: developer_notes/script-inventory-system.md

Category: build|test|utility|analysis|deployment|development
"""
```

### Shell/Bash
```bash
#!/bin/bash

# Script Name - Brief one-line description
# Purpose: Detailed explanation of what this script does
# Usage: How to run this script
# Documentation: developer_notes/script-inventory-system.md
# Category: build|test|utility|analysis|deployment|development
```

## Required Elements

### 1. Documentation Header ✅
- Must be at the top of the file
- Include purpose and usage
- Reference documentation location

### 2. CLI Scripts Must Have --help ✅
```javascript
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
    Usage: node script.js [options]
    
    Options:
      --help, -h    Show this help message
      --verbose     Show detailed output
  `);
  process.exit(0);
}
```

### 3. Test Files Need Tags ✅
```javascript
/**
 * @test
 * @unit (or @integration, @e2e, @smoke)
 */

// Or in the test itself:
describe('@integration Database tests', () => {
  // tests
});
```

### 4. Deprecated Scripts ✅
```javascript
/**
 * @deprecated Use new-script.js instead
 * This script will be removed in version 2.0
 */
console.warn('DEPRECATED: This script is deprecated. Use new-script.js instead');
```

## Categories

Use one of these standard categories:
- **build** - Build and compilation scripts
- **test** - Test runners and test utilities  
- **utility** - General purpose utilities
- **analysis** - Code analysis and reporting
- **deployment** - Deployment and release scripts
- **development** - Development tools and helpers

## Best Practices

### 1. Descriptive Names
```bash
✅ validate-test-coverage.js
✅ build-docusaurus-sites.js
❌ script1.js
❌ temp.js
```

### 2. Exit Codes
```javascript
// Success
process.exit(0);

// Error
console.error('Error:', error.message);
process.exit(1);
```

### 3. Progress Indicators
```javascript
console.log('🔍 Starting analysis...');
console.log('✅ Analysis complete!');
console.log('❌ Error: Analysis failed');
```

### 4. Verbose Mode
```javascript
const verbose = process.argv.includes('--verbose');
if (verbose) {
  console.log('Detailed information...');
}
```

### 5. Error Handling
```javascript
try {
  // script logic
} catch (error) {
  console.error('Error:', error.message);
  if (verbose) {
    console.error(error.stack);
  }
  process.exit(1);
}
```

## Pre-commit Validation

Your script will be automatically validated before commit:

```bash
# Run manually to test
node scripts/validate-script-docs.js

# Validation checks:
✓ Documentation header present
✓ Purpose/description included
✓ Documentation reference provided
✓ CLI scripts have --help
✓ Test files have tags
✓ Deprecated scripts marked
```

## Finding Existing Scripts

Before writing a new script, check if similar functionality exists:

```bash
# Search the inventory
cd scripts/script-inventory
node query.js search "build"
node query.js search "test"
node query.js category utility

# View all scripts
node query.js all
```

## Examples of Well-Documented Scripts

### CLI Tool Example
```javascript
#!/usr/bin/env node

/**
 * Build Validator - Validates build output for all sites
 * 
 * Purpose: Checks that all Docusaurus sites build successfully and 
 *          validates the output for required files and structure
 * Usage: node validate-builds.js [--site=<site>] [--verbose]
 * Documentation: developer_notes/build-system.md
 * 
 * @category build
 * @cli
 */

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Build Validator
Validates build output for all Docusaurus sites

Usage: node validate-builds.js [options]

Options:
  --site=<name>  Validate specific site only
  --verbose      Show detailed output
  --help, -h     Show this help message

Examples:
  node validate-builds.js
  node validate-builds.js --site=portal
  node validate-builds.js --verbose
  `);
  process.exit(0);
}

// Script implementation...
```

### Test File Example
```javascript
#!/usr/bin/env node

/**
 * API Integration Tests
 * 
 * Purpose: Tests API endpoints for vocabulary services
 * Documentation: developer_notes/testing-strategy.md
 * 
 * @test
 * @integration
 * @category test
 */

describe('@integration API Tests', () => {
  test('GET /api/vocabularies returns list', async () => {
    // test implementation
  });
});
```

## Quick Checklist

Before committing a new script:

- [ ] Documentation header at top of file
- [ ] Purpose clearly explained
- [ ] Usage examples provided
- [ ] Documentation reference included
- [ ] Category specified (@category tag)
- [ ] Help option for CLI scripts (--help)
- [ ] Test tags for test files (@unit/@integration/@e2e)
- [ ] Deprecation notice if applicable
- [ ] Descriptive filename
- [ ] Proper error handling
- [ ] Appropriate exit codes

## Getting Help

1. Check existing scripts: `node scripts/script-inventory/query.js all`
2. Read full documentation: `developer_notes/script-inventory-system.md`
3. Validate your script: `node scripts/validate-script-docs.js`
4. Search for patterns: `node scripts/script-inventory/query.js search <keyword>`

---

*Remember: Well-documented scripts save time for everyone, including your future self!*