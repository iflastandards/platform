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

[... rest of the existing content remains unchanged ...]