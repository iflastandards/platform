# Nx Cloud Setup Guide

**Last Updated**: July 13, 2025  
**Nx Cloud ID**: `6857fccbb755d4191ce6fbe4`

## Current Status

Nx Cloud is configured in `nx.json` with the following settings:
- **Cloud ID**: `6857fccbb755d4191ce6fbe4`
- **Runner**: `nx-cloud`
- **Distributed Execution**: Enabled (8 agents)
- **Remote Caching**: Enabled
- **Parallel Tasks**: 8

## Setup Instructions

### 1. Connect Your Workspace

If not already connected, visit the connection URL:
```
https://cloud.nx.app/connect/7sAIxmqedL
```

### 2. Set Access Token

After connecting, you'll receive an access token. Set it in one of these ways:

#### Option A: Environment Variable (Recommended for CI)
```bash
export NX_CLOUD_ACCESS_TOKEN="your-token-here"
```

#### Option B: nx-cloud.env File (Recommended for local development)
Create `nx-cloud.env` in project root:
```bash
NX_CLOUD_ACCESS_TOKEN=your-token-here
```

#### Option C: nx.json (Not recommended - don't commit tokens)
```json
{
  "nxCloudAccessToken": "your-token-here"
}
```

### 3. Verify Connection

Test that Nx Cloud is working:
```bash
# Clear local cache first
pnpm nx:cache:clear

# Run a cacheable operation
pnpm nx build portal

# Run again - should be instant (retrieved from cloud)
pnpm nx build portal
```

Look for output like:
```
Nx Cloud made it possible to reuse portal
```

## Features Enabled

### 1. Distributed Task Execution (DTE)
- Configured for 8 agents in CI
- Splits tasks across multiple machines
- Dramatically speeds up CI pipelines

### 2. Remote Caching
- Shares computation cache across team
- Avoids rebuilding unchanged projects
- Works across different machines

### 3. Run Analytics
- View build insights at https://nx.app
- Identify bottlenecks
- Track performance over time

## CI/CD Configuration

### GitHub Actions Setup

Your workflows already include Nx Cloud configuration:

```yaml
env:
  NX_CLOUD_DISTRIBUTED_EXECUTION: true
  NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT: 8
  NX_BRANCH: ${{ github.head_ref || github.ref_name }}
  NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}
```

### Setting the GitHub Secret (Public Repository)

**⚠️ IMPORTANT: Since this is a public repository, you MUST use a read-only token for CI/CD**

1. Generate a read-only token at https://nx.app
2. Go to GitHub repository settings
3. Navigate to Secrets and variables → Actions
4. Add new repository secret:
   - Name: `NX_CLOUD_ACCESS_TOKEN`
   - Value: Your read-only token (ending with `|read=`)

**Security Note**: Never use a read-write token in public repository workflows!

## Local Development

### Performance Settings

Already configured in `.env.nx`:
```bash
NX_CLOUD_DISTRIBUTED_EXECUTION=true
NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT=8
NX_CLOUD_CACHE_TIMEOUT=60
```

### Useful Commands

```bash
# View cloud run details
pnpm nx show projects --with-target build

# Run with cloud execution
pnpm nx affected -t build

# Skip cloud cache (for testing)
pnpm nx build portal

# View cache statistics
pnpm nx:cache:stats
```

## Monitoring

### Nx Cloud Dashboard
- Visit https://nx.app
- Sign in with your workspace
- View run details, timings, and cache hits

### Key Metrics to Monitor
1. **Cache Hit Rate**: Should be >80% for unchanged code
2. **Average Build Time**: Track improvements
3. **DTE Efficiency**: Time saved by distribution
4. **Failed Runs**: Identify flaky tests

## Troubleshooting

### Issue: "Could not find Nx Cloud runner"
```bash
# Reinstall Nx Cloud
pnpm add -D @nrwl/nx-cloud@latest
```

### Issue: "Unauthorized" errors
```bash
# Check token is set
echo $NX_CLOUD_ACCESS_TOKEN

# Regenerate token at nx.app if needed
```

### Issue: Cache misses for unchanged code
```bash
# Check runtime inputs
pnpm nx show project portal --json | jq .targets.build.inputs

# Clear and rebuild cache
pnpm nx:cache:clear
pnpm nx reset
```

### Issue: Slow cloud operations
```bash
# Increase timeout
export NX_CLOUD_CACHE_TIMEOUT=300

# Check network
curl -I https://nx.app
```

## Best Practices

1. **Don't Commit Tokens**: Use environment variables or `.env` files
2. **Monitor Cache Hits**: Low hit rate indicates configuration issues
3. **Use Affected Commands**: `nx affected` for optimal performance
4. **Regular Updates**: Keep `@nrwl/nx-cloud` updated
5. **Clean Cache Periodically**: Prevent stale cache issues

## Advanced Configuration

### Custom Distributed Execution

Modify agent count per environment:
```yaml
# CI: More agents
NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT: 8

# Local: Fewer agents
NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT: 4
```

### Selective Caching

Exclude specific targets:
```json
{
  "targetDefaults": {
    "e2e": {
      "cache": false
    }
  }
}
```

### Access Control

Set up team permissions at https://nx.app:
- Read-only access for contractors
- Write access for core team
- Admin access for leads

## Cost Optimization

1. **Use Free Tier**: 500 computation hours/month
2. **Optimize Agent Count**: Balance speed vs cost
3. **Cache Efficiently**: Proper input configuration
4. **Monitor Usage**: Track at nx.app/billing

---

*For more information, visit [Nx Cloud Documentation](https://nx.app/docs)*