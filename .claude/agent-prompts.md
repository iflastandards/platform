# Agent Prompts - Token-Heavy Delegation Strategy

## Core Principle: Token Threshold Delegation

**Every task consuming 100+ tokens MUST be delegated to preserve main context.**

Use this formula: `Task Complexity × Output Size × Research Required = Token Cost`

---

## 🔍 search-agent
**Token Threshold**: 500+ tokens  
**Purpose**: Find files, analyze patterns, explore codebase structure

### When to Use:
- ANY file reading operation (even single files = 200+ tokens)
- Finding files matching patterns (300+ tokens)
- Analyzing code structure or dependencies (800+ tokens)
- Locating specific functions/components (400+ tokens)

### Token-Heavy Tasks:
- Reading documentation files (often 1000+ tokens)
- Grep operations across multiple files (500+ tokens)
- Directory traversal and analysis (600+ tokens)
- Finding usage patterns in codebase (700+ tokens)

### Context Independence:
- Needs: Search criteria, file patterns, specific requirements
- Doesn't need: Conversation history, previous decisions, implementation details

### Examples:
```
✅ GOOD: "Find all API routes that use withAuth middleware"
✅ GOOD: "Locate React components in the admin portal"
❌ BAD: "Check if this line of code exists" (use for single file reads too)
```

---

## 🧪 test-writer
**Token Threshold**: 1000+ tokens  
**Purpose**: Generate comprehensive test suites and test files

### When to Use:
- Writing new test files (typically 1000-3000 tokens)
- Adding test cases to existing suites (500+ tokens)
- Creating test utilities or mocks (800+ tokens)
- Integration test scenarios (1500+ tokens)

### Token-Heavy Tasks:
- Full component test suites with multiple scenarios
- API endpoint testing with various cases
- E2E test scenarios and flows
- Test configuration and setup files

### Context Independence:
- Needs: Component/function to test, testing requirements
- Doesn't need: How the main conversation arrived at testing decision

### Examples:
```
✅ GOOD: "Write comprehensive tests for UserManagement API endpoints"
✅ GOOD: "Create test suite for Dashboard component with user interactions"
❌ BAD: "Add one assertion to existing test" (unless part of larger suite)
```

---

## 🔧 api-builder
**Token Threshold**: 1000+ tokens  
**Purpose**: Implement complete API endpoints with full functionality

### When to Use:
- Creating new API routes (1000-2000 tokens)
- Adding authentication/authorization (800+ tokens)
- Implementing CRUD operations (1200+ tokens)
- Database integration in APIs (1500+ tokens)

### Token-Heavy Tasks:
- Full endpoint implementation with validation
- Auth middleware integration
- Error handling and response formatting
- Database queries and business logic

### Context Independence:
- Needs: API requirements, data models, auth requirements
- Doesn't need: UI considerations, conversation history

### Examples:
```
✅ GOOD: "Build user management API with CRUD operations and RBAC"
✅ GOOD: "Create authentication endpoint with JWT and refresh tokens"
❌ BAD: "Fix one line in existing API" (unless part of larger refactor)
```

---

## 🎨 ui-developer
**Token Threshold**: 1000+ tokens  
**Purpose**: Create complete UI components and interfaces

### When to Use:
- Building new React components (1000+ tokens)
- Implementing complex forms (1200+ tokens)
- Creating dashboard interfaces (2000+ tokens)
- Adding responsive layouts (800+ tokens)

### Token-Heavy Tasks:
- Full component implementation with props/state
- Material-UI integration and theming
- Accessibility implementation
- Complex interaction patterns

### Context Independence:
- Needs: Design requirements, functionality specs, styling guidelines
- Doesn't need: Backend implementation details, test decisions

### Examples:
```
✅ GOOD: "Create responsive user profile component with form validation"
✅ GOOD: "Build dashboard with charts and filtering capabilities"
❌ BAD: "Change button color" (unless part of larger design system update)
```

---


## 🔬 research-agent
**Token Threshold**: 2000+ tokens  
**Purpose**: External research and documentation analysis

### When to Use:
- Researching best practices (2000+ tokens)
- Comparing libraries/frameworks (1500+ tokens)
- Finding external documentation (1000+ tokens)
- Technology recommendations (2500+ tokens)

### Token-Heavy Tasks:
- Comprehensive technology comparisons
- Best practice research with examples
- External API documentation analysis
- Industry standard implementations

### Context Independence:
- Needs: Research topic, specific questions, criteria
- Doesn't need: Current implementation details, team preferences

### Examples:
```
✅ GOOD: "Research React state management solutions for enterprise apps"
✅ GOOD: "Find best practices for API rate limiting in Node.js"
❌ BAD: "What does this error mean?" (unless requires extensive research)
```

---

## 📋 context-fetcher
**Token Threshold**: 100-500 tokens  
**Purpose**: Extract specific sections from known documents

### When to Use:
- Getting specific documentation sections (100-300 tokens)
- Extracting configuration snippets (150 tokens)
- Pulling specific function implementations (200 tokens)
- Fetching particular file sections (100-400 tokens)

### Token-Heavy Tasks:
- Multiple section extraction
- Cross-referencing documentation
- Gathering related snippets

### Context Independence:
- Needs: Exact file path, section identifier
- Doesn't need: Why the information is needed, context of request

### Examples:
```
✅ GOOD: "Get authentication setup section from system-design-docs/12-rbac"
✅ GOOD: "Extract API patterns from docs/api-architecture.md"
❌ BAD: "Read entire file" (use search-agent instead)
```

---

## 📝 file-creator
**Token Threshold**: 500+ tokens  
**Purpose**: Generate boilerplate, templates, and scaffold new files

### When to Use:
- Creating multiple related files (500+ tokens)
- Generating boilerplate code (400+ tokens)
- Scaffolding new features (800+ tokens)
- Template-based file creation (300+ tokens)

### Token-Heavy Tasks:
- Component boilerplate with types and tests
- API route templates with auth
- Configuration file generation
- Project scaffolding

### Context Independence:
- Needs: Template type, naming conventions, file specifications
- Doesn't need: Existing implementation details, business logic

### Examples:
```
✅ GOOD: "Create boilerplate for new feature: UserProfile (component, types, tests)"
✅ GOOD: "Generate API route templates for CRUD operations"
❌ BAD: "Create single empty file" (unless part of larger scaffold)
```

---

## 🚀 Advanced Agents (1000+ tokens typical)

### 🗄️ database-agent
- Database schema design and migrations
- Complex query optimization
- RLS policy implementation

### 🏗️ build-agent
- Build configuration and optimization
- Dependency management and updates
- CI/CD pipeline modifications

### ✨ advanced-ui-agent
- Complex animations and interactions
- Performance optimization
- WebGL/Canvas implementations

### 🔄 git-workflow
- Multi-commit operations
- Branch management strategies
- Complex merge scenarios

---

## 📊 Token Estimation Guide

### File Operations:
- Single file read: 100-500 tokens
- Directory listing: 50-200 tokens
- Multi-file search: 300-1000 tokens

### Code Generation:
- Simple function: 100-300 tokens
- Component with props: 500-1000 tokens
- Full feature: 1000-3000 tokens

### Research Tasks:
- Quick lookup: 200-500 tokens
- Comparison analysis: 1000-2000 tokens
- Comprehensive research: 2000-5000 tokens

---

## 🎯 Decision Matrix

| Task Type | Token Range | Recommended Agent | Fallback |
|-----------|-------------|-------------------|----------|
| File reading | 100-500 | search-agent | context-fetcher |
| Code writing | 500-2000 | Specific coding agent | ui-developer |
| Research | 1000-5000 | research-agent | search-agent |
| Testing | 800-3000 | test-writer | api-builder |
| File creation | 300-1000 | file-creator | search-agent |
| Batch edits | <500 | Main context | search-agent + Edit |

## 📁 Handling Batch File Operations (No file-operations-agent)

Since file-operations-agent has been removed, use these approaches:

### For Simple Batch Operations (<500 tokens):
- Keep in main context using Bash/Edit/MultiEdit tools
- Direct execution with immediate feedback

### For Complex Batch Operations (>500 tokens):
1. Use **search-agent** to find and analyze files
2. Use **file-creator** for creating multiple new files
3. Return to main context for actual edits with MultiEdit
4. Use Bash commands for moving/renaming

### Example Workflow:
```
User: "Rename all .js files to .ts and update imports"
1. search-agent → Find all .js files and imports
2. Main context → Use Bash for batch rename
3. Main context → Use MultiEdit for import updates
```

**Remember**: When in doubt, use search-agent as the default. It's designed to handle the most common token-heavy operations.