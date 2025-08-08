# IFLA Standards Platform

A comprehensive documentation and vocabulary management system for the International Federation of Library Associations (IFLA). This platform serves as the authoritative source for library standards including ISBD, LRM, FRBR, UNIMARC, and other cataloguing standards.

## 🌟 Features

- **Multi-Site Documentation**: Individual Docusaurus sites for each IFLA standard
- **Vocabulary Management**: RDF vocabulary generation, validation, and distribution
- **Admin Portal**: Next.js admin interface with GitHub OAuth authentication
- **Cross-Site Navigation**: Environment-aware linking between standards
- **Automated Testing**: Comprehensive build regression and E2E testing
- **Role-Based Access**: Custom RBAC system with Clerk authentication
- **Multi-Environment Support**: Local, preview, development, and production deployments

## 🏗️ Architecture

### Technology Stack

- **Build System**: Nx monorepo with pnpm workspace
- **Frontend**: Docusaurus (documentation) + Next.js (admin portal)
- **Language**: TypeScript with strict configuration
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Authentication**: Clerk with GitHub OAuth
- **Authorization**: Custom RBAC via Clerk publicMetadata
- **Data**: Google Sheets API + Supabase + File system

### Project Structure

```
standards-dev/
├── apps/
│   └── admin/                    # Next.js admin portal
├── portal/                       # Main documentation portal
├── standards/                    # Individual standard sites
│   ├── ISBDM/                   # ISBD Manifestation
│   ├── LRM/                     # Library Reference Model
│   ├── FRBR/                    # Functional Requirements
│   ├── isbd/                    # International Standard Bibliographic Description
│   ├── muldicat/                # Multilingual Dictionary of Cataloguing Terms
│   └── unimarc/                 # UNIMARC formats
├── packages/
│   ├── theme/                   # Shared Docusaurus theme
│   ├── ui/                      # Shared UI components
│   └── standards-cli/           # CLI tools
├── scripts/                     # Build and utility scripts
├── e2e/                         # End-to-end tests
├── docs/                        # Project documentation
├── developer_notes/             # Development guides and notes
└── system-design-docs/          # 📚 Authoritative system architecture docs (00-32)
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0
- pnpm >= 10.12.4
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/iflastandards/platform.git
cd platform

# Install dependencies
pnpm install

# Start Nx daemon for faster builds
pnpm nx:daemon:start

# Run health check
pnpm health
```

### Development

```bash
# Start all development servers using dev-servers helper
pnpm dev:servers

# Start specific sites only
pnpm dev:servers --sites=portal,admin

# Start in interactive mode with Chrome browser
pnpm dev:interactive

# Start in headless mode (no browser windows)
pnpm dev:headless

# Start specific site (individual approach)
pnpm nx start portal          # Main portal
pnpm nx start isbd           # ISBD standard
pnpm nx start admin          # Admin portal

# Start with port cleanup
pnpm nx run portal:start:robust
```

### Building

```bash
# Build all sites
pnpm build:all

# Build specific site
pnpm nx build portal
pnpm nx build isbd
pnpm nx build admin

# Test builds
pnpm test:builds:affected
```

## 📚 Available Sites

| Site | URL (Production) | URL (Preview) | Port |
|------|------------------|---------------|------|
| Portal | [iflastandards.info](https://www.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/) | 3000 |
| ISBDM | [isbdm.iflastandards.info](https://isbdm.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/isbdm/) | 3001 |
| LRM | [lrm.iflastandards.info](https://lrm.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/lrm/) | 3002 |
| FRBR | [frbr.iflastandards.info](https://frbr.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/frbr/) | 3003 |
| ISBD | [isbd.iflastandards.info](https://isbd.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/isbd/) | 3004 |
| MulDiCat | [muldicat.iflastandards.info](https://muldicat.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/muldicat/) | 3005 |
| UNIMARC | [unimarc.iflastandards.info](https://unimarc.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/unimarc/) | 3006 |
| Admin | [admin.iflastandards.info](https://admin.iflastandards.info) | [Preview](https://iflastandards.github.io/platform/admin/) | 3007 |

## 🧪 Testing

### Test Commands

```bash
# Run affected tests (recommended for development)
pnpm test

# Run comprehensive tests (for releases)
pnpm test:comprehensive

# Run E2E tests
pnpm test:e2e

# Run visual regression tests
pnpm test:visual

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Test Strategy

- **Unit Tests**: Vitest with co-located test files
- **Integration Tests**: Playwright in `e2e/` directory
- **Build Regression**: Automated site build validation
- **Visual Regression**: Screenshot comparison testing
- **Performance**: Nx caching and parallel execution
- **AI Testing Guide**: See [`developer_notes/test-first-implementation-guide.md`](developer_notes/test-first-implementation-guide.md) for comprehensive AI assistant testing patterns

## 🛠️ Development Workflow

### Adding New Features

1. Create feature branch from `preview`
2. Write tests first (TDD approach)
3. Implement feature with TypeScript
4. Run affected tests: `pnpm test`
5. Validate builds: `pnpm test:builds:affected`
6. Create PR to `preview` branch

### Creating New Standard Site

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

The enhanced vocabulary site scaffolding system ensures that all files referenced in the navigation sidebar exist, preventing "document ids do not exist" build errors. See [Vocabulary Site Scaffolding Guide](docs/vocabulary-site-scaffolding-guide.md) for details.

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

## 🔧 Configuration

### Environment Variables

The platform uses TypeScript configuration instead of `.env` files:

- **DOCS_ENV**: Environment setting (local|preview|development|production)
- **NODE_ENV**: Node environment (development|production)

Configuration is centralized in `packages/theme/src/config/siteConfig.ts`.

### Authentication Setup

1. Configure Clerk in the admin portal
2. Set up GitHub OAuth application
3. Configure user roles in Clerk publicMetadata
4. Add test users for development (see testing documentation)

## 📖 Documentation

### System Design Documentation (Authoritative)
- **Complete Architecture**: See `system-design-docs/` for comprehensive system design
- **Numbered Sequence**: Documents are numbered 00-32 for reading order
- **Key Documents**:
  - `00-executive-summary.md` - High-level overview
  - `01-system-architecture-overview.md` - Core architecture
  - `10-implementation-strategy.md` - Implementation roadmap
  - `31-spreadsheet-export-import-comprehensive-guide.md` - Import/export workflows
  - `32-phase1-import-export-implementation-plan.md` - Phase 1 integration approach

### Development Documentation
- **Developer Notes**: Comprehensive guides in `developer_notes/`
- **API Documentation**: Generated from TypeScript interfaces
- **Architecture Decisions**: Documented in `docs/`
- **Testing Strategy**: See `docs/testing-strategy.md`
- **Deployment Guide**: See `docs/deployment.md`
- **Vocabulary Site Scaffolding**: See `docs/vocabulary-site-scaffolding-guide.md`
- **Quick Reference**: See `docs/vocabulary-site-scaffolding-quick-reference.md`
- **Current Scaffolding Plan**: See `developer_notes/current-scaffolding-plan.md`

## 🚢 Deployment

### Branch Strategy

- **Development**: Feature branches
- **Preview**: `preview` branch → GitHub Pages at `iflastandards.github.io/platform/`
- **Production**: `main` branch → GitHub Pages at `www.iflastandards.info`

### Deployment URLs

- **Preview**: https://iflastandards.github.io/platform/
- **Production**: https://www.iflastandards.info/
- **Admin Preview**: https://admin-iflastandards-preview.onrender.com

### Contributing

For detailed contributing guidelines, please refer to our [CONTRIBUTING.md](CONTRIBUTING.md) document.

## 📊 Monitoring & Analytics

- **Build Performance**: Nx Cloud dashboard
- **Site Performance**: Lighthouse CI reports
- **Error Tracking**: Integrated error monitoring
- **Usage Analytics**: Privacy-compliant analytics

## 🆘 Troubleshooting

### Common Issues

```bash
# Slow builds
pnpm nx:optimize
pnpm nx:daemon:start

# Cache issues
pnpm nx:cache:clear

# Dependency conflicts
pnpm fresh

# Port conflicts
pnpm ports:kill

# System health check
pnpm health
```

### Getting Help

- Check `developer_notes/` for detailed guides
- Review test output for specific errors
- Use `pnpm health` to diagnose system issues
- Check GitHub Issues for known problems

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- International Federation of Library Associations (IFLA)
- IFLA Standards Committee
- Library community contributors
- Open source maintainers

---

**Maintained by**: IFLA Standards Team  
**Documentation**: [docs.iflastandards.info](https://docs.iflastandards.info)  
**Support**: [GitHub Issues](https://github.com/iflastandards/platform/issues)# Test commit
