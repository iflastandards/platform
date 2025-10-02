# Local Supabase Quick Reference

## Service URLs (After `supabase start`)

| Service | URL | Purpose |
|---------|-----|---------|
| **API** | http://127.0.0.1:54321 | Main Supabase API endpoint |
| **GraphQL** | http://127.0.0.1:54321/graphql/v1 | GraphQL API |
| **Storage** | http://127.0.0.1:54321/storage/v1/s3 | S3-compatible storage |
| **Database** | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct PostgreSQL connection |
| **Studio** | http://127.0.0.1:54323 | Supabase Studio UI |
| **Inbucket** | http://127.0.0.1:54324 | Email testing interface |

## Authentication Keys

```bash
# Anonymous Key (for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key (for server-side admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# JWT Secret (for token validation)
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

## Storage Credentials

```bash
# S3 Compatible Storage
S3_ACCESS_KEY=625729a08b95bf1b7ff351a663f3a23c
S3_SECRET_KEY=850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
S3_REGION=local
```

## Quick Commands

```bash
# Start Supabase (requires Orbstack/Docker running)
supabase start

# Stop Supabase
supabase stop

# Check status
supabase status

# Reset database (WARNING: deletes all data)
supabase db reset

# View logs
supabase logs

# Access database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Testing Environments

```bash
# Switch to local Supabase environment
pnpm env:local

# Run tests with local Supabase
pnpm test:with-local

# Develop with local Supabase
pnpm dev:local
```

## Troubleshooting

### Orbstack/Docker Not Running
```bash
# Check if Docker is running
docker ps

# If not, start Orbstack
open -a OrbStack
```

### Port Conflicts
If ports are already in use:
```bash
# Find what's using the port
lsof -i :54321

# Kill the process
kill -9 <PID>

# Or stop all Supabase services
supabase stop --no-backup
```

### Connection Refused
```bash
# Check if services are running
supabase status

# Restart if needed
supabase stop
supabase start
```

### Database Migrations
```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# View migration status
supabase migration list
```

## Integration with Admin App

The admin app automatically detects local Supabase when:
1. `NEXT_PUBLIC_ENV_NAME=test_local` or `test_integration`
2. `USE_LOCAL_SUPABASE=true`
3. Supabase services are running

Check connection in the app:
```typescript
import { config } from '@/config/environment';

console.log('Using local Supabase:', config.env.isLocalSupabase);
console.log('Supabase URL:', config.env.supabaseUrl);
console.log('Connection strings:', config.getConnectionStrings());
```

## Useful Studio Features

Access Studio at http://127.0.0.1:54323 to:
- View and edit table data
- Run SQL queries
- Manage database roles and permissions
- View real-time logs
- Test RLS policies
- Manage storage buckets

## Email Testing with Inbucket

Access Inbucket at http://127.0.0.1:54324 to:
- View all emails sent by Supabase Auth
- Test password reset flows
- Debug email templates
- No actual emails are sent - all captured locally