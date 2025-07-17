---
inclusion: always
---

# Development Workflow

## Overview

This document outlines the development workflow, best practices, and tools for the IFLA Standards Platform. It provides guidance on code development, performance optimization, deployment, and troubleshooting.

## Code Development Guidelines

### General Principles

- **ALWAYS CHECK MUI MCP AND CONTEXT7 MCP FOR EXAMPLES BEFORE WRITING CODE**
- **ALWAYS RUN TYPECHECK AND ESLINT AFTER WRITING CODE BEFORE MOVING TO THE NEXT TASK**
- Follow the Next.js coding standards for all admin portal development
- Use TypeScript for all new code
- Maintain consistent code style with ESLint and Prettier

### Pre-Development Checklist

Before starting any code or test work:

- [ ] Check if basePath applies (use root-relative paths like `/dashboard`)
- [ ] Choose appropriate test level (usually selective/affected)
- [ ] Verify API calls use `addBasePath()` utility
- [ ] Use `nx affected` instead of running everything

## Performance Optimization

### pnpm Configuration

The project uses optimized pnpm settings configured in `.npmrc`:

- **Workspace hoisting**: Optimized for monorepo with shared dependencies
- **Auto peer deps**: Automatically installs peer dependencies (helps with React 19)
- **Deep linking**: Better cross-package dependency resolution
- **Performance caching**: Side effects cache enabled for faster installs

### Nx Configuration

Nx is configured for maximum performance:

- **Daemon process**: Always running for faster command execution
- **Distributed caching**: Nx Cloud enabled for team cache sharing
- **Parallel execution**: Configured to use 8 cores (adjustable)
- **Remote caching**: Enabled for CI/CD pipeline optimization

### Performance Commands

```bash
# Optimize Nx
pnpm nx:optimize

# Start Nx daemon (speeds up all Nx commands)
pnpm nx:daemon:start

# Clear cache (when you need a fresh build)
pnpm nx:cache:clear

# View cache stats (monitor cache effectiveness)
pnpm nx:cache:stats

# View dependency graph (visualize project dependencies)
pnpm nx:graph
```

### Performance Tips

1. Always have Nx daemon running: `pnpm nx:daemon:start`
2. Use affected commands when possible: `nx affected -t build`
3. Monitor cache effectiveness: `pnpm nx:cache:stats`
4. Run health check regularly: `pnpm health`

## Development Tools

### Ripgrep (rg)

Fast file search tool installed and available:

- Use via the Grep tool (not bash commands)
- Supports regex patterns, file type filtering, and context lines
- Example: Search for "github" in TypeScript files with context

### Flexible Linting

Different strictness levels for production vs test code:

- Production code: Strict linting with warnings as errors
- Test code: Relaxed rules allowing `any`, console logs, longer functions
- Scripts: `scripts/pre-commit-check.js`, `scripts/pre-push-check.js`

### Test File Linting

- **Test files use relaxed linting rules**: See `pnpm lint:test-rules` for details
- **Less strict TypeScript**: Tests use `tsconfig.test.json` with relaxed type checking
- **Allowed in tests**: `any` types, console logs, longer functions, empty mocks
- **Test patterns**: `**/*.{test,spec}.{js,jsx,ts,tsx}`, `**/tests/**/*`, `**/e2e/**/*`
- **Commands**: 
  - `pnpm lint:tests` (lint only test files)
  - `pnpm lint:test-rules` (show relaxed rules explanation)

## GitHub Services Integration

### Mock GitHub Package

- **Package**: `@kie/mock-github` (v2.0.1 installed)
- **Documentation**: https://github.com/kiegroup/mock-github?tab=readme-ov-file
- **Purpose**: Mock GitHub API responses for testing without hitting real endpoints
- **Key Features**: Simulates GitHub API, repositories, issues, pull requests, and webhooks

### Octokit.js (JavaScript GitHub SDK)

- **Official SDK**: The all-batteries-included GitHub SDK for Browsers, Node.js, and Deno
- **Documentation**: https://github.com/octokit/octokit.js
- **Installation**: `pnpm add octokit`
- **Basic Usage**:
  ```javascript
  import { Octokit } from "octokit";
  const octokit = new Octokit({ auth: `personal-access-token` });
  const { data } = await octokit.rest.users.getAuthenticated();
  ```

### GitHub REST API

- **Documentation**: https://docs.github.com/en/rest
- **Authentication**: Personal Access Tokens, OAuth Apps, GitHub Apps
- **Common Endpoints**:
  - Issues: `POST /repos/{owner}/{repo}/issues`
  - Pull Requests: `POST /repos/{owner}/{repo}/pulls`
  - Repositories: `GET /repos/{owner}/{repo}`
  - Webhooks: `POST /repos/{owner}/{repo}/hooks`

### GitHub GraphQL API

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

### GitHub MCP Server

- **Official MCP Server**: GitHub's Model Context Protocol server
- **Docker Image**: `ghcr.io/github/github-mcp-server`
- **Features**: Direct GitHub API access for AI tools
- **Environment Variables**:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`: Required for authentication
  - `GITHUB_TOOLSETS`: Comma-separated list of toolsets
  - `GITHUB_HOST`: For GitHub Enterprise Server

## Deployment Workflow

### Branch Strategy

1. **Development**: Work on feature branches
2. **Preview**: Merge to `preview` branch for staging
3. **Production**: Create PR from `preview` to `main` (protected branch)

### Deployment URLs

- **Preview**: https://iflastandards.github.io/platform/
- **Production**: https://www.iflastandards.info/
- **Vercel Previews**: Automatic for each preview branch commit

### Build Process

1. **Unified build**: Scripts create a single deployment directory
2. **Environment-specific**: Different configurations for preview/production
3. **Validation**: Automated checks before deployment
4. **Caching**: Aggressive caching for faster builds

### CI/CD Pipeline

The project has optimized GitHub Actions workflows:

- **Preview deployments**: Push to `preview` branch → GitHub Pages at `iflastandards.github.io/platform`
- **Production deployments**: PR from `preview` to `main` → GitHub Pages at `www.iflastandards.info`
- **Vercel previews**: Automatic preview deployments for each push to preview branch
- **Nx Cloud integration**: Distributed builds with 6-8 agents depending on environment

## Site Scaffolding

- **Create new site**: `pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"`
- **Template location**: Complete site template in `scripts/scaffold-template/` with ISBD-matching structure
- **Generated files**: `docusaurus.config.ts`, `project.json`, all content pages, and CompactButton component
- **Features**: Tabbed overview pages, comprehensive documentation structure, Nx integration
- **Documentation**: See `developer_notes/current-scaffolding-plan.md` for complete system details

## Troubleshooting

### Common Issues

1. **Slow builds**: Run `pnpm nx:optimize` and ensure daemon is running
2. **Cache issues**: Run `pnpm nx:cache:clear` for a fresh build
3. **Dependency conflicts**: Run `pnpm fresh` for clean install
4. **Port conflicts**: Use `pnpm ports:kill` to free up ports

### Development Environment

- **VS Code**: Configured with `.vscode/settings.json` for optimal development
- **JetBrains IDEs**: Pre-configured run configurations and code styles in `.idea/`
- **Environment variables**: Use `.env.nx` for Nx-specific optimizations
- **Health check**: Run `pnpm health` to verify system configuration