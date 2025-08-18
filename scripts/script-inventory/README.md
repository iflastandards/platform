# Script Inventory System

A comprehensive inventory system for cataloging and managing all scripts in the IFLA Standards repository.

📚 **Full Documentation**: See [developer_notes/script-inventory-system.md](../../developer_notes/script-inventory-system.md) for detailed technical documentation, architecture, and API reference.

## Overview

This system provides:
- Automatic discovery and analysis of all scripts (JavaScript, TypeScript, Python, Shell)
- Extraction of metadata including purpose, CLI options, dependencies, and tags
- SQLite database storage for efficient querying
- Search, filter, and export capabilities
- Pre-commit validation support (coming soon)

## Installation

The script inventory system is self-contained and requires no additional dependencies beyond what's already in the repository.

## Usage

### 1. Run Script Analysis

Analyze all scripts in the repository and build the inventory database:

```bash
cd scripts/script-inventory
node analyze-fixed.js --dirs ../../scripts,../../tools
```

Options:
- `--verbose, -v` - Show detailed progress
- `--min-doc-score N` - Minimum documentation score (default: 50)
- `--output PATH` - Database output path
- `--dirs DIR1,DIR2` - Directories to scan (default: scripts,tools)

### 2. Query the Inventory

Use the query tool to search, filter, and export the inventory:

```bash
# Show statistics
node query.js stats

# Search by keyword
node query.js search test

# Filter by type
node query.js type typescript

# List CLI scripts
node query.js cli

# List deprecated scripts
node query.js deprecated

# Get script details
node query.js details ../build.js

# Export to different formats
node query.js all --export csv --output inventory.csv
node query.js all --export markdown --output inventory.md
node query.js all --export json --output inventory.json
```

## Database Schema

The inventory is stored in SQLite with the following tables:

### scripts
- `path` - Relative path to the script
- `name` - Script filename
- `type` - javascript, typescript, python, or shell
- `purpose` - Extracted purpose/description
- `file_hash` - SHA256 hash for change detection
- `file_size` - File size in bytes
- `is_cli` - Whether it accepts CLI arguments
- `is_test` - Whether it's a test file
- `is_deprecated` - Whether it's marked as deprecated
- `has_help_option` - Has --help option
- `has_man_option` - Has --man option
- `last_modified` - File modification time
- `last_analyzed` - When the script was analyzed

### cli_options
Stores command-line options for CLI scripts:
- `option_name` - Option name (e.g., --verbose)
- `option_alias` - Short alias (e.g., -v)
- `description` - Option description
- `required` - Whether the option is required

### tags
Script tags for categorization:
- `tag` - Tag value
- `tag_type` - category, test, or custom

### dependencies
Script dependencies:
- `dependency` - Package or module name
- `dependency_type` - npm, local, or builtin

### package_json_scripts
References from package.json:
- `npm_script_name` - Script name in package.json
- `command` - Full command string
- `package_json_path` - Path to package.json

## Data Collected

For each script, the system analyzes and extracts:

1. **Location and name** - Full path and filename
2. **Purpose** - Extracted from comments, docstrings, or usage messages
3. **CLI options** - Command-line arguments and their descriptions
4. **Documentation** - Presence of internal comments or external docs
5. **Package.json references** - NPM scripts that invoke this script
6. **Tags** - Test tags (@unit, @integration, etc.) and categories
7. **Execution context** - Local development or CI environment
8. **Deprecation status** - Marked as deprecated or obsolete

## Export Formats

The inventory can be exported in multiple formats:

### CSV
Suitable for spreadsheets and data analysis:
```csv
path,name,type,purpose,is_cli,is_test,is_deprecated,tags
scripts/build.js,build.js,javascript,"Build all projects",1,0,0,"build,utility"
```

### Markdown
Human-readable documentation format with grouped sections by type.

### JSON
Machine-readable format for integration with other tools.

## Future Enhancements

- [ ] AI-powered purpose extraction for undocumented scripts
- [ ] Pre-commit hook for documentation validation
- [ ] Web UI for browsing the inventory
- [ ] Duplicate detection and consolidation suggestions
- [ ] Integration with IDE plugins
- [ ] Automatic documentation generation

## Troubleshooting

### Database Errors
If you encounter database errors, delete the database and re-run the analysis:
```bash
rm -f output/script-inventory/inventory.db
node analyze-fixed.js
```

### Analysis Errors
Some scripts may fail to analyze due to syntax issues or special characters. These are logged but don't stop the analysis. Check the error output for details.

## Contributing

To improve the script inventory system:
1. Update the parser patterns in `lib/parser.js`
2. Add new extractors in `lib/extractors.js`
3. Extend the database schema in `lib/migrations/`
4. Add new query commands in `query.js`

## License

Part of the IFLA Standards Development Platform.