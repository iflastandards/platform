# GitHub OAuth Setup Guide

## Quick Setup

1. **Create a GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in the form:
     - **Application name**: IFLA Standards Admin (Local)
     - **Homepage URL**: `http://localhost:3000`
     - **Authorization callback URL**: `http://localhost:3007/services/api/auth/callback/github`
   - Click "Register application"

2. **Copy the credentials**
   - Copy the **Client ID**
   - Click "Generate a new client secret"
   - Copy the **Client Secret**

3. **Update your .env file**
   ```bash
   # In apps/admin/.env
   GITHUB_ID=your_actual_client_id_here
   GITHUB_SECRET=your_actual_client_secret_here
   ```

4. **Restart the admin server**
   - Stop the current demo (Ctrl+C)
   - Run `pnpm demo:admin:simple` again

## Different Environments

### Local Development
- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3007/services/api/auth/callback/github`

### Preview (GitHub Pages)
- **Homepage URL**: `https://iflastandards.github.io/platform`
- **Callback URL**: `https://iflastandards.github.io/platform/services/api/auth/callback/github`

### Production
- **Homepage URL**: `https://www.iflastandards.info`
- **Callback URL**: `https://www.iflastandards.info/services/api/auth/callback/github`

## Troubleshooting

### "Invalid callback URL" error
- Make sure the callback URL in GitHub matches EXACTLY (including the `/services` part)
- The callback URL must include the full path: `/services/api/auth/callback/github`

### "Client ID not found" error
- Ensure you've copied the correct Client ID (not the secret)
- Check that there are no extra spaces or quotes in your .env file

### Session not persisting
- Make sure `NEXTAUTH_URL` includes the `/services` basePath
- For local development: `NEXTAUTH_URL=http://localhost:3007/services`