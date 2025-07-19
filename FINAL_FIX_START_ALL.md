# Final Fix for pnpm start:all Issue

## The Real Problem
The issue is NOT nx recursion. The actual problems are:

1. **`concurrently` is not in PATH** - When pnpm runs scripts, it doesn't always add node_modules/.bin to PATH
2. **The build step outputs massive logs** - This makes it appear frozen/recursive

## Immediate Solutions

### Solution 1: Use Updated start:all (Recommended)
```bash
pnpm start:all
```
This now uses `./node_modules/.bin/concurrently` directly and skips the build step.

### Solution 2: Build First, Then Start
```bash
# Build theme separately
pnpm build:theme

# Then start all services
pnpm start:all
```

### Solution 3: Use npx
Update the script in package.json to use npx:
```json
"start:all": "pnpm stop:all && npx concurrently \"DOCS_ENV=local docusaurus start portal --port 3000\" ..."
```

## Root Cause Analysis

1. When running `pnpm start:all`, the script tries to run `concurrently`
2. `concurrently` is not in the system PATH
3. The command fails silently or hangs
4. The massive build output made it look like recursion

## Verification
```bash
# Check if services are running
ps aux | grep -E "(docusaurus|nx dev)" | grep -v grep

# Check ports
lsof -i :3000,3001,3002,3003,3004,3005,3006,3007
```

## Permanent Fix
Add this to your shell profile (.zshrc or .bashrc):
```bash
# Add node_modules/.bin to PATH for pnpm projects
export PATH="./node_modules/.bin:$PATH"
```

Or use pnpm's built-in solution by creating `.npmrc` with:
```
enable-pre-post-scripts=true
```

This ensures pnpm adds node_modules/.bin to PATH when running scripts.