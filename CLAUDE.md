# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## 🎯 CONTEXT DETECTION - START HERE

### What am I working on?
**ASK MYSELF FIRST**: Which part of the monorepo?
1. **🔴 Admin app** (apps/admin) → Next.js, MUI, Tailwind → See [Platform Guide](system-design-docs/20-platform-specific-architecture-guide.md)
2. **🟢 Documentation sites** (standards/*) → Docusaurus, Infima, SASS → See [Platform Guide](system-design-docs/20-platform-specific-architecture-guide.md)
3. **📦 Shared packages** (packages/*) → Used by both platforms
4. **📚 System Design** (@system-design-docs/) → **AUTHORITATIVE SPECS - ALWAYS READ FIRST!**

**⚠️ CRITICAL RULE**: System-design-docs are the SOURCE OF TRUTH:
- **BEFORE ANY TASK**: Check @system-design-docs/README.md "Task-Based Navigation"
- **Specs override implementation**: If code doesn't match spec, FIX THE CODE
- **Platform differences**: ALWAYS check Doc 20 for admin vs docs distinctions

---

## 🚨 CRITICAL RULES - ALWAYS APPLY

### 📋 Pre-Task Checklist (MANDATORY)
1. **📚 Read relevant spec** in @system-design-docs/ BEFORE implementing
2. **🤖 Check MCP Decision Tree** below for tool selection
3. **📍 Verify working directory** is root (all commands from root)
4. **🎯 Identify platform** (admin or docs) and apply correct patterns
5. **📝 Check package.json scripts** before writing bash commands
6. **🧪 Use `pnpm nx affected`** for tests, not full runs
7. **🔒 NO undocumented `any`** or `require` in TypeScript

### 🔧 Core Technical Rules
- **Package manager**: `pnpm` only (never npm/yarn)
- **Monorepo tool**: Nx commands via `pnpm nx`
- **Admin routing**: Standard Next.js patterns
- **Docs routing**: Standard Docusaurus patterns
- **API calls**: Standard `fetch('/api/route')`
- **Authentication**: Clerk (admin only)
- **Authorization**: Custom RBAC via publicMetadata

---

## 🤖 MCP SERVER DECISION TREE (MANDATORY)

```
START: What type of task?
│
├─> 🔍 SEARCHING CODEBASE?
│   └─> USE JetBrains MCP FIRST (file search, content search, structure)
│
├─> 📚 USING EXTERNAL LIBRARY?
│   ├─> React/Next.js/TypeScript → USE Context7
│   ├─> Material-UI → USE MUI MCP
│   └─> Other libraries → USE Context7
│
├─> 🎨 BUILDING UI?
│   ├─> MUI component → USE MUI MCP (required)
│   └─> React patterns → USE Context7
│
├─> 🧩 COMPLEX PROBLEM?
│   └─> USE Sequential Thinking + JetBrains
│
└─> ✏️ SIMPLE EDIT? → Use native tools
```

**Priority**: JetBrains for search > Context7/MUI for patterns > Native tools as fallback

---

## 📚 DOCUMENTATION NAVIGATION

### Platform-Specific References
- **Admin vs Docs differences**: @system-design-docs/20-platform-specific-architecture-guide.md
- **Task-based navigation**: @system-design-docs/README.md#task-based-navigation

### By Feature Area
| Task | Primary Docs | Secondary Refs |
|------|--------------|----------------|
| **API Development** | Docs 5, 20 (admin) | @developer_notes/NEXTJS_CODING_STANDARDS.MD |
| **UI Components** | Docs 11, 20 | Platform-specific sections |
| **Testing** | Doc 6 | @developer_notes/AI_TESTING_INSTRUCTIONS.md |
| **RBAC/Auth** | Docs 12-14 | RBAC-IMPLEMENTATION-TASKS.md |
| **Import/Export** | Doc 33 | tools/sheet-sync/ |
| **Deployment** | Docs 3, 10 | .github/workflows/ |

### Critical Developer Notes
- **AI Testing**: @developer_notes/AI_TESTING_INSTRUCTIONS.md (MANDATORY before writing tests)
- **Test Placement**: @developer_notes/TEST_PLACEMENT_GUIDE.md
- **Test Templates**: @developer_notes/TEST_TEMPLATES.md
- **Accessibility**: @developer_notes/ui-ux-accessibility-best-practices.md

---

## 🎯 QUICK COMMAND REFERENCE

### Development
```bash
# Admin portal
pnpm nx dev admin --turbopack         # Start dev server
pnpm nx build admin                   # Build
pnpm nx test admin                    # Test

# Documentation sites
pnpm nx start {site}                  # Start dev (e.g., isbd, portal)
pnpm nx build {site}                  # Build site
pnpm build:all                        # Build all sites

# Testing (ALWAYS use affected)
pnpm test                             # Runs nx affected
pnpm nx affected -t test --parallel=3 # Manual affected
pnpm typecheck                        # Type checking
pnpm lint                             # Linting

# Utilities
pnpm fresh                            # Clean install
pnpm health                           # System check
pnpm nx:optimize                      # Performance optimization
```

---

## ⚡ PLATFORM QUICK REFERENCE

### Admin Portal (Next.js)
- **Location**: `apps/admin/`
- **Components**: `apps/admin/src/components/`
- **API Routes**: `apps/admin/src/app/api/`
- **Tests**: `apps/admin/src/test*/`, `apps/admin/e2e/`
- **Styling**: Tailwind CSS + Material-UI
- **Auth**: Clerk required

### Documentation Sites (Docusaurus)
- **Location**: `standards/{site}/`
- **Components**: `packages/theme/src/components/` (shared globally)
- **Tests**: `packages/theme/src/tests/`
- **Styling**: Infima + SASS/SCSS
- **Content**: MDX files in `docs/`
- **No API routes** - static generation only

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Not checking specs first** → ALWAYS read system-design-docs
2. **Using wrong platform patterns** → Check Doc 20 for distinctions
3. **Not using MCP servers** → Follow decision tree above
4. **Running all tests** → Use `pnpm nx affected`
5. **Working from subdirectory** → Always work from root
6. **Using npm/yarn** → Only use pnpm
7. **Implementing != spec** → Specs are correct, fix implementation

---

## 🔗 INTEGRATION NOTES

### MCP Servers Available
- **JetBrains**: Codebase intelligence and search
- **Context7**: Library documentation and patterns
- **MUI**: Material-UI components and examples
- **Sequential**: Complex problem analysis
- **Playwright**: Browser automation (E2E tests)

### GitHub Services
- **Mock GitHub**: @kie/mock-github for testing
- **Octokit**: GitHub API SDK
- **GitHub MCP**: Direct API access

### External Services
- **Clerk**: Authentication (admin only)
- **Supabase**: Operational data
- **Google Sheets**: Bulk editing
- **GitHub**: Version control & teams

---

## 📋 TROUBLESHOOTING

For detailed troubleshooting, see:
- Platform issues → @system-design-docs/20-platform-specific-architecture-guide.md#common-pitfalls
- Test failures → @developer_notes/TESTING_STRATEGY.md#troubleshooting
- Build issues → Check `pnpm health` and `pnpm nx:optimize`
- Port conflicts → `pnpm ports:kill`

---

## 💡 HELPFUL PROMPTS

To help me work better:
- **"Working on admin:"** → Activates admin-specific context
- **"Working on docs:"** → Activates documentation context
- **"Need to implement [feature]"** → I'll check specs first
- **"Debug [issue]"** → I'll use Sequential + JetBrains MCP

---

## IMPORTANT REMINDERS

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER proactively create documentation unless requested
- ALWAYS check system-design-docs before implementing

---

<!-- 
For comprehensive details on any topic, refer to:
- System architecture → @system-design-docs/
- Developer guides → @developer_notes/
- Test documentation → @developer_notes/AI_TESTING_INSTRUCTIONS.md
- UI/UX standards → @developer_notes/ui-ux-accessibility-best-practices.md

This file intentionally kept concise. Full specifications are maintained in system-design-docs.
-->
