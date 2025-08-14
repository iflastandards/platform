# CLAUDE.md - IFLA Standards Platform

This file provides guidance to Claude Code when working with this repository.

## 🎯 Context Management Strategy
This project uses an **agent-based workflow** to preserve context. Complex tasks are delegated to specialized agents with their own context windows.

## 🚀 Core Project Rules

### Environment
- **Package manager**: `pnpm` only (never npm/yarn)
- **Working directory**: Always from repository root
- **Monorepo tool**: Nx commands via `pnpm nx`

### Platform Detection
- **🔴 Admin Portal** (apps/admin/): Next.js 15, Material-UI, API routes
- **🟢 Documentation Sites** (standards/*/): Docusaurus, Infima CSS, static only
- **📦 Shared Packages** (packages/*): Used by both platforms

### Critical Rules
- **System-design-docs are SOURCE OF TRUTH** - Specs override implementation
- **Prefer editing** existing files over creating new ones
- **Never create** documentation files unless explicitly requested
- **Never commit** unless explicitly asked
- **Check Doc 20** for platform-specific patterns (admin vs docs)

---

## 🤖 Agent Delegation Strategy

Complex tasks should be delegated to specialized agents to preserve main context.

### Search & Analysis
**Triggers**: "find", "search", "where is", "which files"
→ **Agent**: Use search agent with `.claude/agents/search-agent-prompt.md`

### Test Writing
**Triggers**: "write test", "add test", "test for", "fix test"
→ **Agent**: Use test-writer with `.claude/agents/test-writer-prompt.md`

### API Development
**Triggers**: "API endpoint", "add route", "implement API", "withAuth"
→ **Agent**: Use api-builder with `.claude/agents/api-builder-prompt.md`

### UI Components
**Triggers**: "component", "UI", "MUI", "accessibility", "styling"
→ **Agent**: Use ui-developer with `.claude/agents/ui-developer-prompt.md`

### Database Operations
**Triggers**: "database", "query", "migration", "Supabase", "schema"
→ **Agent**: Use database agent with `.claude/agents/database-agent-prompt.md`

### Build & Dependencies
**Triggers**: "build", "nx", "dependencies", "affected", "monorepo"
→ **Agent**: Use build agent with `.claude/agents/build-agent-prompt.md`

### Research & Documentation
**Triggers**: "research", "best practices", "latest", "compare", "alternatives"
→ **Agent**: Use research agent with `.claude/agents/research-agent-prompt.md`

### Advanced UI & Animations
**Triggers**: "animation", "interactive", "particles", "3D", "effects"
→ **Agent**: Use advanced-ui agent with `.claude/agents/advanced-ui-agent-prompt.md`

### File Operations
**Triggers**: "batch", "rename files", "move files", "process multiple", "directory"
→ **Agent**: Use file-operations agent with `.claude/agents/file-operations-agent-prompt.md`

### Documentation Reading
**Triggers**: "what does the spec say", "according to docs"
→ **Agent**: Load specific system-design-docs in agent context

---

## 🎯 Quick Command Reference

### Development
```bash
# Admin portal
pnpm nx dev admin --turbopack         # Start dev server
pnpm nx build admin                   # Build
pnpm nx test admin                    # Test

# Documentation sites
pnpm nx start {site}                  # Start dev (e.g., isbd, portal)
pnpm nx build {site}                  # Build site

# Testing (ALWAYS use affected)
pnpm nx affected -t test --parallel=3 # Test changed code
pnpm typecheck                        # Type checking
pnpm lint                             # Linting
```

---

## ⚡ Key Patterns

### Admin Portal (Next.js)
- **Location**: `apps/admin/`
- **API Routes**: `apps/admin/src/app/api/`
- **Styling**: Material-UI theme (NO Tailwind)
- **Auth**: Clerk + custom RBAC

### Documentation Sites (Docusaurus)
- **Location**: `standards/{site}/`
- **Components**: `packages/theme/src/components/`
- **Styling**: Infima + SASS/SCSS
- **No API routes** - static generation only

---

## 📋 Main Context Responsibilities

Keep the main conversation focused on:
1. **Understanding** requirements
2. **Planning** approach  
3. **Coordinating** agent tasks
4. **Reviewing** results
5. **Running** commands
6. **Simple edits** (single file)

Delegate everything else to agents to preserve context.

---

## 🚨 Common Mistakes to Avoid

1. **Loading many files** → Use search agent instead
2. **Reading all docs** → Load in agent context
3. **Wrong platform patterns** → Check platform detection
4. **Using npm/yarn** → Only use pnpm
5. **Running all tests** → Use `pnpm nx affected`

---

## 📚 Key Documentation

When agents need documentation, they should load:
- Platform differences: `system-design-docs/20-platform-specific-architecture-guide.md`
- API patterns: `system-design-docs/05-api-architecture.md`
- RBAC: `system-design-docs/12-rbac-authorization-model.md`
- Testing: `developer_notes/AI_TESTING_INSTRUCTIONS.md`
- UI/UX: `developer_notes/ui-ux-accessibility-best-practices.md`

---

## 💡 Agent Workflow Example

```
You: "Find all API routes using withAuth and add error handling"

Main Context:
1. Understand requirement ✓
2. Delegate to search agent → Returns 5 files
3. Delegate to API agent → Updates error handling
4. Review changes ✓
5. Run tests ✓

Result: Task completed with minimal context usage
```

---

*This configuration optimizes for long conversations by delegating complex work to agents*