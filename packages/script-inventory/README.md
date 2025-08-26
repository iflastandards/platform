# Script Inventory

TypeScript package for automated script analysis and inventory management in the IFLA Standards Platform with full auto-registration capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Analyze scripts
pnpm cli:analyze --dirs scripts,tools

# Query inventory
pnpm cli:query stats

# Start API server with auto-registration
pnpm api:dev

# Start real-time file watching
npx script-inventory watch

# Test pre-commit validation
npx script-inventory test-hook
```

## 📋 Features

### Core Features ✅ (Phase 1 Complete)
- **Script Analysis**: Automated parsing of JavaScript, TypeScript, Python, and Shell scripts
- **Documentation Scoring**: Quality metrics based on documentation completeness
- **REST API**: Comprehensive endpoints for programmatic access
- **CLI Tools**: Backward compatible command-line interface
- **Database Storage**: SQLite-based persistent storage with full schema

### Auto-Registration System ✅ (Phase 2 Complete)
- **Pre-commit Hooks**: Automatic validation and registration during git commits
- **Real-time Monitoring**: File system watching with intelligent batching
- **Webhook Integration**: GitHub, build system, and external tool webhooks
- **Validation Modes**: Strict, normal, lenient, and progressive validation
- **Configuration Management**: Multi-source configuration with directory overrides
- **Batch Processing**: Efficient bulk registration and validation APIs

### Web Dashboard (Phase 3 - Planned)
- **React Components**: Interactive script browsing and management
- **Dependency Graphs**: Visual representation of script relationships
- **Quality Dashboards**: Real-time metrics and improvement tracking
- **Admin Interfaces**: Configuration and system management

## 🏗️ Architecture

```
packages/script-inventory/
├── src/
│   ├── core/              # Analysis and inventory logic
│   ├── database/          # SQLite operations
│   ├── api/              # REST endpoints + webhooks
│   ├── automation/       # Auto-registration system
│   │   ├── config/       # Configuration management
│   │   ├── git-hooks/    # Pre-commit integration
│   │   ├── validation/   # Documentation validation
│   │   └── monitoring/   # File system watching
│   ├── cli/              # Command line interface
│   └── types/            # TypeScript definitions
├── tests/                # Test suites
└── docs/                 # Documentation
```

## 📡 API Endpoints

### Core Script Management
```typescript
GET  /api/scripts                    // List scripts with pagination
GET  /api/scripts/:id               // Script details
GET  /api/scripts/search            // Search with filters
GET  /api/scripts/stats             // Inventory statistics
POST /api/scripts/register          // Register single script
POST /api/scripts/bulk-register     // Bulk registration
POST /api/scripts/validate          // Validate documentation
```

### Auto-Registration (Phase 2)
```typescript
POST /api/webhooks/github           // GitHub push events
POST /api/webhooks/build            // Build system integration
POST /api/webhooks/external         // External tool webhooks
POST /api/auto-register/bulk        // Bulk auto-registration
POST /api/auto-register/validate-batch // Batch validation
```

## 🔧 CLI Commands

### Core Commands
```bash
# Analysis and management
script-inventory analyze --dirs scripts,tools
script-inventory query stats
script-inventory query search test
script-inventory register ./my-script.ts
script-inventory validate ./scripts/

# Server
script-inventory serve --port 3001
```

### Auto-Registration Commands (Phase 2)
```bash
# Real-time monitoring
script-inventory watch --dirs scripts,tools
script-inventory auto-validate scripts/ --mode strict --report

# System management
script-inventory status              # System status overview
script-inventory config show        # Show configuration
script-inventory config set --mode strict
script-inventory test-hook          # Test pre-commit hooks
script-inventory setup              # Initialize auto-registration
```

## ⚙️ Configuration

### Project Configuration (package.json)
```json
{
  "scriptInventory": {
    "autoRegistration": {
      "enabled": true,
      "validationMode": "normal",
      "minDocScore": 60,
      "requiredFields": ["purpose", "usage"],
      "excludePaths": ["**/temp/**", "**/build/**"],
      "watchDirectories": ["scripts", "tools", "src/cli"],
      "webhookSecret": "env:SCRIPT_INVENTORY_WEBHOOK_SECRET",
      "notifications": {
        "slack": true,
        "email": false
      }
    }
  }
}
```

### Directory Overrides (.script-inventory.json)
```json
{
  "validationMode": "strict",
  "minDocScore": 80,
  "requiredFields": ["purpose", "usage", "examples"],
  "customRules": [
    {
      "name": "require-cli-help",
      "description": "CLI scripts must have --help option",
      "condition": "isCli === true",
      "requirement": "hasHelpOption === true"
    }
  ]
}
```

### Environment Variables
```bash
SCRIPT_INVENTORY_ENABLED=true
SCRIPT_INVENTORY_VALIDATION_MODE=normal
SCRIPT_INVENTORY_WEBHOOK_SECRET=your-secret-here
SCRIPT_INVENTORY_BYPASS=true  # Emergency bypass
```

## 🧪 Testing

```bash
# Unit and integration tests
pnpm test                    # Run all tests
pnpm test:ui                # Test with UI
pnpm test:coverage          # Coverage report
pnpm test:watch             # Watch mode

# Auto-registration testing
pnpm test-hook              # Test pre-commit hooks
npx script-inventory auto-validate scripts/ --report
```

## 🔄 Integration

### Pre-commit Hook Setup
```bash
# Install husky if not already installed
npm install --save-dev husky

# Add pre-commit hook
echo '#!/bin/sh\nnpx script-inventory test-hook' > .husky/pre-commit
chmod +x .husky/pre-commit

# Or use the setup command
npx script-inventory setup --git-hooks
```

### GitHub Webhook Integration
```javascript
// GitHub webhook endpoint
POST https://your-domain.com/api/webhooks/github

// Headers required:
// X-Hub-Signature-256: sha256=<signature>
// X-GitHub-Event: push
```

### Build System Integration
```bash
# In your build process
curl -X POST https://your-domain.com/api/auto-register/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUILD_TOKEN" \
  -d '{"files": ["script1.js", "script2.py"]}'
```

### Admin Feature Factory
Powers the `admin:discover` command for intelligent script discovery during feature development:

```bash
# Automatically discovers relevant scripts during feature planning
pnpm admin:feature "user-management"
# Uses script inventory to suggest relevant existing scripts
```

## 📊 Current Status - Phase 2 COMPLETED ✅

### ✅ Completed Features

#### Phase 1 - Core Infrastructure
- **Package Setup**: TypeScript package with dependencies ✅
- **TypeScript Migration**: All 8 JS files converted to TypeScript ✅  
- **REST API**: Express server with comprehensive endpoints ✅
- **CLI Preservation**: Backward compatible CLI interface ✅
- **Testing Infrastructure**: Vitest setup with unit/integration tests ✅
- **Build System**: tsup configuration with CJS/ESM outputs ✅

#### Phase 2 - Auto-Registration System
- **Configuration Management**: Multi-source configuration loading ✅
- **Pre-commit Hooks**: Git integration with validation blocking ✅
- **File Watching**: Real-time monitoring with intelligent batching ✅
- **Webhook System**: GitHub, build, and external tool integration ✅
- **Validation Pipeline**: Advanced documentation analysis ✅
- **CLI Enhancement**: Complete auto-registration command suite ✅
- **API Extensions**: Bulk registration and webhook endpoints ✅

### 🎯 Next Phase
**Phase 3**: Web Dashboard UI (Planned)
- React components for script inventory browsing
- Visual dependency graphs and quality metrics
- Administrative interfaces for configuration
- Real-time monitoring dashboards

## 🎪 Usage Examples

### Basic Script Registration
```bash
# Register a single script
script-inventory register ./my-script.js

# Validate documentation quality
script-inventory validate ./my-script.js
```

### Auto-Registration Workflow
```bash
# Start file watching in development
script-inventory watch --verbose

# Validate entire directory with reporting
script-inventory auto-validate scripts/ --recursive --report

# Check system status
script-inventory status
```

### API Usage
```javascript
import { ScriptInventory, ValidationPipeline } from '@ifla/script-inventory';

// Initialize inventory
const inventory = new ScriptInventory();
await inventory.initialize();

// Register script
const result = await inventory.registerScript({ path: './script.js' });

// Validate with auto-registration system
const pipeline = new ValidationPipeline(config);
const validation = await pipeline.validateScript('./script.js');
```

### Git Hook Integration
```bash
# Test pre-commit hook
script-inventory test-hook

# Configure validation mode
script-inventory config set --mode strict --min-score 80

# Emergency bypass (use sparingly)
SCRIPT_INVENTORY_BYPASS=true git commit -m "Emergency fix"
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Maintain >80% test coverage  
3. Update documentation
4. Test CLI backward compatibility
5. Validate auto-registration features

## 📚 Documentation

- **System PRD**: `SCRIPT_INVENTORY_SYSTEM_PRD.md` - Complete system requirements
- **Phase 2 Plan**: `PHASE_2_IMPLEMENTATION_PLAN.md` - Auto-registration architecture
- **Implementation Summary**: `PHASE_2_IMPLEMENTATION_SUMMARY.md` - Completed features
- **API Documentation**: Available at `/api` endpoint when server running

## 🔗 Related Projects

- **IFLA Standards Platform**: Main documentation platform
- **Admin Feature Factory**: Uses script inventory for feature discovery
- **Build System Integration**: Nx build process integration

## 📄 License

MIT - Part of the IFLA Standards Development Platform

---

## 🎉 Ready for Production

The Script Inventory System with Auto-Registration is now ready for production deployment. It provides a complete, automated solution for script management with:

- **Zero Manual Maintenance**: Scripts register automatically
- **Quality Enforcement**: Configurable documentation validation  
- **Seamless Integration**: Works with existing development workflows
- **Production Ready**: Comprehensive error handling and monitoring

**Next Steps**: Deploy to production and begin Phase 3 (Web Dashboard) development.