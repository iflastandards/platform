# CLAUDE.md - IFLA Standards Platform

This file provides guidance to Claude Code when working with this repository.

## 🚨 CRITICAL: ALWAYS USE AGENTS FIRST

**AGENTS ARE REQUIRED, NOT OPTIONAL**

Before doing ANY task, check if an agent exists for it. Agent delegation is the TOP PRIORITY to preserve context.

### 📢 Agent Announcement Protocol
Always announce which agent you're using:
- 🔍 "Using Search Agent to find..."
- 🧪 "Delegating to Test Writer to..."  
- 🔧 "API Builder Agent will handle..."
- 🎨 "UI Developer Agent will create..."

### ⚠️ Direct Tool Use = Context Waste
- Reading multiple files? → Use Search Agent
- Writing code? → Use appropriate specialized agent
- Research needed? → Use Research Agent
- Simple edit? → Still check for relevant agent first

## 🎯 Context Management Strategy
This project uses an **agent-based workflow** as the PRIMARY and REQUIRED approach. ALL applicable tasks MUST be delegated to specialized agents with their own context windows.

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
- **DELEGATE TO AGENTS FOR ALL APPLICABLE TASKS** - Agent usage is mandatory
- **System-design-docs are SOURCE OF TRUTH** - Specs override implementation
- **Prefer editing** existing files over creating new ones
- **Never create** documentation files unless explicitly requested
- **Never commit** unless explicitly asked
- **Check Doc 20** for platform-specific patterns (admin vs docs)

### Script Documentation Requirements
- **ALWAYS update documentation** when modifying any script
- **Include documentation reference** in every script (e.g., `Documentation: developer_notes/script-name.md`)
- **Implement --man option** to display documentation location
- **Document ALL options** including new ones added during modifications

---

## 🤖 Agent Delegation Strategy

**ALL APPLICABLE TASKS MUST BE DELEGATED TO AGENTS**

This is not a suggestion - it's a requirement. Even simple tasks should use agents if they match the triggers below. The main context should primarily coordinate agents, not perform direct work.

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

### Context Fetcher
**Triggers**: "get from [file]", "retrieve section", "extract from spec"
→ **Agent**: Use context-fetcher with `.claude/agents/context-fetcher.md`

### Date Checker
**Triggers**: "current date", "today's date", "what's the date"
→ **Agent**: Use date-checker with `.claude/agents/date-checker.md`

### File Creator
**Triggers**: "create spec file", "generate template", "batch create"
→ **Agent**: Use file-creator with `.claude/agents/file-creator.md`

### Git Workflow
**Triggers**: "commit", "create PR", "git workflow", "push changes"
→ **Agent**: Use git-workflow with `.claude/agents/git-workflow.md`

### Test Runner
**Triggers**: "run tests", "execute tests", "check test failures"
→ **Agent**: Use test-runner with `.claude/agents/test-runner.md`

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

**PRIMARY ROLE: AGENT COORDINATOR**

The main context should ONLY handle:
1. **Understanding** requirements and identifying which agent to use
2. **Announcing** which agent is being delegated to
3. **Coordinating** multiple agent interactions
4. **Running** final commands after agent work is complete
5. **Reviewing** agent results and providing feedback

**STRICTLY AVOID IN MAIN CONTEXT:**
- Direct file reading (use Search Agent)
- Code writing (use specialized agents)
- Research tasks (use Research Agent)
- Multi-file operations (use appropriate agents)
- Even "simple" edits if an agent exists for the task type

**Remember**: Context preservation through agent delegation is more important than speed.

---

## 🚨 Common Mistakes to Avoid

1. **Using tools directly instead of agents** → ALWAYS check for applicable agent first
2. **Loading any files in main context** → Use Search Agent for ALL file operations
3. **Writing code in main context** → Delegate to specialized coding agents
4. **Doing research directly** → Use Research Agent
5. **Reading documentation directly** → Load in agent context
6. **"Just a quick edit"** → Still use agents to preserve context
7. **Wrong platform patterns** → Check platform detection
8. **Using npm/yarn** → Only use pnpm
9. **Running all tests** → Use `pnpm nx affected`

**GOLDEN RULE**: When in doubt, use an agent. Context preservation is paramount.

---

## 📚 Key Documentation

When agents need documentation, they should load:
- Platform differences: `system-design-docs/20-platform-specific-architecture-guide.md`
- API patterns: `system-design-docs/05-api-architecture.md`
- RBAC: `system-design-docs/12-rbac-authorization-model.md`
- Testing: `developer_notes/AI_TESTING_INSTRUCTIONS.md`
- UI/UX: `developer_notes/ui-ux-accessibility-best-practices.md`

---

## 💡 Agent Workflow Examples

### Example 1: API Task
```
You: "Find all API routes using withAuth and add error handling"

Main Context Response:
🔍 "Using Search Agent to find API routes with withAuth..."
🔧 "Delegating to API Builder Agent to add error handling..."
✅ "Running tests to verify changes..."

Result: Task completed with preserved context
```

### Example 2: UI Task  
```
You: "Create a new dashboard component with charts"

Main Context Response:
🎨 "Using UI Developer Agent to create dashboard component..."
📊 "Advanced UI Agent will handle chart implementations..."
🧪 "Test Writer Agent will add component tests..."

Result: Full feature implemented via agent coordination
```

### Example 3: Even "Simple" Tasks
```
You: "Fix a typo in the API documentation"

WRONG Approach:
❌ Read file directly and make edit

CORRECT Approach:
🔍 "Using Search Agent to locate the documentation file..."
📝 "File Operations Agent will handle the correction..."

Result: Context preserved for more complex work later
```

---

## 🎯 Agent-First Mindset

**Think: "Which agent handles this?" NOT "How do I do this directly?"**

This approach ensures:
- ✅ Maximum context preservation
- ✅ Consistent patterns across tasks  
- ✅ Ability to handle complex multi-step projects
- ✅ Clear audit trail of what was done

---

*This configuration prioritizes agent delegation above all else to maximize conversation longevity*