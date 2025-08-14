# MCP Server Integration for Agents

This document explains how specialized agents can leverage MCP servers for enhanced capabilities.

## Available MCP Servers

1. **JetBrains MCP** - Codebase intelligence
2. **Context7 MCP** - Library documentation
3. **Sequential Thinking MCP** - Complex analysis
4. **Playwright MCP** - Browser automation
5. **MUI MCP** - Material-UI components
6. **NX MCP** - Monorepo operations

## Agent-Specific MCP Usage

### Search Agent
**Primary MCP**: JetBrains
```python
# File and content search
mcp__jetbrains__find_files_by_name_substring("withAuth")
mcp__jetbrains__search_in_files_content("canPerformAction")
mcp__jetbrains__list_directory_tree_in_folder("apps/admin")

# Complex analysis
mcp__sequential-thinking__sequentialthinking({
  thought: "Finding all auth patterns across codebase",
  nextThoughtNeeded: true
})
```

### Test Writer Agent
**Primary MCP**: Context7, Sequential, Playwright
```python
# Get testing patterns
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/vitest/vitest",
  topic: "integration testing"
})

# Plan test scenarios
mcp__sequential-thinking__sequentialthinking({
  thought: "Identifying test cases for VocabularyForm",
  nextThoughtNeeded: true
})

# E2E testing
mcp__playwright__browser_navigate("/admin")
mcp__playwright__browser_click({element: "Login", ref: "button"})
```

### API Builder Agent
**Primary MCP**: Context7, JetBrains
```python
# Next.js API patterns
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router api routes"
})

# Find existing patterns
mcp__jetbrains__search_in_files_content("export const GET")
```

### UI Developer Agent
**Primary MCP**: MUI, Context7, JetBrains
```python
# MUI component docs
mcp__mui-mcp__useMuiDocs({
  urlList: ["https://llms.mui.com/material-ui/7.2.0/llms.txt"]
})

# React patterns
mcp__Context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks"
})

# Find existing components
mcp__jetbrains__find_files_by_name_substring("*.component.tsx")
```

### Refactor Agent
**Primary MCP**: JetBrains, Sequential
```python
# Find all files to refactor
mcp__jetbrains__search_in_files_content("oldPattern")

# Plan refactoring strategy
mcp__sequential-thinking__sequentialthinking({
  thought: "Planning safe refactoring of auth middleware",
  totalThoughts: 6
})

# Apply changes systematically
mcp__jetbrains__replace_specific_text({
  file_path: "path/to/file.ts",
  old_text: "oldPattern",
  new_text: "newPattern"
})
```

## Benefits

1. **Specialized Tools**: Each agent uses the most appropriate MCP servers
2. **Better Results**: MCP servers provide intelligent capabilities beyond basic tools
3. **Efficiency**: JetBrains MCP is faster than grep/find for searching
4. **Documentation**: Context7 provides up-to-date library patterns
5. **Complex Logic**: Sequential Thinking helps with multi-step analysis
6. **Automation**: Playwright enables browser-based testing

## Usage Pattern

When an agent is spawned:
1. Agent loads its prompt from `.claude/agents/`
2. Agent identifies which MCP servers to use
3. Agent uses MCP servers for specialized tasks
4. Agent uses native tools as fallback
5. Agent returns results to main context

## Example Workflow

```
You: "Find all API routes and add rate limiting"

Main Context:
1. Recognizes "find" and "API" triggers
2. Spawns search agent with JetBrains MCP
3. Agent uses mcp__jetbrains__search_in_files_content("route.ts")
4. Agent returns list of API routes
5. Spawns API builder agent with Context7 MCP
6. Agent gets rate limiting patterns from Context7
7. Agent implements rate limiting
8. Returns updated files to main context
```

This integration allows agents to be much more capable while keeping the main context clean.