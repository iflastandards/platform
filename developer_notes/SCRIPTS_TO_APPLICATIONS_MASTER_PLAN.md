# Scripts to Applications Migration - Master Implementation Plan

## 🎯 Overview
Transform utility scripts into first-class applications with proper architecture, testing, and documentation.

## 📍 Critical Context
- **`/apps/docs`**: INTERNAL developer documentation site (serves multiple doc directories)
- **`/portal`**: PUBLIC IFLA main site with user documentation for authors/editors
- **Script Inventory UI**: Should integrate into `/apps/docs` (internal tool for developers)
- **Test Tag Manager UI**: Should integrate into `/apps/admin` (management tool)

---

## 🔄 Phase 1: Script Inventory Application
**Status**: NOT STARTED | **Target**: 2-3 weeks | **Integration**: `/apps/docs`

### Directory Structure
```
packages/script-inventory/
├── src/
│   ├── core/           # Move from scripts/script-inventory/*
│   ├── database/       # SQLite for inventory data
│   ├── api/           # REST endpoints
│   ├── cli/           # Preserve CLI interface
│   ├── ui/            # React components for Docusaurus
│   └── types/         # TypeScript contracts
├── tests/
├── docs/
├── package.json
└── README.md
```

### Week 1 Tasks
```bash
# 1. Create package
mkdir -p packages/script-inventory/src/{core,database,api,cli,ui,types}
mkdir -p packages/script-inventory/{tests,docs}

# 2. Move existing code
mv scripts/script-inventory/* packages/script-inventory/src/core/

# 3. Initialize package
cd packages/script-inventory
pnpm init
pnpm add sqlite3 express @types/express
pnpm add -D vitest @types/node typescript
```

### Week 2: API Implementation
```typescript
// packages/script-inventory/src/api/routes.ts
GET  /api/scripts                    // List all
GET  /api/scripts/:id               // Get details
GET  /api/scripts/search            // Search
GET  /api/scripts/deprecated        // Deprecated list
GET  /api/scripts/dependencies      // Dep graph
POST /api/scripts/analyze           // Trigger analysis
GET  /api/scripts/stats             // Dashboard stats
```

### Week 3: Docusaurus Integration
```tsx
// apps/docs/src/components/ScriptInventory/Dashboard.tsx
export function ScriptInventoryDashboard() {
  // Stats overview
  // Search interface
  // Dependency graph
  // Deprecation warnings
}

// apps/docs/src/pages/tools/script-inventory.mdx
import { ScriptInventoryDashboard } from '@site/src/components/ScriptInventory/Dashboard';

# Script Inventory

<ScriptInventoryDashboard />
```

### Database Schema
```sql
-- packages/script-inventory/src/database/schema.sql
CREATE TABLE scripts (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  purpose TEXT,
  deprecated BOOLEAN DEFAULT 0,
  last_analyzed TIMESTAMP,
  metadata JSON
);

CREATE TABLE dependencies (
  id INTEGER PRIMARY KEY,
  script_id INTEGER,
  depends_on INTEGER,
  FOREIGN KEY(script_id) REFERENCES scripts(id),
  FOREIGN KEY(depends_on) REFERENCES scripts(id)
);

CREATE TABLE usage_stats (
  id INTEGER PRIMARY KEY,
  script_id INTEGER,
  execution_count INTEGER DEFAULT 0,
  last_executed TIMESTAMP,
  FOREIGN KEY(script_id) REFERENCES scripts(id)
);
```

---

## 🏗️ Phase 2: Test Tag Manager Application
**Status**: NOT STARTED | **Target**: 2-3 weeks | **Integration**: `/apps/admin`

### Directory Structure
```
packages/test-tag-manager/
├── src/
│   ├── analyzer/       # Tag analysis engine
│   ├── validator/      # Validation rules
│   ├── auto-tagger/    # AI integration
│   ├── api/           # Management API
│   ├── database/      # Tag storage
│   └── types/
├── tests/
├── docs/
└── package.json
```

### Implementation Tasks
```bash
# Create structure
mkdir -p packages/test-tag-manager/src/{analyzer,validator,auto-tagger,api,database,types}

# Move existing scripts
mv scripts/auto-tag-tests.ts packages/test-tag-manager/src/auto-tagger/
mv scripts/validate-test-tagging.js packages/test-tag-manager/src/validator/
```

### Admin Integration
```typescript
// apps/admin/src/features/test-management/components/TagManager.tsx
- Tag coverage dashboard
- Bulk tagging interface
- Rule configuration
- AI provider settings
```

### API Endpoints
```typescript
// packages/test-tag-manager/src/api/routes.ts
GET  /api/tags                      // List all tags
POST /api/tags/analyze              // Analyze test files
POST /api/tags/apply                // Apply tags
GET  /api/tags/coverage             // Coverage report
POST /api/tags/validate             // Validate tags
POST /api/tags/auto-tag             // AI tagging
```

---

## 🔄 Phase 3: Service Layer Migration
**Status**: NOT STARTED | **Target**: 3-4 weeks

### 3.1 Sheets Service
```
packages/sheets-service/
├── src/
│   ├── google/         # Google Sheets API
│   ├── excel/          # Excel operations
│   ├── formatters/     # Formatting logic
│   └── api/           # Service endpoints
```

**Move from `scripts/`:**
- create-isbd-sheets.ts → sheets-service/src/google/
- create-proper-isbd-excel.ts → sheets-service/src/excel/
- spreadsheet-api.ts → sheets-service/src/api/

### 3.2 Scaffolding Service
```
packages/scaffolding-service/
├── src/
│   ├── generators/     # Site generators
│   ├── templates/      # Template engine
│   └── api/           # Generation API
```

**Move from `scripts/`:**
- scaffold-site.ts → scaffolding-service/src/generators/
- page-template-generator.ts → scaffolding-service/src/generators/
- scaffold-template/* → scaffolding-service/src/templates/

### 3.3 RDF Service
```
packages/rdf-service/
├── src/
│   ├── converters/     # RDF/CSV conversion
│   ├── validators/     # Format validation
│   └── api/           # Conversion API
```

**Move from `scripts/`:**
- rdf-to-csv.ts → rdf-service/src/converters/
- rdf-folder-to-csv.ts → rdf-service/src/converters/

---

## 📚 Phase 4: Documentation Strategy
**Status**: NOT STARTED | **Target**: 1-2 weeks

### Documentation Locations
```
apps/docs/docs/developer/applications/
├── script-inventory/
│   ├── overview.md
│   ├── api-reference.md
│   ├── database-schema.md
│   └── migration-guide.md
├── test-tag-manager/
│   ├── overview.md
│   ├── tagging-rules.md
│   ├── ai-integration.md
│   └── api-reference.md
└── services/
    ├── sheets-service.md
    ├── scaffolding-service.md
    └── rdf-service.md
```

### Package Documentation
Each package must have:
- README.md with quick start
- API documentation (OpenAPI)
- Architecture decisions (ADRs)
- Migration guides
- Test documentation

---

## 🚀 Implementation Checklist

### Phase 1: Script Inventory
- [ ] Create package structure
- [ ] Move existing code
- [ ] Set up SQLite database
- [ ] Implement REST API
- [ ] Create Docusaurus components
- [ ] Integrate into /apps/docs
- [ ] Write tests
- [ ] Document API

### Phase 2: Test Tag Manager
- [ ] Create package structure
- [ ] Move existing scripts
- [ ] Build validation engine
- [ ] Implement AI integration
- [ ] Create admin UI components
- [ ] Integrate into /apps/admin
- [ ] Write tests
- [ ] Document features

### Phase 3: Services
- [ ] Create sheets-service package
- [ ] Create scaffolding-service package
- [ ] Create rdf-service package
- [ ] Maintain backward compatibility
- [ ] Write service tests
- [ ] Document APIs

### Phase 4: Documentation
- [ ] Create developer docs in /apps/docs
- [ ] Write API references
- [ ] Create migration guides
- [ ] Update root documentation

---

## 📋 Context Preservation Notes

**For AI Assistant across sessions:**
1. Script Inventory UI goes in `/apps/docs` (internal developer tool)
2. Test Tag Manager UI goes in `/apps/admin` (management interface)
3. `/portal` is for PUBLIC documentation, not internal tools
4. All packages go in `packages/` directory
5. Preserve CLI interfaces during migration
6. Each package needs proper TypeScript setup
7. Use SQLite for local databases
8. Create OpenAPI specs for all APIs

**Key Files to Check:**
- This plan: `developer_notes/SCRIPTS_TO_APPLICATIONS_MASTER_PLAN.md`
- Existing inventory: `scripts/script-inventory/`
- Test tagger: `scripts/auto-tag-tests.ts`
- Validation: `scripts/validate-test-tagging.js`

**Commands to Remember:**
```bash
# Check current script inventory
ls -la scripts/script-inventory/

# Check test tagging scripts
ls -la scripts/*tag*.{ts,js}

# Check sheets scripts
ls -la scripts/*sheet*.ts scripts/*spreadsheet*.ts

# Check scaffolding scripts
ls -la scripts/scaffold*.ts scripts/page-template*.ts
```

---

## 🎯 Success Criteria

1. **Script Inventory**: Developers can browse scripts via web UI in /apps/docs
2. **Test Tag Manager**: Test coverage visible in /apps/admin with auto-tagging
3. **Services**: APIs replace direct script calls with proper contracts
4. **Documentation**: Every package has comprehensive docs in /apps/docs
5. **Testing**: >80% code coverage for all new packages
6. **Migration**: Zero breaking changes for existing workflows

---

## 🔄 Next Session Start

If context is lost, start with:
```bash
# 1. Read this plan
cat developer_notes/SCRIPTS_TO_APPLICATIONS_MASTER_PLAN.md

# 2. Check progress
ls -la packages/script-inventory/ 2>/dev/null || echo "Phase 1 not started"
ls -la packages/test-tag-manager/ 2>/dev/null || echo "Phase 2 not started"

# 3. Continue from last incomplete phase
```