# GitHub Secrets Required for Deployment

This document lists all the GitHub secrets that must be configured in your repository settings for successful deployment.

## Required Secrets

### Google Services
- **GOOGLE_SHEETS_API_KEY**: Google Sheets API key for vocabulary automation
  - Format: `AIzaSy...` (39 characters)
  - Used for: Reading/writing vocabulary data from Google Sheets

- **GSHEETS_SA_KEY**: Google Service Account key (base64 encoded)
  - Format: Base64-encoded JSON service account file
  - Used for: Server-side Google Sheets authentication

### Supabase (Database & Auth)
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase project URL
  - Format: `https://[project-id].supabase.co`
  - Used for: Database and authentication services

- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous/public key
  - Format: JWT token (3 parts separated by dots)
  - Used for: Client-side Supabase authentication

### Cerbos (NOT USED - Never Implemented)
> **Note**: These variables were planned but never used. The platform uses custom RBAC via Clerk publicMetadata.

- ~~**CERBOS_HUB_CLIENT_ID**~~: Not needed
- ~~**CERBOS_HUB_CLIENT_SECRET**~~: Not needed
- ~~**CERBOS_HUB_WORKSPACE_SECRET**~~: Not needed
- ~~**CERBOS_HUB_BUNDLE**~~: Not needed

### GitHub OAuth (Admin Portal)
- **AUTH_GITHUB_ID**: GitHub OAuth App ID
  - Format: `Ov23li[alphanumeric]` (20 characters)
  - Used for: GitHub login in admin portal

- **AUTH_GITHUB_SECRET**: GitHub OAuth App secret
  - Format: 40-character hexadecimal string
  - Used for: GitHub OAuth authentication

- **AUTH_SECRET**: Session encryption secret
  - Format: 32+ character random string
  - Used for: Encrypting session cookies
  - Generate with: `openssl rand -base64 32`

### Nx Cloud (Build Optimization)
- **NX_CLOUD_ACCESS_TOKEN**: Nx Cloud access token
  - Format: UUID or similar token
  - Used for: Distributed builds and caching
  - Note: Use read-only token for public repos

### GitHub (Auto-provided)
- **GITHUB_TOKEN**: Automatically provided by GitHub Actions
  - No configuration needed
  - Used for: Repository operations during CI/CD

## Environment-Specific Configuration

### Preview Environment
- Uses `DOCS_ENV=preview` automatically
- Deployed to: https://iflastandards.github.io/platform/
- Cerbos bundle: Can use `latest` or `preview`

### Production Environment  
- Uses `DOCS_ENV=production` automatically
- Deployed to: https://www.iflastandards.info/
- Cerbos bundle: Should use `stable` for reliability

## Setting Secrets in GitHub

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name listed above
5. Paste the secret value (be careful not to include extra whitespace)

## Security Notes

- Never commit these values to the repository
- Secrets are masked in GitHub Actions logs
- Fork PRs have restricted access to secrets (expected behavior)
- Rotate secrets regularly, especially after team changes
- Use different values for preview vs production when possible

## Troubleshooting

If CI tests fail with authentication errors:
1. Verify all secrets are set in GitHub repository settings
2. Check for typos in secret names (they're case-sensitive)
3. Ensure secrets don't have extra whitespace
4. For base64 values, verify they're properly encoded
5. Check GitHub Actions logs (secrets will be masked as ***)

## Testing Locally

To test with these values locally:
1. Copy `.env.example` to `.env.local`
2. Add your development values (never production secrets!)
3. The CI tests will skip when `CI=false`