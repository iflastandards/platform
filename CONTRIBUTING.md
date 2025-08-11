# Contributing to IFLA Standards Platform

Thank you for considering contributing to IFLA Standards Platform! We welcome contributions to improve our platform. Please follow these guidelines to ensure a smooth collaboration process.

## Getting Started

1. **Fork the Repository**: Start by forking the repository to your own GitHub account.

2. **Create a Feature Branch**: For each feature or bug fix, create a new branch from the `preview` branch.

3. **Development Workflow**: Follow our development workflow, which includes writing thorough tests and adhering to code standards.

## Development Workflow

### Adding New Features

1. Create feature branch from `preview`
2. Write tests first (TDD approach)
3. Implement feature with TypeScript
4. Run affected tests: `pnpm test`
5. Validate builds: `pnpm test:builds:affected`
6. Create PR to `preview` branch

### Code Standards

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Maintain accessibility compliance (WCAG 2.1 AA)
- Use semantic commit messages

### Testing Guidelines

For comprehensive testing strategies and AI-assisted development, see:
- **[Test-First Implementation Guide](developer_notes/test-first-implementation-guide.md)** - Complete testing patterns for AI assistants including:
  - Test-driven development workflows
  - Component testing with MUI and React Testing Library
  - API route testing with Next.js
  - E2E testing patterns with Playwright
  - Common pitfalls and debugging techniques
- **[Testing Strategy](developer_notes/TESTING_STRATEGY.md)** - Five-phase testing approach for the entire platform

### Creating New Standard Sites

```bash
# Scaffold new site
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"

# Generate complete site structure with all necessary files
pnpm tsx scripts/page-template-generator.ts --namespace=newsite

# Or use the vocabulary site generator
npx tsx scripts/generate-vocabulary-sites.ts --sites new-namespace

# Validate file structure
pnpm tsx scripts/validate-sidebar-references.ts standards/newsite
```

## Development Environment

### Prerequisites

- Node.js >= 18.0
- pnpm >= 10.12.4
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/platform.git
cd platform

# Install dependencies
pnpm install

# Start Nx daemon for faster builds
pnpm nx:daemon:start

# Run health check
pnpm health
```

### Performance Optimization

```bash
# Optimize Nx configuration
pnpm nx:optimize

# Clear cache for fresh builds
pnpm nx:cache:clear

# View dependency graph
pnpm nx:graph

# Kill development ports
pnpm ports:kill
```

## Branch Strategy

- **Development**: Feature branches
- **Preview**: `preview` branch → GitHub Pages at `iflastandards.github.io/platform/`
- **Production**: `main` branch → GitHub Pages at `www.iflastandards.info`

## Submitting Changes

1. Ensure all tests pass before submitting a pull request
2. Submit pull requests to the `preview` branch
3. Follow the pull request template
4. Be responsive to code review feedback

## Getting Help

- Check `developer_notes/` for detailed guides
- Review test output for specific errors
- Use `pnpm health` to diagnose system issues
- Check GitHub Issues for known problems

## Additional Resources

### Documentation

- **Developer Notes**: Comprehensive guides in `developer_notes/`
- **System Design Documentation**: See `/system-design-docs/` for comprehensive system design
- **API Documentation**: Generated from TypeScript interfaces
- **Architecture Decisions**: Documented in `docs/`

### Key Development Documents

- **Testing Strategy**: See `developer_notes/TESTING_STRATEGY.md`
- **Configuration Architecture**: See `developer_notes/configuration-architecture.md`
- **Admin Portal Architecture**: See `developer_notes/admin-architecture-implementation-plan.md`

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for all contributors. Please be respectful and professional in all interactions.

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
