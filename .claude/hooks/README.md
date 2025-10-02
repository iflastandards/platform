# Claude Hooks Configuration

## Available Hooks

### Pre-Compact Hooks

#### 1. **pre-compact** (Full Version - 7.4KB)
**Execution time**: ~3-4 seconds  
**What it saves**: Everything possible
- ✅ Git diffs and state
- ✅ TODO lists
- ✅ Package.json
- ✅ Test results
- ✅ Terminal history (last 100 commands)
- ✅ Running server checks
- ✅ Creates temporary git commit
- ✅ Stash list

**When to use**: Maximum safety, don't mind the overhead

#### 2. **pre-compact-lean** (Optimized Version - 4.5KB) ⭐ RECOMMENDED
**Execution time**: ~1 second  
**What it saves**: Essential items only
- ✅ Git diffs and state
- ✅ TODO lists  
- ✅ Package.json
- ✅ Recent test results (<5 min old)
- ❌ Terminal history (optional via env var)
- ❌ Running processes (optional via env var)
- ❌ Temporary commit (optional via env var)

**When to use**: Best balance of speed and safety

### Post-Compact Hooks

#### 1. **post-compact** (Standard - 4.2KB) ⭐ RECOMMENDED
**Output**: ~500 tokens
- Shows git status summary
- Displays current branch
- Lists running servers
- Shows last 5 commands
- Confirms restoration

#### 2. **post-compact-minimal** (Minimal - 0.5KB)
**Output**: ~20 tokens
- Silent restoration
- Single confirmation message

## Configuration

### Switching Hooks

```bash
# Use lean pre-compact (recommended)
ln -sf pre-compact-lean pre-compact

# Use full pre-compact (maximum preservation)
ln -sf pre-compact-full pre-compact

# Back to original
git checkout .claude/hooks/pre-compact
```

### Environment Variables (for lean version)

```bash
# Enable optional features for one-time use
COMPACT_SAVE_HISTORY=true claude        # Save terminal history
COMPACT_CREATE_COMMIT=true claude        # Create temporary commit
COMPACT_CHECK_PROCESSES=true claude      # Check running servers

# Or set in your shell profile for permanent use
export COMPACT_SAVE_HISTORY=true
```

## Performance Comparison

| Feature | Full | Lean | Lean+Options |
|---------|------|------|--------------|
| Git diffs | ✅ 0.5s | ✅ 0.5s | ✅ 0.5s |
| TODOs | ✅ 0.1s | ✅ 0.1s | ✅ 0.1s |
| Package.json | ✅ 0.1s | ✅ 0.1s | ✅ 0.1s |
| Test results | ✅ 0.1s | ✅* 0.1s | ✅* 0.1s |
| Terminal history | ✅ 0.2s | ❌ | ✅ 0.2s |
| Process check | ✅ 0.5s | ❌ | ✅ 0.5s |
| Temp commit | ✅ 2.0s | ❌ | ✅ 2.0s |
| **Total Time** | **~4s** | **~1s** | **~4s** |

*Only saves if < 5 minutes old

## Recommendations

### For Most Users
Use **pre-compact-lean** + **post-compact** (default)
- Fast (1 second)
- Preserves essential state
- Good context summary on restore

### For Maximum Safety
Use **pre-compact** (full) + **post-compact**
- Slower (4 seconds)
- Saves everything including history
- Best for critical work sessions

### For Minimal Overhead
Use **pre-compact-lean** + **post-compact-minimal**
- Fastest (<1 second total)
- Silent operation
- Minimal context usage

## Troubleshooting

### State not restoring?
Check `.claude-state/` directory for backup files

### Want to manually restore?
```bash
# Find latest restore script
ls -t .claude-state/restore_*.sh | head -1

# Run it
bash .claude-state/restore_20240115_143022.sh
```

### Clean up old states
```bash
# Remove states older than 7 days
find .claude-state -name "*.diff" -mtime +7 -delete
find .claude-state -name "*.json" -mtime +7 -delete
```