# IFLA Standards Template System

This document describes the template system used for generating documentation pages from CSV data for IFLA standards.

## Overview

The template system follows a CSV-first approach where:
1. RDF metadata is stored in CSV files
2. MDX templates provide structure with placeholders
3. Scripts populate templates from CSV data
4. TinaCMS allows editing the generated files
5. Documentation is progressively enhanced

## Directory Structure

```
standards/
├── {standard}/           # e.g., isbd, lrm, isbdm
│   ├── templates/       # Standard-specific templates
│   │   ├── element.mdx
│   │   ├── vocabulary.mdx
│   │   ├── element-index.mdx
│   │   └── config.json
│   ├── csv/            # Source data
│   │   └── ns/{standard}/elements.csv
│   └── docs/           # Generated documentation
│       ├── relationships/
│       ├── attributes/
│       ├── statements/
│       └── notes/
```

## Templates

### Element Template (`element.mdx`)

Used for all RDF elements (properties and classes). Features:
- Full ISBDM-compatible frontmatter structure
- Placeholders for CSV data population
- Sections for human-written documentation
- TinaCMS form compatibility

Key sections:
- **Frontmatter**: Navigation, identification, and RDF metadata
- **Element Reference**: Auto-displays RDF data from frontmatter
- **Documentation sections**: To be completed by editors

### Vocabulary Template (`vocabulary.mdx`)

Used for controlled vocabularies. Features:
- Vocabulary-specific frontmatter
- Concepts array for term definitions
- VocabularyTable component integration

### Element Index Template (`element-index.mdx`)

Used for category overview pages. Features:
- Simple structure for category documentation
- Placeholder for element listings
- Links to related categories

## Configuration (`config.json`)

Defines how CSV data maps to template fields:

```json
{
  "templates": {
    "element": {
      "csvMapping": {
        "id": { "source": "uri", "transform": "extractId" },
        "title": { "source": "rdfs:label@en" }
        // ... more mappings
      }
    }
  }
}
```

### Mapping Features:
- **source**: CSV column name
- **fallback**: Alternative column if primary is empty
- **default**: Value to use if no data available
- **transform**: Processing function to apply

## CSV Data Structure

The CSV files contain multilingual RDF data:

```csv
uri,rdfs:label@en,rdfs:label@es,skos:definition@en,rdfs:domain,rdfs:range,...
isbd:elements/P1001,has content form,tiene forma del contenido,"Relates a resource...",Resource,,
```

### Key CSV Columns:
- **uri**: Full URI of the element
- **rdfs:label@{lang}**: Labels in different languages
- **skos:definition@{lang}**: Definitions
- **rdfs:domain/range**: For properties
- **rdf:type**: Element type (Property, Class)
- **reg:hasSubproperty**: Sub-elements
- **rdfs:subPropertyOf**: Parent elements

## Population Script

`scripts/populate-from-csv.ts` reads CSV and generates MDX files:

```bash
# Generate element documentation for ISBD
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=element

# Generate vocabulary documentation
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=vocabulary
```

### Script Features:
- Reads standard-specific config
- Maps CSV columns to frontmatter fields
- Applies transformations
- Creates directory structure
- Generates MDX files with populated data

## API Access

Templates are accessible to the admin app for editing:

### Endpoints (to be implemented):
```
GET /api/templates/{standard}          # List available templates
GET /api/templates/{standard}/{type}   # Get specific template
POST /api/templates/generate           # Generate docs from CSV
PUT /api/docs/{standard}/{path}       # Update generated doc
```

## TinaCMS Integration

Generated MDX files are compatible with TinaCMS forms:
- All fields present in frontmatter (even if empty)
- Consistent structure across all elements
- Placeholder text for editors
- Support for multilingual content

## Workflow

1. **Initial Setup**:
   - Place CSV files in `standards/{standard}/csv/`
   - Ensure templates exist in `standards/{standard}/templates/`
   - Configure mappings in `config.json`

2. **Generation**:
   - Run population script
   - Review generated files
   - Commit to repository

3. **Enhancement**:
   - Editors use TinaCMS to add documentation
   - Fill in placeholder sections
   - Add examples and usage notes

4. **Maintenance**:
   - Update CSV when RDF changes
   - Re-run population script (preserves edits in documentation sections)
   - Version control tracks all changes

## Best Practices

1. **Always preserve editor content**: When re-generating from CSV, maintain human-written sections
2. **Use meaningful placeholders**: Help editors understand what content is needed
3. **Validate generated files**: Ensure all required fields are populated
4. **Test with small batches**: Verify output before full generation
5. **Document standard-specific variations**: Each standard may have unique requirements

## Extending the System

To add a new standard:
1. Create `standards/{new-standard}/templates/` directory
2. Copy templates from existing standard
3. Adjust `config.json` for specific mappings
4. Place CSV files in appropriate location
5. Run population script
6. Verify output

To add a new template type:
1. Create new template file
2. Add configuration to `config.json`
3. Update population script if needed
4. Document the new template type

## Troubleshooting

Common issues:
- **Missing data**: Check CSV column names match config
- **Malformed MDX**: Validate frontmatter YAML syntax
- **Wrong category**: Adjust category patterns in config
- **Transform errors**: Debug transform functions in script

## Future Enhancements

Planned improvements:
- Batch editing via admin API
- Automatic CSV updates from RDF sources
- Version tracking for elements
- Multilingual template support
- Advanced transformation functions
- Validation rules for required fields