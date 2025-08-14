# CLAUDE.md - IFLA Standards Platform (Optimized)

## 🚨 ALWAYS USE AGENTS - NO EXCEPTIONS

**Check `.claude/agents/` for EVERY task. Agents have platform-specific knowledge.**

## 🎯 Quick Reference

### Environment
- **Package Manager**: `pnpm` only
- **Monorepo**: Nx via `pnpm nx`
- **Working Directory**: Repository root

### Project Structure
- `apps/admin/` - Next.js 15 admin portal
- `standards/*/` - Docusaurus documentation sites
- `packages/*` - Shared packages
- `system-design-docs/` - Architecture specs (source of truth)

## 🤖 Agent Directory

| Task Keywords | Agent | Purpose |
|--------------|-------|---------|
| find, search, locate | `search-agent` | File/content search |
| test, spec, coverage | `test-writer` | Test creation |
| API, endpoint, route | `api-builder` | API development |
| component, UI, styling | `ui-developer` | UI components |
| database, query, migration | `database-agent` | Database ops |
| build, nx, dependencies | `build-agent` | Build/monorepo |
| research, best practices | `research-agent` | Documentation |
| animation, interactive | `advanced-ui-agent` | Advanced UI |
| batch, rename, move files | `file-operations-agent` | File ops |
| commit, PR, git | `git-workflow` | Git operations |
| run tests, failures | `test-runner` | Test execution |
| get from spec, extract | `context-fetcher` | Doc retrieval |
| create files, templates | `file-creator` | File generation |
| current date | `date-checker` | Date info |

## ⚡ Commands

```bash
# Development
pnpm nx dev admin --turbopack    # Admin dev
pnpm nx start {site}             # Docs dev

# Testing (use affected)
pnpm nx affected -t test
pnpm typecheck
pnpm lint

# Build
pnpm nx build {app/site}
```

## 📋 Rules

1. **DELEGATE ALL TASKS** - Even "simple" edits
2. **Prefer editing** over creating files
3. **Never create docs** unless requested
4. **Never commit** unless asked
5. **Check specs** in system-design-docs/

## 💡 Workflow

```
User Request → Identify Agent → Announce Delegation → Review Result
```

**Remember**: Agents have platform-specific knowledge. The main context should only coordinate.

---
*Optimized for maximum context preservation through aggressive agent delegation*