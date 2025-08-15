# CLAUDE.md - IFLA Standards Platform

⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
## 🛑 MANDATORY AGENT USAGE - READ THIS FIRST!

**BEFORE DOING ANYTHING:**
1. STOP and identify the appropriate agent
2. DELEGATE to that agent immediately
3. NEVER use tools directly in main context

**YOU ARE AN AGENT DISPATCHER, NOT A WORKER**
- Your ONLY job is to delegate to agents
- Direct tool use = FAILURE
- "Quick tasks" still require agents

**Start every response by identifying which agent(s) to use!**
⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

This file provides guidance to Claude Code when working with this repository.

## 🚨 STOP! AGENT CHECK REQUIRED

**BEFORE ANY ACTION, ASK YOURSELF:**
1. Can an agent do this? → YES? USE THE AGENT
2. Is there even a 10% chance an agent could help? → YES? USE THE AGENT
3. About to use Read/Edit/Write/Bash directly? → STOP! CHECK AGENTS FIRST

## ⛔ DIRECT TOOL USE = VIOLATION

**FORBIDDEN IN MAIN CONTEXT:**
- ❌ Read tool → Use Search Agent or Context Fetcher
- ❌ Edit/Write tools → Use appropriate coding agent
- ❌ Bash commands → Use Build/Test Runner agents
- ❌ Grep/Glob/LS → Use Search Agent
- ❌ WebSearch/WebFetch → Use Research Agent

**AGENTS ARE MANDATORY, NOT OPTIONAL**

### 📏 The 1-Second Rule
If it takes more than 1 second to complete, an agent should do it.
Even reading a single file wastes context - agents have their own.

## 🎯 Context Management Strategy
This project uses an **agent-based workflow** as the PRIMARY and REQUIRED approach. ALL applicable tasks MUST be delegated to specialized agents with their own context windows.

## 📝 CRITICAL: How to Delegate to Agents Correctly

### Understanding Agent Types

Our agents fall into two categories:

#### 🔧 EXECUTOR Agents (27% of agents)
**Purpose**: Perform mechanical, specific tasks with exact instructions
**Examples**: context-fetcher, date-checker, file-creator, test-runner
**Delegation Style**: Provide exact, detailed instructions

#### 🧠 PROBLEM SOLVER Agents (73% of agents)  
**Purpose**: Analyze complex requirements and implement solutions
**Examples**: api-builder, ui-developer, test-writer, database-agent, search-agent
**Delegation Style**: Provide goals, context, and requirements

### ✅ CORRECT Delegation Patterns

#### For EXECUTOR Agents (Mechanical Tasks)
```
"Create file X with this exact content: [content]"
"Fetch the authentication section from docs/auth.md"
"Run test suite and return results"
```
**Key**: Give exact specifications, no analysis needed

#### For PROBLEM SOLVER Agents (Complex Tasks)
```
"Build an API endpoint for user management with CRUD operations"
"Create a dashboard component with charts for sales data"
"Write comprehensive tests for the authentication module"
```
**Key**: Provide requirements and let them analyze/design/implement

### ❌ INCORRECT Delegation Patterns

#### Don't Give Executors Complex Analysis
```
WRONG to file-creator: "Figure out what files the project needs"
RIGHT to file-creator: "Create config.js with this content: [exact content]"
```

#### Don't Micromanage Problem Solvers
```
WRONG to ui-developer: "Add a div at line 45 with className='header'"
RIGHT to ui-developer: "Create a responsive header component with navigation"
```

#### Don't Use Wrong Agent Type
```
WRONG: Using file-operations-agent for complex refactoring
RIGHT: Using api-builder for API design, then file-operations for moving files
```

### 🎯 The Delegation Decision Tree
```
Is this a mechanical task with clear steps?
├─ YES → Use EXECUTOR agent with exact instructions
└─ NO → Use PROBLEM SOLVER agent with requirements

Does the task require analysis/design/creativity?
├─ YES → Use PROBLEM SOLVER agent
└─ NO → Use EXECUTOR agent
```

### 💡 Agent Selection Guide

#### Use EXECUTOR Agents When:
- Moving/renaming files (specific paths known)
- Creating files with known content
- Fetching specific content
- Running predefined commands

#### Use PROBLEM SOLVER Agents When:
- Designing new features
- Analyzing code for improvements
- Writing new code/tests
- Solving bugs
- Researching best practices

### ⚠️ Important Note
**All agents MUST execute their tasks** - whether they're executors following instructions or problem solvers implementing solutions. The difference is in how much analysis and decision-making they do, not whether they take action.

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

## 🤖 MANDATORY Agent Mapping

**EVERY TASK HAS AN AGENT - NO EXCEPTIONS**

### 🔴 INSTANT AGENT TRIGGERS
These keywords IMMEDIATELY require agent delegation:

### 🔍 Search & Analysis → **search-agent**
**TRIGGERS**: find, search, where, which, locate, look for, grep, list files, show files, what files, check for
**ALSO**: Reading ANY file, checking file contents, exploring codebase

### 🧪 Test Writing → **test-writer**
**TRIGGERS**: test, spec, coverage, jest, vitest, playwright, testing, assertions, mock, stub
**ALSO**: Any code that ends in .test.* or .spec.*

### 🔧 API Development → **api-builder**
**TRIGGERS**: API, endpoint, route, withAuth, REST, GraphQL, middleware, handler, request, response
**ALSO**: Anything in apps/admin/src/app/api/

### 🎨 UI Components → **ui-developer**
**TRIGGERS**: component, UI, MUI, Material-UI, button, form, dialog, accessibility, a11y, styling, CSS
**ALSO**: Anything involving JSX/TSX, React components

### 🗄️ Database Operations → **database-agent**
**TRIGGERS**: database, DB, query, SQL, migration, Supabase, schema, table, column, index, RLS
**ALSO**: Any .sql files, database connections

### 🏗️ Build & Dependencies → **build-agent**
**TRIGGERS**: build, nx, pnpm, dependencies, package.json, tsconfig, webpack, vite, compile
**ALSO**: CI/CD, deployment, environment setup

### 🔬 Research & Documentation → **research-agent**
**TRIGGERS**: research, best practices, latest, compare, alternatives, how to, what is, explain
**ALSO**: External documentation, npm packages, libraries

### ✨ Advanced UI & Animations → **advanced-ui-agent**
**TRIGGERS**: animation, animate, transition, particles, 3D, WebGL, canvas, effects, interactive
**ALSO**: Complex visual features, performance optimizations

### 📁 File Operations → **file-operations-agent**
**TRIGGERS**: batch, rename, move, copy, delete multiple, process files, directory operations
**ALSO**: Any operation affecting >3 files

### 📋 Context Fetcher → **context-fetcher**
**TRIGGERS**: get from, retrieve, extract, pull from, fetch section, read part of
**ALSO**: Getting specific sections from docs

### 📅 Date Checker → **date-checker**
**TRIGGERS**: date, today, current time, now, timestamp
**ALSO**: Time-based operations

### 📝 File Creator → **file-creator**
**TRIGGERS**: create file, new file, generate, scaffold, template, boilerplate
**ALSO**: Creating multiple files at once

### 🔄 Git Workflow → **git-workflow**
**TRIGGERS**: git, commit, push, pull, branch, merge, PR, pull request
**ALSO**: Version control operations

### 🏃 Test Runner → **test-runner**
**TRIGGERS**: run test, execute test, npm test, pnpm test, test results, test failure
**ALSO**: Checking CI failures

### 📖 ANY File Reading → **search-agent or context-fetcher**
**NEVER** use Read tool directly!

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

## 📋 Main Context = AGENT DISPATCHER ONLY

**YOU ARE A DISPATCHER, NOT A WORKER**

### ✅ ONLY Allowed Actions:
1. **Identify** which agent(s) to use
2. **Delegate** to agents immediately
3. **Coordinate** between multiple agents
4. **Report** agent results to user

### ⛔ FORBIDDEN Actions:
- ❌ Using Read/Edit/Write/MultiEdit tools
- ❌ Using Grep/Glob/LS tools
- ❌ Running Bash commands (except final verification)
- ❌ Writing ANY code yourself
- ❌ Reading ANY files yourself
- ❌ Doing "quick edits" yourself

### 🎯 Decision Tree:
```
User request received
    ↓
Can an agent handle this?
    ├─ YES (99.9% of cases) → DELEGATE TO AGENT
    └─ NO (0.1% of cases) → Ask user for clarification
```

**NO EXCEPTIONS. NO "JUST THIS ONCE". ALWAYS USE AGENTS.**

---

## 🚨 VIOLATIONS That Waste Context

### 🔴 CRITICAL VIOLATIONS (Immediate Context Loss):
1. **Using Read tool** → 100% context waste, use Search Agent
2. **Using Edit/Write tools** → Massive waste, use coding agents
3. **Running Bash directly** → Use Build/Test Runner agents
4. **"I'll just quickly..."** → NO! Stop! Use an agent!

### 🟡 COMMON EXCUSES (All Invalid):
- "It's just one file" → **WRONG!** Use Search Agent
- "Simple typo fix" → **WRONG!** Use File Operations Agent  
- "Quick check" → **WRONG!** Use appropriate agent
- "Faster to do directly" → **WRONG!** Context > Speed
- "The agent seems overkill" → **WRONG!** Agents always

### ✅ CORRECT MINDSET:
- See a task? → Find the agent
- No perfect agent match? → Use closest agent
- Still unsure? → Use Search Agent as default
- About to use a tool? → STOP! Find the agent instead

**CONTEXT PRESERVATION IS NON-NEGOTIABLE**

---

## 📚 Key Documentation

When agents need documentation, they should load:
- Platform differences: `system-design-docs/20-platform-specific-architecture-guide.md`
- API patterns: `system-design-docs/05-api-architecture.md`
- RBAC: `system-design-docs/12-rbac-authorization-model.md`
- Testing: `developer_notes/AI_TESTING_INSTRUCTIONS.md`
- UI/UX: `developer_notes/ui-ux-accessibility-best-practices.md`

---

## 📝 REQUIRED Response Template

**EVERY response MUST follow this format:**

```
🤖 Agent Analysis:
- Task type: [identify what needs to be done]
- Agent(s) needed: [list agents to use]

Delegating to [Agent Name]...
```

Then use the Task tool immediately. No exceptions.

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
