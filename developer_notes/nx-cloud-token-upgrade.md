# Upgrading Your Nx Cloud Token

## Current Status
✅ Nx Cloud is connected and working  
⚠️ Using a read-only token (can read cache but not write)  
📊 Run details visible at: https://nx.app/runs/e8Xh1BlPhQ

## To Get Full Benefits

Your current token ends with `|read=` which indicates read-only access. This means:
- ✅ You can read from the remote cache
- ❌ You cannot write to the remote cache
- ❌ Other team members won't benefit from your builds

## Steps to Upgrade

1. **Visit your Nx Cloud dashboard**:
   ```
   https://nx.app
   ```

2. **Navigate to your workspace**:
   - Click on your workspace (ID: `6857fccbb755d4191ce6fbe4`)

3. **Generate a new access token**:
   - Go to Settings → Access Tokens
   - Click "Generate New Token"
   - Select "Read & Write" permissions
   - Give it a descriptive name (e.g., "Development Token")

4. **Update your local configuration**:
   ```bash
   # Edit nx-cloud.env
   NX_CLOUD_ACCESS_TOKEN=your-new-read-write-token
   ```

5. **For CI/CD (GitHub Actions)**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Update `NX_CLOUD_ACCESS_TOKEN` with the new token

## Token Types

### Read-Only Token (Current)
- Format: `...base64...|read=`
- Can pull from cache
- Cannot push to cache
- Good for: Public CI, untrusted environments

### Read-Write Token (Recommended)
- Format: `...base64...` (no suffix)
- Can pull and push to cache
- Full performance benefits
- Good for: Development, trusted CI

### Admin Token
- Full workspace management
- Can create/delete tokens
- Manage team access
- Good for: Workspace administrators

## Verification

After updating your token, test it:

```bash
# Clear local cache
pnpm nx:cache:clear

# Build something
pnpm nx build portal

# Check for "Stored to remote cache" message
# You should NOT see "Skipping storing"
```

## Security Notes

- Never commit tokens to version control
- Use different tokens for different environments
- Rotate tokens periodically
- Revoke compromised tokens immediately

---

*Need help? Check the [Nx Cloud docs](https://nx.app/docs/core-features/share-cache) or contact support.*