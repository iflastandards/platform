# MCP Server Integration for Agents

This document explains how specialized agents leverage MCP servers for enhanced capabilities in the IFLA Standards Platform monorepo.

## Available MCP Servers

1. **JetBrains MCP** - Codebase intelligence and file operations
2. **Context7 MCP** - Official library documentation  
3. **Sequential Thinking MCP** - Complex multi-step analysis
4. **Playwright MCP** - Browser automation and E2E testing
5. **MUI MCP** - Material-UI component documentation
6. **NX MCP** - Monorepo operations and project management
7. **Supabase MCP** - Database operations and migrations
8. **Perplexity MCP** - Current web research and information
9. **Magic UI Design MCP** - Modern UI components and animations
10. **Filesystem MCP** - Advanced file operations and batch processing
11. **Puppeteer Real Browser MCP** - Real browser automation
12. **WebSearch/WebFetch** - Web content retrieval

## Agent-Specific MCP Usage

### 1. Search Agent
**Primary MCP**: JetBrains, Sequential Thinking
```python
# File and content search
mcp__jetbrains__find_files_by_name_substring("withAuth")
mcp__jetbrains__search_in_files_content("canPerformAction")
mcp__jetbrains__list_directory_tree_in_folder("apps/admin")

# Complex multi-step analysis
mcp__sequential-thinking__sequentialthinking({
  thought: "Finding all auth patterns across codebase",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 3
})

# Get file contents when needed
mcp__jetbrains__get_file_text_by_path("apps/admin/src/lib/auth.ts")
```

### 2. Test Writer Agent
**Primary MCP**: Context7, Sequential Thinking, Playwright, JetBrains
```python
# Get testing best practices for libraries
mcp__Context7__resolve-library-id("vitest")
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/vitest/vitest",
  topic: "integration testing"
})

# Plan complex test scenarios
mcp__sequential-thinking__sequentialthinking({
  thought: "Analyzing VocabularyForm component to identify test cases",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 4
})

# Find existing test patterns
mcp__jetbrains__find_files_by_name_substring("*.test.ts")
mcp__jetbrains__search_in_files_content("describe.*@integration")

# E2E testing with browser automation
mcp__playwright__browser_navigate("/admin/vocabularies")
mcp__playwright__browser_snapshot()
mcp__playwright__browser_click({
  element: "Add Vocabulary button",
  ref: "button[aria-label='Add Vocabulary']"
})
```

### 3. API Builder Agent
**Primary MCP**: Context7, JetBrains
```python
# Next.js API patterns from official docs
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router api routes"
})

# Find existing API patterns in codebase
mcp__jetbrains__search_in_files_content("export const GET")
mcp__jetbrains__find_files_by_name_substring("route.ts")

# Get React patterns for components
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "server components"
})
```

### 4. UI Developer Agent
**Primary MCP**: Context7, MUI, Magic UI Design, JetBrains
```python
# Get Material-UI documentation
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/mui/material-ui",
  topic: "Grid responsive layout",
  tokens: 5000
})

# Use MUI MCP for specific components
mcp__mui-mcp__useMuiDocs({
  urlList: ["https://llms.mui.com/material-ui/7.2.0/llms.txt"]
})

# Get React 19 patterns
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks server components"
})

# Find existing component patterns
mcp__jetbrains__find_files_by_name_substring("*.component.tsx")
```

### 5. Database Agent
**Primary MCP**: Supabase, Sequential Thinking, JetBrains
```python
# Database operations
mcp__supabase__list_tables({schemas: ["public", "auth"]})
mcp__supabase__execute_sql({
  query: "SELECT * FROM vocabularies WHERE status = 'published' LIMIT 10"
})

# Apply migrations safely
mcp__supabase__apply_migration({
  name: "add_vocabulary_indexes",
  query: "CREATE INDEX idx_vocabularies_status ON vocabularies(status);"
})

# Performance and security checks
mcp__supabase__get_advisors({type: "performance"})
mcp__supabase__get_advisors({type: "security"})

# Plan complex queries
mcp__sequential-thinking__sequentialthinking({
  thought: "Need to optimize join query for vocabularies with translations",
  nextThoughtNeeded: true
})

# Find migration files
mcp__jetbrains__find_files_by_name_substring("*.sql")
```

### 6. Build Agent
**Primary MCP**: NX, JetBrains, Sequential Thinking, Filesystem
```python
# Get workspace information
mcp__nx-mcp__nx_workspace()
mcp__nx-mcp__nx_project_details({projectName: "admin"})

# Check running tasks
mcp__nx-mcp__nx_current_running_tasks_details()
mcp__nx-mcp__nx_current_running_task_output({taskId: "admin:build"})

# Analyze CI/CD performance
mcp__nx-mcp__nx_cloud_pipeline_executions_search({
  branches: ["main", "preview"],
  statuses: ["FAILED"],
  limit: 10
})

# Find build configurations
mcp__jetbrains__find_files_by_name_substring("project.json")
mcp__jetbrains__search_in_files_content("\"build\":")

# Plan dependency analysis
mcp__sequential-thinking__sequentialthinking({
  thought: "Analyzing project graph for circular dependencies",
  nextThoughtNeeded: true
})

# Batch file operations for build artifacts
mcp__filesystem__list_directory_with_sizes({
  path: "dist",
  sortBy: "size"
})
```

### 7. Research Agent
**Primary MCP**: Perplexity, Context7, Sequential Thinking, WebSearch
```python
# Current information research
mcp__perplexity-ask__perplexity_ask({
  messages: [{
    role: "user", 
    content: "Latest Next.js 15 app router best practices 2024"
  }]
})

# Official library documentation
mcp__Context7__resolve-library-id("next")
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router middleware"
})

# Synthesize research findings
mcp__sequential-thinking__sequentialthinking({
  thought: "Comparing authentication strategies: Clerk vs Supabase Auth",
  nextThoughtNeeded: true,
  totalThoughts: 5
})

# Targeted web research
WebSearch({
  query: "Nx monorepo best practices 2024",
  allowed_domains: ["nx.dev", "nrwl.io"]
})
```

### 8. Advanced UI Agent
**Primary MCP**: Magic UI Design, MUI, Context7, Playwright
```python
# Get modern UI components and animations
mcp___magicuidesign_mcp__getAnimations()     # blur-fade, text animations
mcp___magicuidesign_mcp__getSpecialEffects() # particles, meteors, confetti
mcp___magicuidesign_mcp__getButtons()        # rainbow, shimmer, ripple
mcp___magicuidesign_mcp__getBackgrounds()    # animated grids, patterns

# Material-UI for admin portal
mcp__mui-mcp__useMuiDocs({
  urlList: ["https://llms.mui.com/material-ui/7.2.0/llms.txt"]
})

# React animation patterns
mcp__Context7__resolve-library-id("framer-motion")
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/framer/motion",
  topic: "gesture animations"
})

# Visual testing for interactions
mcp__playwright__browser_navigate("/components/demo")
mcp__playwright__browser_hover({
  element: "Interactive button",
  ref: "button.hover-effect"
})
```

### 9. File Operations Agent
**Primary MCP**: Filesystem, JetBrains, Sequential Thinking
```python
# Batch file operations
mcp__filesystem__read_multiple_files({
  paths: ["package.json", "apps/admin/package.json", "packages/theme/package.json"]
})

# Advanced file search with exclusions
mcp__filesystem__search_files({
  path: ".",
  pattern: "*.test.ts",
  excludePatterns: ["node_modules", "dist", "build"]
})

# Directory analysis
mcp__filesystem__list_directory_with_sizes({
  path: "apps/admin/src",
  sortBy: "size"
})

# Smart file discovery
mcp__jetbrains__find_files_by_name_substring("*.config.ts")

# Plan complex file operations
mcp__sequential-thinking__sequentialthinking({
  thought: "Need to rename Component across 50 files, update imports, fix tests",
  nextThoughtNeeded: true,
  totalThoughts: 4
})

# Media file handling
mcp__filesystem__read_media_file({path: "public/images/logo.png"})
```

### 10. Context Fetcher Agent
**Primary MCP**: None (uses native tools)
**Tools**: Read, Grep, Glob
- Efficiently retrieves documentation content
- Checks if information is already in context
- Uses grep for targeted section extraction
- No MCP servers - focuses on file reading optimization

### 11. Date Checker Agent  
**Primary MCP**: None (uses native tools)
**Tools**: Read, Grep, Glob
- Determines current date via file system timestamps
- Uses temporary file creation for date extraction
- No MCP servers - system-level date operations

### 12. File Creator Agent
**Primary MCP**: None (uses native tools)
**Tools**: Write, Bash, Read
- Creates files and directories with proper templates
- Handles Agent OS file structure conventions
- No MCP servers - focuses on file creation mechanics

### 13. Git Workflow Agent
**Primary MCP**: None (uses native tools)
**Tools**: Bash, Read, Grep
- Manages git operations, branches, and PR creation
- Handles Agent OS git conventions
- No MCP servers - uses git CLI directly

### 14. Test Runner Agent
**Primary MCP**: None (uses native tools)
**Tools**: Bash, Read, Grep, Glob
- Executes tests and analyzes failures
- Provides actionable failure information
- No MCP servers - focuses on test execution and parsing

## Benefits

1. **Specialized Tools**: Each agent uses the most appropriate MCP servers for their domain
2. **Better Results**: MCP servers provide intelligent capabilities beyond basic tools
3. **Efficiency**: JetBrains MCP is faster than grep/find for searching large codebases
4. **Current Documentation**: Context7 provides up-to-date library patterns and best practices
5. **Complex Logic**: Sequential Thinking helps with multi-step analysis and planning
6. **Real Automation**: Playwright and Puppeteer enable browser-based testing and interaction
7. **Database Intelligence**: Supabase MCP provides safe database operations and migrations
8. **Research Capabilities**: Perplexity MCP enables current web research and information gathering
9. **Modern UI**: Magic UI Design MCP provides access to modern component patterns
10. **Batch Operations**: Filesystem MCP enables efficient batch file processing
11. **Build Intelligence**: NX MCP provides monorepo analysis and optimization
12. **Context Preservation**: Agent delegation keeps main context clean and focused

## Agent Categories

### MCP-Powered Agents (9 agents)
These agents leverage MCP servers for advanced capabilities:
- **Search Agent**: JetBrains + Sequential Thinking
- **Test Writer Agent**: Context7 + Sequential + Playwright + JetBrains  
- **API Builder Agent**: Context7 + JetBrains
- **UI Developer Agent**: Context7 + MUI + Magic UI + JetBrains
- **Database Agent**: Supabase + Sequential + JetBrains
- **Build Agent**: NX + JetBrains + Sequential + Filesystem
- **Research Agent**: Perplexity + Context7 + Sequential + WebSearch
- **Advanced UI Agent**: Magic UI + MUI + Context7 + Playwright
- **File Operations Agent**: Filesystem + JetBrains + Sequential

### Native Tool Agents (5 agents)  
These agents use native tools for specialized workflows:
- **Context Fetcher Agent**: Optimized documentation retrieval
- **Date Checker Agent**: System-level date determination
- **File Creator Agent**: Template-based file creation
- **Git Workflow Agent**: Git operations and PR management
- **Test Runner Agent**: Test execution and failure analysis

## Usage Pattern

When an agent is spawned:
1. Agent loads its prompt from `.claude/agents/`
2. Agent identifies which MCP servers to use based on the task
3. Agent leverages MCP servers for specialized capabilities
4. Agent uses native tools as fallback when appropriate
5. Agent returns focused results to main context
6. Main context coordinates multiple agents as needed

## Example Workflow

```
You: "Find all API routes with auth middleware and add rate limiting"

Main Context:
1. Recognizes "find" trigger → spawns Search Agent
2. Search Agent uses JetBrains MCP to find API routes with withAuth
3. Search Agent returns structured list of 12 API routes
4. Main context recognizes "add rate limiting" → spawns API Builder Agent  
5. API Builder uses Context7 to get Next.js rate limiting patterns
6. API Builder implements rate limiting middleware
7. Main context spawns Test Writer to add rate limiting tests
8. Test Writer uses Context7 + Playwright for integration tests
9. All agents return results, main context coordinates completion
```

## Advanced MCP Integration Patterns

### Cross-Agent MCP Usage
Some MCP servers are used across multiple agents:
- **Sequential Thinking**: Used by 6 agents for complex analysis
- **JetBrains**: Used by 5 agents for codebase intelligence  
- **Context7**: Used by 4 agents for official documentation
- **Playwright**: Used by 2 agents for browser automation

### MCP Server Specialization
Each MCP server has primary and secondary use cases:
- **Supabase MCP**: Primary for Database Agent, secondary for data-heavy tasks
- **NX MCP**: Primary for Build Agent, provides project structure to others
- **Magic UI MCP**: Primary for Advanced UI, secondary for modern components
- **Perplexity MCP**: Primary for Research Agent, used for current information
- **Filesystem MCP**: Primary for File Operations, used for batch processing

### Intelligent Fallbacks
Agents have fallback strategies when MCP servers are unavailable:
- JetBrains MCP → Grep/Glob for basic search
- Context7 MCP → WebSearch for documentation
- Playwright MCP → Manual test instructions
- Sequential MCP → Step-by-step native analysis

This integration allows agents to be significantly more capable while maintaining clean context separation and efficient task delegation.