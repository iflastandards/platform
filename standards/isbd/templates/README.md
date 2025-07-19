# ISBD Documentation Templates

This directory contains templates for generating ISBD documentation from CSV data.

## Templates

- **element.mdx** - Template for RDF elements (properties and classes)
- **vocabulary.mdx** - Template for controlled vocabularies
- **element-index.mdx** - Template for category overview pages
- **config.json** - Configuration for CSV mapping and generation

## Quick Start

To generate documentation from CSV:

```bash
# From repository root
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=element
```

## Editing Templates

Templates use MDX format with:
- YAML frontmatter for metadata
- React components for dynamic content
- Placeholder text marked with `[To be completed: ...]`

## TinaCMS Integration

These templates are designed to work with TinaCMS forms:
- All fields are present (even if empty)
- Consistent structure for form binding
- CSV data populates initial values
- Editors fill in documentation sections

See `/developer_notes/TEMPLATE_SYSTEM.md` for complete documentation.