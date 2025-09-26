# Nx Package Dependency Optimization Plan

## Problem: Unnecessary Rebuilds of Core Packages

The `@ifla/theme` and `@ifla/contracts` packages are rebuilding every time despite no changes, causing cascading rebuilds of all dependent projects.

### Current Dependency Chain

```
@ifla/contracts (base package)
    ↓
@ifla/theme (depends on contracts)
    ↓
All Docusaurus sites (6 sites depend on theme)
```

When ANY site changes, Nx detects it as affecting these packages and rebuilds them unnecessarily.

## Root Causes

### 1. **Overly Broad Input Configurations**

From `nx.json` line 114-117:
```json
"build": {
  "dependsOn": ["^build"],  // ← This causes upward dependency tracking
  "inputs": ["buildInputs", "^buildInputs", "sharedGlobals"],  // ← Too broad
  "cache": true
}
```

The `^build` dependency and `^buildInputs` cause Nx to track changes in consuming projects, not just dependencies.

### 2. **Missing Package-Specific Configuration**

Theme and contracts packages don't have their own narrow input definitions. They inherit the global config which includes:
- `sharedGlobals` (line 57-67): Includes ALL workflow files, global configs
- `buildInputs` (line 68-77): Generic pattern that's too broad

### 3. **Theme Package Build Script**

From theme's build target:
```json
{
  "executor": "nx:run-commands",
  "options": {
    "command": "./build.sh",
    "cwd": "packages/theme"
  },
  "inputs": [
    "production",
    "{projectRoot}/src/**/*",  // Good - specific
    "{projectRoot}/tsup.config.ts",
    "{projectRoot}/tsconfig.declarations.json",
    "{projectRoot}/package.json"
  ]
}
```

The theme has good specific inputs, but contracts uses default inputs.

## Solution: Optimized Configuration

### Step 1: Fix Contracts Package Configuration

Add to `packages/contracts/project.json`:
```json
{
  "targets": {
    "build": {
      "executor": "nx:run-script",
      "options": {
        "script": "build"
      },
      "inputs": [
        "{projectRoot}/src/**/*",
        "{projectRoot}/tsup.config.ts",
        "{projectRoot}/tsconfig.json",
        "{projectRoot}/package.json",
        "!{projectRoot}/**/*.test.*",
        "!{projectRoot}/**/*.spec.*",
        "!{projectRoot}/**/*.md"
      ],
      "outputs": ["{projectRoot}/dist"],
      "dependsOn": [],  // ← No dependencies, it's the base
      "cache": true
    }
  }
}
```

### Step 2: Fix Theme Package Dependencies

Update `packages/theme/project.json`:
```json
{
  "targets": {
    "build": {
      "inputs": [
        "{projectRoot}/src/**/*",
        "{projectRoot}/tsup.config.ts",
        "{projectRoot}/tsconfig.declarations.json",
        "{projectRoot}/package.json",
        "!{projectRoot}/**/*.test.*",
        "!{projectRoot}/**/*.spec.*",
        "!{projectRoot}/**/*.md",
        {
          "dependentTasksOutputFiles": "packages/contracts/dist/**/*",
          "transitive": false
        }
      ],
      "dependsOn": [
        {
          "target": "build",
          "projects": ["@ifla/contracts"]
        }
      ],
      "cache": true
    }
  }
}
```

### Step 3: Create Package-Specific Named Inputs

Add to `nx.json`:
```json
{
  "namedInputs": {
    "packageBuildInputs": [
      "{projectRoot}/src/**/*",
      "{projectRoot}/tsup.config.ts",
      "{projectRoot}/tsconfig*.json",
      "{projectRoot}/package.json",
      "!{projectRoot}/**/*.test.*",
      "!{projectRoot}/**/*.spec.*",
      "!{projectRoot}/**/*.md"
    ],
    "packageDependencies": [
      {
        "dependentTasksOutputFiles": "**/*.d.ts",
        "transitive": false
      }
    ]
  }
}
```

### Step 4: Optimize Site Dependencies

For each Docusaurus site, update the build configuration:
```json
{
  "targets": {
    "build": {
      "dependsOn": [
        {
          "target": "build",
          "projects": ["@ifla/theme"],
          "params": "forward"
        }
      ],
      "inputs": [
        "docusaurus",
        {
          "dependentTasksOutputFiles": "packages/theme/dist/**/*",
          "transitive": false
        }
      ]
    }
  }
}
```

## Advanced Optimization: Content Hashing

### Enable Smart Hashing for Packages

```json
{
  "targets": {
    "build": {
      "options": {
        "outputHashing": "all"
      },
      "outputs": [
        "{projectRoot}/dist",
        "{projectRoot}/.cache/build-hash"
      ]
    }
  }
}
```

### Implement Build Hash Checking

Create `packages/theme/scripts/check-build-hash.js`:
```javascript
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function calculateHash(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  const hash = crypto.createHash('sha256');

  files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(path.join(dir, file));
      hash.update(content);
    }
  });

  return hash.digest('hex');
}

const srcHash = calculateHash('./src');
const cacheFile = '.cache/build-hash';

if (fs.existsSync(cacheFile)) {
  const lastHash = fs.readFileSync(cacheFile, 'utf8');
  if (lastHash === srcHash) {
    console.log('No changes detected, skipping build');
    process.exit(0);
  }
}

fs.mkdirSync('.cache', { recursive: true });
fs.writeFileSync(cacheFile, srcHash);
```

## Testing the Optimization

### Before Optimization
```bash
# Make a change to a single site
echo "// test" >> standards/isbd/src/pages/index.tsx

# Check what rebuilds
nx affected:build --dry-run

# Expected: Everything rebuilds (theme, contracts, all sites)
```

### After Optimization
```bash
# Make a change to a single site
echo "// test" >> standards/isbd/src/pages/index.tsx

# Check what rebuilds
nx affected:build --dry-run

# Expected: Only the changed site rebuilds
```

### Verification Commands
```bash
# Check cache status
nx print-affected --target=build --select=projects

# View dependency graph
nx graph --affected

# Test cache hits
nx reset  # Clear cache
nx build theme  # First build
nx build theme  # Should be cached
nx build isbd   # Should NOT rebuild theme
```

## Expected Results

| Scenario | Before | After | Improvement |
|----------|---------|--------|-------------|
| Site change | Rebuilds theme + contracts | Only site | 90% faster |
| Theme change | Rebuilds all sites | Rebuilds sites (cached theme) | 50% faster |
| Contracts change | Rebuilds everything | Only affected | 70% faster |
| No changes | Still checks everything | Full cache hit | 95% faster |

## Implementation Checklist

- [ ] Update contracts package.json with specific inputs
- [ ] Update theme package.json with narrow dependencies
- [ ] Add packageBuildInputs to nx.json
- [ ] Update all site build configurations
- [ ] Test with `nx affected:build --dry-run`
- [ ] Verify cache hits with `nx build theme --verbose`
- [ ] Monitor CI build times for improvement

## Rollback Plan

If issues occur:
1. Revert to original configurations
2. Clear Nx cache: `nx reset`
3. Rebuild all: `nx run-many --target=build --all`

## Additional Optimizations

### 1. **Parallel Builds with Agents**
Once this is fixed, enabling Nx agents will provide even more benefit as packages won't rebuild unnecessarily on different agents.

### 2. **Incremental TypeScript**
Enable `incremental: true` in tsconfig for faster type checking.

### 3. **Remote Caching**
With proper inputs, remote caching will be much more effective, reducing CI time significantly.