# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - NEVER FORGET THESE 🚨

### Next.js Coding Standards (ALWAYS CHECK THESE FIRST)
1. **Internal Links**: Always use `<Link href="/dashboard">` - NEVER `<a href="/admin/dashboard">`
2. **API Calls**: Always use `fetch(addBasePath('/api/route'))` - NEVER hardcode basePath
3. **Static Assets**: Always use `addBasePath('/logo.png')` - NEVER manual prepending
4. **Write paths as if app is at root** - Next.js adds basePath automatically
5. **Import utility**: `import { addBasePath } from '@ifla/theme/utils';`

### Testing Strategy (MANDATORY FOR ALL TESTS)
1. **Pre-commit target**: < 60 seconds (use `nx affected`)
2. **Use 5-phase strategy**: On-demand → Pre-commit → Pre-push → Comprehensive → CI
3. **Always use `nx affected`** for development testing
4. **Parallel execution**: `--parallel=3` for performance
5. **Speed targets**: On-demand <5s, Pre-commit <60s, Pre-push <180s
6. **Test placement**: Check `@developer_notes/TEST_PLACEMENT_GUIDE.md` before writing tests

### Before ANY code/test work:
- [ ] Check if basePath applies (use root-relative paths like `/dashboard`)
- [ ] Choose appropriate test level (usually selective/affected)
- [ ] Verify API calls use `addBasePath()` utility
- [ ] Use `nx affected` instead of running everything

### Critical File References
- **Complete Testing Strategy**: `@developer_notes/TESTING_STRATEGY.md`
- **Test Placement Guide**: `@developer_notes/TEST_PLACEMENT_GUIDE.md` (use when writing tests)
- **Test Templates**: `@developer_notes/TEST_TEMPLATES.md` (copy for new tests)
- **Nx Test Optimizations**: `@developer_notes/NX_AFFECTED_TEST_OPTIMIZATION.md`
- **Complete Next.js Standards**: `@developer_notes/NEXTJS_CODING_STANDARDS.MD`

---

## Core Development Workflows

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build single site**: `nx build {name}` (e.g., `nx build portal`, `nx build isbdm`, `nx build admin`)
- **Build all sites**: `pnpm build:all` (optimized with Nx caching and parallelization)
- **Start dev server**: `nx start {site}` or `nx run {site}:start:robust` (with port cleanup)
- **Start Next.js dev**: `nx dev admin --turbopack` (for admin development)
- **Serve built site**: `nx serve {site}` or `nx run {site}:serve:robust` (with port cleanup)
- **Test execution**: `pnpm test` (nx affected with parallel execution)
- **Type checking**: `pnpm typecheck` (nx affected with parallel execution)
- **Linting**: `pnpm lint` (nx affected with parallel execution)
- **Health check**: `pnpm health` (comprehensive system check)
- **Fresh install**: `pnpm fresh` (clean install with cache clear)

### Performance Optimization Commands
- **Optimize Nx**: `pnpm nx:optimize` (run performance optimization script)
- **Start Nx daemon**: `pnpm nx:daemon:start` (speeds up all Nx commands)
- **Clear cache**: `pnpm nx:cache:clear` (when you need a fresh build)
- **View cache stats**: `pnpm nx:cache:stats` (monitor cache effectiveness)
- **View dependency graph**: `pnpm nx:graph` (visualize project dependencies)

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

### Test File Linting
- **Test files use relaxed linting rules**: See `pnpm lint:test-rules` for details
- **Less strict TypeScript**: Tests use `tsconfig.test.json` with relaxed type checking
- **Allowed in tests**: `any` types, console logs, longer functions, empty mocks
- **Test patterns**: `**/*.{test,spec}.{js,jsx,ts,tsx}`, `**/tests/**/*`, `**/e2e/**/*`
- **Commands**: 
  - `pnpm lint:tests` (lint only test files)
  - `pnpm lint:test-rules` (show relaxed rules explanation)

### Git Hooks (Layered Testing)

#### Pre-commit (Fast Feedback - ~30s)
- **Purpose**: Catch basic errors before commit
- **Command**: `pnpm test:pre-commit`
- **Runs**: TypeScript check, ESLint, Unit tests (affected)
- **Philosophy**: Warnings allowed, errors block commit
- **Goal**: Fast feedback loop for developers

#### Pre-push (Production Readiness - ~2-5min)
- **Purpose**: Ensure production readiness before push
- **Command**: `pnpm test:pre-push:flexible`
- **Assumes**: Pre-commit tests already passed
- **Runs**: Integration tests, Production builds (affected), Smart E2E
- **Goal**: Confidence that code works in production
- **Uses Nx affected**: Only tests what changed
- **E2E Strategy**: Auto-triggers when portal/admin affected

#### Post-push (GitHub Pages)
- **Purpose**: Verify deployment and external integrations
- **Runs**: Full site builds, GitHub Pages deployment, External service validation
- **Goal**: Catch issues that only appear in production environment

#### E2E Test Triggers
- **Auto-trigger**: When `portal` or `admin` projects are affected
- **Manual override**: Set `"runE2E": true` in `.prepushrc.json`
- **Critical changes**: UI/UX, navigation, search, auth flows, vocabulary functionality
- **Rationale**: E2E can be slow/flaky locally, only run when high-impact changes

#### Configuration
- **`.precommitrc.json`**: Pre-commit behavior
- **`.prepushrc.json`**: Pre-push behavior (integration tests, builds, smart e2e)
- **Philosophy**: No redundant testing between layers

### Development Tools
- **Ripgrep (rg)**: Fast file search tool installed and available
  - Use via the Grep tool (not bash commands)
  - Supports regex patterns, file type filtering, and context lines
  - Example: Search for "github" in TypeScript files with context
- **Flexible Linting**: Different strictness levels for production vs test code
  - Production code: Strict linting with warnings as errors
  - Test code: Relaxed rules allowing `any`, console logs, longer functions
  - Scripts: `scripts/pre-commit-check.js`, `scripts/pre-push-check.js`

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

## Performance Optimizations

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

### CI/CD Pipeline
The project has optimized GitHub Actions workflows:
- **Preview deployments**: Push to `preview` branch → GitHub Pages at `iflastandards.github.io/platform`
- **Production deployments**: PR from `preview` to `main` → GitHub Pages at `www.iflastandards.info`
- **Vercel previews**: Automatic preview deployments for each push to preview branch
- **Nx Cloud integration**: Distributed builds with 6-8 agents depending on environment

### Development Environment
- **VS Code**: Configured with `.vscode/settings.json` for optimal development
- **JetBrains IDEs**: Pre-configured run configurations and code styles in `.idea/`
- **Environment variables**: Use `.env.nx` for Nx-specific optimizations
- **Health check**: Run `pnpm health` to verify system configuration

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

## Troubleshooting

### Common Issues
1. **Slow builds**: Run `pnpm nx:optimize` and ensure daemon is running
2. **Cache issues**: Run `pnpm nx:cache:clear` for a fresh build
3. **Dependency conflicts**: Run `pnpm fresh` for clean install
4. **Port conflicts**: Use `pnpm ports:kill` to free up ports

### Performance Tips
1. Always have Nx daemon running: `pnpm nx:daemon:start`
2. Use affected commands when possible: `nx affected -t build`
3. Monitor cache effectiveness: `pnpm nx:cache:stats`
4. Run health check regularly: `pnpm health`

## important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.