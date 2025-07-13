# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Workflows

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build single site**: `nx build {name}` (e.g., `nx build portal`, `nx build isbdm`, `nx build admin`)
- **Start dev server**: `nx start {site}` or `nx run {site}:start:robust` (with port cleanup)
- **Start Next.js dev**: `nx dev admin` (for admin development)
- **Serve built site**: `nx serve {site}` or `nx run {site}:serve:robust` (with port cleanup)
- **Test execution**: `pnpm test` (nx affected with parallel execution)
- **Type checking**: `pnpm typecheck` (nx affected with parallel execution)
- **Linting**: `pnpm lint` (nx affected with parallel execution)

### Site Scaffolding
- **Create new site**: `pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"`
- **Template location**: Complete site template in `scripts/scaffold-template/` with ISBD-matching structure
- **Generated files**: `docusaurus.config.ts`, `project.json`, all content pages, and CompactButton component
- **Features**: Tabbed overview pages, comprehensive documentation structure, Nx integration
- **Documentation**: See `developer_notes/current-scaffolding-plan.md` for complete system details

## Workflow and Code Preparation Memories

### Code Development Guidelines
- **ALWAYS CHECK MUI MCP AND CONTEXT7 MCP FOR EXAMPLES BEFORE WRITING CODE**
- **ALWAYS RUN TYPECHECK AND ESLINT AFTER WRITING CODE BEFORE MOVING TO THE NEXT TASK**

### Development Tools
- **Ripgrep (rg)**: Fast file search tool installed and available
  - Use via the Grep tool (not bash commands)
  - Supports regex patterns, file type filtering, and context lines
  - Example: Search for "github" in TypeScript files with context

### GitHub Services Integration

#### Mock GitHub Package
- **Package**: `@kie/mock-github` (v2.0.1 installed)
- **Documentation**: https://github.com/kiegroup/mock-github?tab=readme-ov-file
- **Purpose**: Mock GitHub API responses for testing without hitting real endpoints
- **Key Features**: Simulates GitHub API, repositories, issues, pull requests, and webhooks

#### GitHub API References

##### Octokit.js (JavaScript GitHub SDK)
- **Official SDK**: The all-batteries-included GitHub SDK for Browsers, Node.js, and Deno
- **Documentation**: https://github.com/octokit/octokit.js
- **Installation**: `pnpm add octokit`
- **Basic Usage**:
  ```javascript
  import { Octokit } from "octokit";
  const octokit = new Octokit({ auth: `personal-access-token` });
  const { data } = await octokit.rest.users.getAuthenticated();
  ```

##### GitHub REST API
- **Documentation**: https://docs.github.com/en/rest
- **Authentication**: Personal Access Tokens, OAuth Apps, GitHub Apps
- **Common Endpoints**:
  - Issues: `POST /repos/{owner}/{repo}/issues`
  - Pull Requests: `POST /repos/{owner}/{repo}/pulls`
  - Repositories: `GET /repos/{owner}/{repo}`
  - Webhooks: `POST /repos/{owner}/{repo}/hooks`

##### GitHub GraphQL API
- **Documentation**: https://docs.github.com/en/graphql
- **Explorer**: https://docs.github.com/en/graphql/overview/explorer
- **Usage with Octokit**:
  ```javascript
  const result = await octokit.graphql(`
    query { 
      viewer { login }
    }
  `);
  ```

##### GitHub MCP Server
- **Official MCP Server**: GitHub's Model Context Protocol server
- **Docker Image**: `ghcr.io/github/github-mcp-server`
- **Features**: Direct GitHub API access for AI tools
- **Environment Variables**:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`: Required for authentication
  - `GITHUB_TOOLSETS`: Comma-separated list of toolsets
  - `GITHUB_HOST`: For GitHub Enterprise Server

[... rest of the existing content remains unchanged ...]