# Fix for pnpm start:all Recursion Issue

## Problem
When running `pnpm start:all`, the command runs recursively due to nx global installation intercepting pnpm commands. This creates an infinite loop:
- `pnpm start:all` → nx intercepts → `nx run platform:start-all` → runs `pnpm start:all` → loop

## Root Cause
- Global nx installation (v21.2.1) at `/Users/jonphipps/Library/pnpm/nx`
- Nx intercepts all npm/pnpm/yarn commands in nx workspaces
- The nx target `start-all` was configured to run `pnpm start:all`, creating recursion

## Solutions

### Solution 1: Use Direct Script (Recommended)
```bash
pnpm start:all:direct
```
This runs a Node.js script that directly executes the commands without going through pnpm/nx.

### Solution 2: Use Shell Script
```bash
./start-all.sh
```
This shell script uses local binaries directly, completely bypassing pnpm and nx.

### Solution 3: Use Bypass Command
```bash
pnpm start:all:bypass
```
This uses `/bin/sh -c` to execute the command, which prevents nx interception.

### Solution 4: Use npx with --no flag
```bash
npx --no -- pnpm run start:all
```
The `--no` flag tells npx not to use any installed executables, forcing the real pnpm.

### Solution 5: Use Direct Binary Path
```bash
/Users/jonphipps/Library/Application\\ Support/Herd/config/nvm/versions/node/v22.16.0/bin/pnpm run start:all
```
This calls pnpm directly by its full path, bypassing the nx wrapper.

### Solution 6: Temporarily Disable nx
```bash
NX_SKIP_NX_CACHE=true npx --no -- pnpm run start:all
```

### Solution 7: Use nx directly
```bash
nx run platform:start-all
```
Since I've updated the nx target to not call pnpm recursively, this should work.

## Long-term Fix Options

### Option A: Remove Global nx
```bash
pnpm remove -g nx
```
This removes the global nx installation that's causing the interception.

### Option B: Use Local nx Only
Always use `npx nx` or `./node_modules/.bin/nx` instead of global nx.

### Option C: Configure nx to Not Intercept
Create a `.nxrc` file in your home directory with:
```json
{
  "tasksRunnerOptions": {
    "default": {
      "options": {
        "skipNxCache": false
      }
    }
  },
  "defaultBase": "main"
}
```

## Verification
To verify which solution works:
1. Run the command
2. Check if services start without recursion
3. Verify all 8 services are running on their respective ports

## Quick Test
```bash
# Test if nx is intercepting
which pnpm  # Should show pnpm path
type pnpm   # May show if it's being wrapped
```