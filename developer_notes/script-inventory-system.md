# Script Inventory System Documentation

## Overview

The Script Inventory System is a comprehensive tool for cataloging, analyzing, and managing all scripts in the IFLA Standards repository. It addresses the need to track hundreds of scripts, prevent duplication, ensure documentation, and understand script dependencies and usage.

## System Architecture

```
scripts/script-inventory/
├── analyze-fixed.js      # Main analysis engine
├── query.js              # Query and export tool
├── ai-enhance.js         # AI-powered enhancement
├── README.md             # Quick start guide
├── lib/
│   ├── db-cli.js        # Database interface using SQLite CLI
│   ├── parser.js        # Script content parser
│   ├── extractors.js    # Metadata extractors
│   └── migrations/      # Database schema migrations
│       ├── 001-initial-schema.sql
│       ├── 002-full-text-search.sql
│       └── 003-views.sql
└── output/
    └── script-inventory/
        └── inventory.db  # SQLite database
```

## Components

### 1. Analysis Engine (`analyze-fixed.js`)

The core component that discovers and analyzes scripts throughout the repository.

**Capabilities:**
- Discovers scripts in multiple languages (JavaScript, TypeScript, Python, Shell)
- Extracts metadata through pattern matching
- Detects CLI arguments, dependencies, and test tags
- Identifies deprecated scripts
- Calculates documentation scores

**Usage:**
```bash
cd scripts/script-inventory
node analyze-fixed.js --dirs ../../scripts,../../tools --verbose
```

**Options:**
- `--dirs DIR1,DIR2` - Directories to scan (default: scripts,tools)
- `--verbose, -v` - Show detailed progress
- `--min-doc-score N` - Minimum documentation score threshold
- `--output PATH` - Custom database path

### 2. Parser Module (`lib/parser.js`)

Extracts structured information from script content using regex patterns.

**Extracted Information:**
- Documentation comments (JSDoc, Python docstrings, shell comments)
- Purpose/description from comments
- CLI arguments (yargs, commander, argparse, process.argv)
- Dependencies (imports, requires)
- Function definitions
- Environment variables
- Test tags (@unit, @integration, @e2e, etc.)
- Shebang lines
- Error handling patterns

**Pattern Categories:**
```javascript
patterns = {
  docComment: /\/\*\*([\s\S]*?)\*\//g,
  cliArgs: {
    yargs: /\.option\(['"]([^'"]+)['"],\s*{([^}]+)}/g,
    commander: /\.option\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/g,
  },
  testTags: /@(unit|integration|e2e|smoke|slow|flaky|skip)\b/gi,
  deprecated: /@deprecated|DEPRECATED|This script is deprecated/gi
}
```

### 3. Database Layer (`lib/db-cli.js`)

SQLite database interface using the system's sqlite3 CLI tool.

**Features:**
- Automated migrations
- Parameterized queries
- Transaction support
- Full-text search capability (disabled currently)
- Temp file approach for complex queries

**Database Schema:**

```sql
-- Main scripts table
scripts (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE,           -- Relative path to script
  name TEXT,                  -- Filename
  type TEXT,                  -- javascript|typescript|python|shell
  purpose TEXT,               -- Extracted description
  file_hash TEXT,             -- SHA256 for change detection
  file_size INTEGER,
  is_cli BOOLEAN,            -- Accepts CLI arguments
  is_test BOOLEAN,           -- Test file
  is_deprecated BOOLEAN,     -- Marked as deprecated
  has_help_option BOOLEAN,   -- Has --help
  last_modified DATETIME,
  last_analyzed DATETIME
)

-- CLI options for scripts
cli_options (
  script_id INTEGER,
  option_name TEXT,          -- e.g., --verbose
  option_alias TEXT,         -- e.g., -v
  description TEXT,
  required BOOLEAN
)

-- Script tags
tags (
  script_id INTEGER,
  tag TEXT,                  -- Tag value
  tag_type TEXT              -- category|test|custom
)

-- Dependencies
dependencies (
  script_id INTEGER,
  dependency TEXT,           -- Package/module name
  dependency_type TEXT       -- npm|local|builtin
)

-- Package.json references
package_json_scripts (
  script_id INTEGER,
  npm_script_name TEXT,      -- Script name in package.json
  command TEXT,              -- Full command
  package_json_path TEXT
)
```

### 4. Query Tool (`query.js`)

Provides search, filter, and export capabilities for the inventory.

**Commands:**
```bash
# Statistics
node query.js stats

# Search
node query.js search <keyword>

# Filter by type
node query.js type javascript|typescript|python|shell

# Filter by category
node query.js category test|build|utility

# List CLI scripts
node query.js cli

# List deprecated scripts
node query.js deprecated

# Get details
node query.js details <path>

# Export
node query.js all --export csv|markdown|json --output file
```

**Export Formats:**
- **CSV**: For spreadsheet analysis
- **Markdown**: Human-readable documentation
- **JSON**: Machine-readable for integration

### 5. AI Enhancement (`ai-enhance.js`)

Improves script metadata using pattern matching and heuristics.

**Enhancement Process:**
1. Identifies scripts with poor/missing documentation
2. Analyzes content patterns
3. Generates purpose descriptions
4. Detects script categories
5. Identifies CLI tools and test files
6. Updates database with improvements

**Heuristics:**
- Filename patterns (test-, validate-, build-, etc.)
- Content patterns (describe(), webpack, process.argv)
- Import patterns (testing libraries, build tools)
- Comment keywords (deprecated, obsolete)

**Usage:**
```bash
node ai-enhance.js --verbose
```

### 6. Documentation Validator (`../validate-script-docs.js`)

Pre-commit hook ensuring new scripts have proper documentation.

**Validation Rules:**
1. Documentation comment at file top
2. Purpose or description present
3. Documentation reference (Documentation: path/to/docs.md)
4. CLI scripts must have --help option
5. Deprecated scripts need deprecation notice
6. Test files require test tags

**Integration with Git Hooks:**
```bash
# Add to .husky/pre-commit or .git/hooks/pre-commit
node scripts/validate-script-docs.js || exit 1
```

## Workflow

### Initial Setup
```bash
cd scripts/script-inventory

# Initialize database
node -e "const DB = require('./lib/db-cli'); const db = new DB(); db.migrate()"

# Run initial analysis
node analyze-fixed.js --dirs ../../scripts,../../tools

# Enhance with AI
node ai-enhance.js

# Check results
node query.js stats
```

### Regular Updates
```bash
# Re-analyze after adding new scripts
node analyze-fixed.js

# Query specific information
node query.js search build
node query.js type typescript

# Export for documentation
node query.js all --export markdown --output ../../docs/script-inventory.md
```

### Pre-commit Validation
```bash
# Validate staged scripts
node scripts/validate-script-docs.js
```

## Use Cases

### 1. Find Existing Functionality
Before creating a new script, search for existing ones:
```bash
node query.js search "validate links"
node query.js search "build"
```

### 2. Identify Deprecated Scripts
Find and clean up obsolete scripts:
```bash
node query.js deprecated
```

### 3. Document Test Coverage
Export all test scripts:
```bash
node query.js category test --export csv --output tests.csv
```

### 4. Analyze CLI Tools
List all command-line tools:
```bash
node query.js cli
```

### 5. Generate Documentation
Create comprehensive script documentation:
```bash
node query.js all --export markdown --output script-docs.md
```

## Troubleshooting

### Common Issues

**Database Errors**
```bash
# Reset database
rm -f output/script-inventory/inventory.db
node -e "const DB = require('./lib/db-cli'); const db = new DB(); db.migrate()"
node analyze-fixed.js
```

**Path Resolution Issues**
- Scripts in `tools/` are stored with relative paths (`../../tools/`)
- The ai-enhance.js handles path resolution automatically
- Query tool uses paths as stored in database

**Analysis Errors**
- Some scripts may fail due to syntax issues
- Errors are logged but don't stop analysis
- Check error summary at end of analysis

**SQL Injection Protection**
- Database uses parameterized queries
- Special characters are escaped
- Temp files used for complex queries

## Performance Considerations

- Initial analysis: ~30-60 seconds for 400 scripts
- Database size: ~500KB for 400 scripts
- Query response: &lt;100ms for most queries
- Export generation: &lt;1 second for all formats

## Future Enhancements

### Planned Features
- [ ] Real AI integration (OpenAI/Anthropic) for better purpose extraction
- [ ] Web UI for browsing inventory
- [ ] Duplicate detection algorithm
- [ ] Dependency graph visualization
- [ ] Integration with VSCode extension
- [ ] Automatic documentation generation
- [ ] Change tracking and history

### Integration Opportunities
- **CI/CD Pipeline**: Validate all scripts in PR checks
- **Documentation Site**: Auto-generate script reference pages
- **IDE Integration**: Quick script search and navigation
- **Metrics Dashboard**: Script health and documentation coverage

## API Reference

### ScriptAnalyzer Class
```javascript
const analyzer = new ScriptAnalyzer({
  rootDir: process.cwd(),
  dbPath: 'custom/path/inventory.db',
  scriptDirs: ['scripts', 'tools'],
  filePatterns: ['**/*.js', '**/*.ts'],
  minDocScore: 50,
  verbose: true
});

await analyzer.analyze();
```

### ScriptQuery Class
```javascript
const query = new ScriptQuery({
  dbPath: 'custom/path/inventory.db'
});

// Search
const results = await query.search('test');

// Filter
const jsScripts = await query.filterByType('javascript');

// Export
const csv = await query.exportToCsv(results);
```

### AIEnhancer Class
```javascript
const enhancer = new AIEnhancer({
  dbPath: 'custom/path/inventory.db',
  rootDir: '/path/to/repo'
});

await enhancer.enhance({ verbose: true });
```

## Contributing

### Adding New Patterns
Edit `lib/parser.js` to add new extraction patterns:
```javascript
this.patterns.myPattern = /new-pattern/g;
```

### Extending Database Schema
Add migration files to `lib/migrations/`:
```sql
-- 004-new-feature.sql
ALTER TABLE scripts ADD COLUMN new_field TEXT;
```

### Improving AI Enhancement
Edit `ai-enhance.js` to add new heuristics:
```javascript
if (name.includes('new-pattern')) {
  analysis.category = 'new-category';
}
```

## Related Documentation

- Quick Start: `scripts/script-inventory/README.md`
- Database Schema: `scripts/script-inventory/lib/migrations/001-initial-schema.sql`
- Validation Rules: Run `node scripts/validate-script-docs.js --help`

## Support

For issues or questions:
1. Check this documentation
2. Run with `--verbose` flag for detailed output
3. Check error logs in analysis output
4. Review database directly: `sqlite3 output/script-inventory/inventory.db`

---

*Last updated: August 2024*
*Version: 1.0.0*