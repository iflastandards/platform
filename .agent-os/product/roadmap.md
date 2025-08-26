# Product Roadmap

## Phase 0: Already Completed ✅

The following features have been implemented:

- [x] **Multi-Site Docusaurus Architecture** - Portal + 6 standards sites (FRBR, LRM, ISBD, ISBDM, MULDICAT, UNIMARC)
- [x] **Nx Monorepo Setup** - Nx 21.4.0 with sophisticated build system and affected commands
- [x] **Admin Dashboard Structure** - Next.js 15.4 app with authentication and routing
- [x] **Clerk Authentication** - GitHub OAuth integration with RBAC foundation
- [x] **Shared Theme Package** - Component library with consistent styling across sites
- [x] **CSV/RDF Generation Tools** - Command-line tools for vocabulary processing
- [x] **5-Phase Testing Framework** - Comprehensive testing strategy with tag-based execution
- [x] **Git-Centric Workflows** - Version control as source of truth for all content
- [x] **GitHub Pages Deployment** - Automated CI/CD for documentation sites
- [x] **Development Server Orchestration** - Multi-site development environment

## Phase 1: Admin Feature Implementation (Current Priority)
**Goal:** Complete the administrative portal with full vocabulary management capabilities  
**Success Criteria:** Admin can create, edit, publish vocabularies through UI workflows

### High Priority Features
- [ ] **Dashboard UI Implementation** - Replace mock data with real interfaces `L`
- [ ] **API Contracts & Routes** - Complete REST API with OpenAPI documentation `L`
- [ ] **Vocabulary CRUD Operations** - Create, read, update, delete vocabulary entries `XL`
- [ ] **Mock Service Workers** - MSW implementation for deterministic testing `M`
- [ ] **Admin Feature Factory** - Implement the 6-phase feature development workflow `L`

### Medium Priority Features  
- [ ] **Import/Export Workflows** - CSV and RDF import/export with validation `L`
- [ ] **User Management UI** - RBAC implementation with role assignment interface `M`
- [ ] **Translation Management** - Multi-language content editing interface `L`
- [ ] **Command-Line Tool Documentation** - Proper docs for existing CSV/RDF tools `S`

### Low Priority Features
- [ ] **Configuration Refactoring** - Consolidate scattered config files `M`
- [ ] **Test Coverage Expansion** - Fill gaps identified in admin testing `S`

### Dependencies
- Clerk authentication fully configured ✅
- Supabase schema design and implementation
- Shared component library stabilization

## Phase 2: Integration and Automation
**Goal:** Connect admin workflows with documentation site publishing  
**Success Criteria:** Changes in admin automatically deploy to appropriate documentation sites

### Features
- [ ] **Automated Publishing Pipeline** - Direct admin-to-docs publishing workflow `L`
- [ ] **Content Synchronization** - Real-time sync between admin and docs `XL`
- [ ] **Advanced Editorial Workflows** - Review and approval processes `L`
- [ ] **Enhanced Documentation Features** - Search, accessibility, performance `M`
- [ ] **Community Integration** - Discussion forums and feedback systems `L`

### Dependencies
- Phase 1 admin portal stable
- GitHub Actions workflows optimized
- Database schema finalized

## Phase 3: Enhancement and Optimization  
**Goal:** Modernize user experience and add advanced features  
**Success Criteria:** Platform meets all accessibility standards and supports advanced collaboration

### Features
- [ ] **Performance Optimization** - Core Web Vitals optimization `M`
- [ ] **Advanced Search** - Algolia or enhanced local search `M`
- [ ] **Analytics Integration** - Usage tracking and content analytics `S`
- [ ] **API Expansion** - External system integration capabilities `L`
- [ ] **Mobile Enhancement** - Advanced responsive design improvements `M`
- [ ] **Backup and Recovery** - Automated backup systems `S`

### Dependencies
- Phase 1 and 2 completed
- Performance benchmarks established
- Community feedback incorporated

---

**Legend:**
- `S` = Small (1-3 days)
- `M` = Medium (4-7 days)  
- `L` = Large (1-3 weeks)
- `XL` = Extra Large (1+ months)