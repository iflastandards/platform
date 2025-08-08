# Agent OS - IFLA Standards Platform

This directory contains Agent OS configuration and analysis for the IFLA Standards Platform project.

## Overview

Agent OS has been configured to understand and work with this sophisticated monorepo documentation platform that manages multiple IFLA library standards.

## Files

- **product-analysis.md**: Comprehensive analysis of the codebase, architecture, and capabilities
- **config.yaml**: Agent OS configuration with project-specific settings and workflows
- **README.md**: This file

## Quick Start

Agent OS is now configured to assist with:

### Development Tasks
- Writing TypeScript/React code following project conventions
- Creating Docusaurus documentation pages
- Building Next.js admin features
- Managing the Nx monorepo structure

### Testing & Quality
- Running appropriate test suites (unit, integration, E2E)
- Executing type checking and linting
- Following the 5-phase testing strategy
- Using Nx affected commands for efficiency

### Common Commands

```bash
# Development
pnpm dev:servers              # Start all dev servers
pnpm nx start portal          # Start specific site
pnpm nx dev admin --turbopack # Start admin with turbopack

# Testing
pnpm test                     # Run affected tests
pnpm test:e2e                 # Run E2E tests
pnpm typecheck               # Type checking

# Building
pnpm build:all               # Build all sites
pnpm nx affected --target=build # Build only affected

# Quality
pnpm lint                    # Lint code
pnpm health                  # System health check
```

## Project Structure Understanding

Agent OS recognizes:
- **Monorepo Structure**: Apps in `/apps`, packages in `/packages`
- **Documentation Sites**: Individual Docusaurus sites in `/standards/*`
- **Admin Portal**: Next.js 15 app in `/apps/admin`
- **Shared Components**: Theme and UI packages
- **Testing Strategy**: Tagged tests with phase-based execution

## Key Technologies

Agent OS is aware of:
- Nx 21.3.11 for monorepo management
- Docusaurus 3.8.1 for documentation
- Next.js 15.4.4 with React 19
- TypeScript with strict mode
- Vitest and Playwright for testing
- Clerk for authentication
- pnpm for package management

## Workflow Patterns

Agent OS follows project conventions:
1. Always use `pnpm` (never npm/yarn)
2. Run commands from root directory
3. Use Nx affected commands for efficiency
4. Follow strict TypeScript rules
5. Tag tests appropriately
6. Check CLAUDE.md for specific guidelines

## Environment Awareness

- **Local**: Development at localhost:3000-3008
- **Preview**: GitHub Pages staging
- **Production**: www.iflastandards.info

## Getting Help

For project-specific guidance:
1. Check `/CLAUDE.md` for AI-specific instructions
2. Review `/developer_notes/` for detailed guides
3. Consult `/system-design-docs/` for architecture decisions
4. Use `pnpm health` to verify system setup

## Next Steps

Agent OS is ready to assist with:
- Feature development
- Bug fixes
- Test improvements
- Documentation updates
- Build optimizations
- Code refactoring

Simply describe what you need, and Agent OS will leverage its understanding of the project structure and conventions to provide effective assistance.