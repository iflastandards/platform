# Vocabulary Site Scaffolding Quick Reference

## Overview

The enhanced vocabulary site scaffolding system generates all necessary files referenced by the navigation sidebar, preventing "document ids do not exist" build errors. This quick reference guide provides essential commands and examples for using the system.

## Key Commands

### Generate Site Templates

```bash
# Generate templates for all sites
pnpm tsx scripts/page-template-generator.ts

# Generate templates for a specific site
pnpm tsx scripts/page-template-generator.ts --namespace=isbd

# Generate only missing files
pnpm tsx scripts/page-template-generator.ts --namespace=isbd --missing-only

# If command line options are not working, apply the fix
pnpm tsx scripts/fix-page-template-generator.ts
```

### Validate File Structure

```bash
# Validate a specific site
pnpm tsx scripts/validate-sidebar-references.ts standards/isbd

# Validate all sites
for site in standards/*; do
  if [ -d "$site" ]; then
    pnpm tsx scripts/validate-sidebar-references.ts "$site"
  fi
done
```

### Create New Site

```bash
# Create a new site with the scaffold script
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"

# Generate page templates for the new site
pnpm tsx scripts/page-template-generator.ts --namespace=newsite
```

## Generated Files

The system generates the following files:

| File Type | Path | Purpose |
|-----------|------|---------|
| Landing Page | `docs/index.mdx` | Overview of the standard |
| Element Sets Index | `docs/elements/index.mdx` | List of all element sets |
| Element Set Pages | `docs/elements/{element-set-id}/index.mdx` | Individual element set details |
| Vocabularies Index | `docs/vocabularies/index.mdx` | List of all vocabularies |
| Vocabulary Pages | `docs/vocabularies/{vocabulary-id}.mdx` | Individual vocabulary details |
| Documentation | `docs/introduction.mdx`, `docs/examples.mdx`, etc. | Standard documentation |
| Tools Pages | `docs/search.mdx`, `docs/cross-set-browser.mdx`, etc. | Tools & resources |

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Document ids do not exist" | Run validator to identify missing files |
| Missing files | Run generator with `--missing-only` flag |
| Duplicate files | Check for conflicting file paths |
| Sidebar references | Update sidebar or generate missing files |
| Command line options not working | Run `pnpm tsx scripts/fix-page-template-generator.ts` |

## Best Practices

1. Always validate after generation
2. Don't overwrite existing files
3. Follow the ISBD pattern
4. Use hierarchical navigation for complex standards
5. Include all required documentation pages

## Example Workflow

```bash
# 1. Create a new site
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"

# 2. Generate page templates
pnpm tsx scripts/page-template-generator.ts --namespace=newsite

# 3. Validate file structure
pnpm tsx scripts/validate-sidebar-references.ts standards/newsite

# 4. Start the site
pnpm start:newsite
```

For more detailed information, see the [Vocabulary Site Scaffolding Guide](./vocabulary-site-scaffolding-guide.md) and [Current Scaffolding Plan](../developer_notes/current-scaffolding-plan.md).