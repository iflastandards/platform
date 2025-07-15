# Quick Start: GitHub Teams Integration

## 🎯 Current Sprint Goal

Enable all 5 Clerk test users to see their appropriate dashboards with correct role-based UI.

---

## 📋 Today's Checklist

### Morning Tasks
- [x] Create PRD and documentation structure
- [x] Create epic and task tracking  
- [ ] Test current dashboard routing with Clerk users
- [ ] Document what's broken

### Afternoon Tasks  
- [ ] Fix role detection for Clerk metadata
- [ ] Update mock data for multi-team support
- [ ] Verify each user sees correct dashboard
- [ ] Commit fixes

---

## 🧪 Test User Verification

Run through each user and document current vs expected behavior:

### 1. Translator User
```bash
# Login as: translator+clerk_test@example.com
# Password: (your test password)
```
- **Current**: ❓ Unknown
- **Expected**: Basic dashboard with translation projects only
- **Fix**: Update role detection logic

### 2. Author User  
```bash
# Login as: author+clerk_test@example.com
```
- **Current**: ❓ Unknown  
- **Expected**: Dashboard with authoring tools, namespace access
- **Fix**: Map to correct team membership

### 3. Editor User
```bash
# Login as: editor+clerk_test@example.com  
```
- **Current**: ❓ Unknown
- **Expected**: Multi-namespace editing capabilities
- **Fix**: Support multi-team membership

### 4. RG Admin User
```bash
# Login as: rg_admin+clerk_test@example.com
```
- **Current**: ❓ Unknown
- **Expected**: Review Group admin dashboard at `/dashboard/rg`
- **Fix**: Detect reviewGroupAdmin role

### 5. Superadmin User  
```bash
# Login as: superadmin+clerk_test@example.com
```
- **Current**: ❓ Unknown
- **Expected**: Full system admin dashboard
- **Fix**: Detect systemRole admin

---

## 🔧 Quick Fixes Needed

### 1. Update Role Detection (`/lib/clerk-cerbos.ts`)
```typescript
// Add support for Clerk metadata structure
function getUserRole(user: ClerkUser) {
  const metadata = user.publicMetadata;
  
  // Check system role first
  if (metadata.systemRole === 'admin') return 'admin';
  
  // Check review group admin
  if (metadata.reviewGroups?.some(rg => rg.role === 'maintainer')) {
    return 'rg_admin';
  }
  
  // Check project roles
  // ... etc
}
```

### 2. Fix Dashboard Routing (`/app/dashboard/page.tsx`)
```typescript
// Remove hardcoded demo logic
// Use real Clerk user data
```

### 3. Update Mock Users (`/lib/mock-data/auth.ts`)
```typescript
// Add multi-team support
// Match Clerk test user emails
```

---

## 📊 Progress Tracking

### Phase 1: Documentation ✅
- [x] PRD created
- [x] Epic/tasks created  
- [ ] Architecture docs (tomorrow)

### Phase 2: Current State Fix 🚧
- [ ] Test all 5 users (TODAY)
- [ ] Fix routing issues (TODAY)
- [ ] Update mock data (TODAY)

### Phase 3: Navigation 🔜
- [ ] Start tomorrow
- [ ] User-centric navbar
- [ ] Context switching

---

## 🚀 Next Steps

### By End of Day
1. All 5 test users can login
2. Each sees appropriate dashboard
3. Document any remaining issues

### Tomorrow Morning
1. Create architecture diagrams
2. Start navigation refactor
3. Design team management UI

### This Week's Goal
- Complete Phase 1 & 2
- Start Phase 3 (Navigation)

---

## 📝 Notes Section

### Discovered Issues
- (Document as you test)

### Questions for Team
- ISBD team member list format?
- GitHub organization access needed?
- Webhook endpoints for production?

### Helpful Commands
```bash
# Run dev server
pnpm nx dev admin --turbopack

# Run with MSW mocking enabled
MOCK_GITHUB_API=true pnpm nx dev admin --turbopack

# Check TypeScript
pnpm nx run admin:typecheck

# Run linter
pnpm nx run admin:lint --fix

# View current routes
find apps/admin/src/app -name "page.tsx" | sort
```

### Test Data Generation
```bash
# Generate comprehensive test data (once implemented)
pnpm tsx scripts/generate-test-users.ts --count=20

# Test specific scenarios
pnpm tsx scripts/test-multi-team-users.ts

# Run GitHub integration tests
pnpm test:github-integration
```

### MSW Testing
```bash
# Start dev server with MSW enabled
MOCK_GITHUB_API=true pnpm nx dev admin --turbopack

# Test rate limiting scenarios
MOCK_RATE_LIMIT=true pnpm nx dev admin --turbopack

# Test error scenarios
MOCK_ERRORS=true pnpm nx dev admin --turbopack
```

---

## 🔗 Quick Links

- [PRD Document](./PRD-github-teams-integration.md)
- [Epic & Tasks](./EPIC-github-integration-tasks.md)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [GitHub Organization](https://github.com/iflastandards)

---

## 💡 Remember

1. **Document everything** as you test
2. **Commit frequently** with clear messages
3. **Test each user** thoroughly
4. **Ask questions** when blocked

---

**Last Updated**: {{ Current Date }}  
**Next Review**: Tomorrow's standup