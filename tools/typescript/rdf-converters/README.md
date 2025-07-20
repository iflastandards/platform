# @ifla/rdf-converters

RDF to CSV conversion tools with DCTAP (Dublin Core Tabular Application Profiles) support for the IFLA Standards Development Platform.

## Overview

This package provides tools to convert RDF data (in various formats) to CSV format using DCTAP profiles. It supports IFLA's extended DCTAP specification including:

- Mandatory field markers (`*`)
- Language-tagged properties
- Repeatable value formats (array and CSV)
- Registry properties
- Multilingual content

## Installation

```bash
pnpm install
```

## Usage

### Convert a Single RDF File

```bash
pnpm rdf-to-csv -i input.ttl -o output.csv -p profile.csv
```

Options:
- `-i, --input`: Input RDF file (required)
- `-o, --output`: Output CSV file (required)
- `-p, --profile`: DCTAP profile CSV file (optional)
- `-f, --format`: RDF format (auto-detected if not specified)
- `-s, --subjects`: Filter by subject URI patterns
- `-t, --types`: Filter by RDF types
- `-v, --verbose`: Enable verbose logging

### Convert a Folder of RDF Files

```bash
pnpm rdf-folder-to-csv -s source-dir -o output-dir -p profile.csv
```

Options:
- `-s, --source`: Source directory containing RDF files (required)
- `-o, --output`: Output directory for CSV files (required)
- `-p, --profile`: DCTAP profile CSV file (optional)
- `-d, --dry-run`: Show what would be done without doing it
- `-v, --verbose`: Enable verbose logging

## Supported RDF Formats

- Turtle (`.ttl`)
- JSON-LD (`.jsonld`)
- RDF/XML (`.rdf`, `.xml`)
- N-Triples (`.nt`)
- N-Quads (`.nq`)

## DCTAP Extensions

This implementation supports IFLA's DCTAP extensions:

### Mandatory Fields
Mark required fields with `*` prefix:
```csv
propertyID,propertyLabel,mandatory
*rdfs:label@en,Label (English),TRUE
```

### Language Tags
Specify language-tagged properties:
```csv
propertyID,propertyLabel
skos:prefLabel@en,Preferred Label (English)
skos:prefLabel@fr,Preferred Label (French)
```

### Repeatable Values

Array format for complex literals:
```csv
skos:definition@en[0],skos:definition@en[1]
```

CSV format for URIs and simple values:
```csv
skos:broader[csv]
"uri1;uri2;uri3"
```

## Development

```bash
# Build
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Pipeline Integration

This package is designed to work as part of the larger RDF → CSV → Google Sheets → MDX pipeline.

### RDF to MDX Pipeline

The complete pipeline for generating documentation from RDF data:

```bash
# Convert RDF to CSV and generate MDX documentation
pnpm rdf-to-mdx \
  --rdf path/to/input.ttl \
  --profile path/to/profile.csv \
  --standard isbd \
  --type element
```

This command:
1. Converts RDF to CSV using the DCTAP profile
2. Places the CSV in the standard's expected location
3. Runs the template population script to generate MDX files

Options:
- `-r, --rdf`: Input RDF file (required)
- `-p, --profile`: DCTAP profile CSV file (optional)
- `-s, --standard`: Standard name like isbd, lrm, frbr (required)
- `-t, --type`: Template type like element, vocabulary (required)
- `-v, --verbose`: Enable verbose logging
- `-d, --dry-run`: Show what would be done without executing

### Manual Pipeline Steps

You can also run each step separately:

1. **RDF to CSV conversion**:
   ```bash
   pnpm rdf-to-csv -i input.ttl -o output.csv -p profile.csv
   ```

2. **CSV to MDX generation** (using existing template system):
   ```bash
   pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=element
   ```

### Integration with Google Sheets

For collaborative editing workflow:
1. Convert RDF to CSV
2. Upload to Google Sheets
3. Edit collaboratively
4. Download updated CSV
5. Generate MDX from CSV

See the main project documentation for complete workflow details.

### Example Workflow

Here's a complete example converting ISBD elements from RDF to MDX documentation:

```bash
# 1. Convert RDF to MDX documentation (all-in-one)
pnpm rdf-to-mdx \
  --rdf data/isbd/elements.ttl \
  --profile profiles/isbd-elements.csv \
  --standard isbd \
  --type element \
  --verbose

# 2. Or use dry-run to preview what will happen
pnpm rdf-to-mdx \
  --rdf data/isbd/elements.ttl \
  --profile profiles/isbd-elements.csv \
  --standard isbd \
  --type element \
  --dry-run \
  --verbose

# 3. For collaborative editing, generate CSV only
pnpm rdf-to-csv \
  -i data/isbd/elements.ttl \
  -o standards/isbd/csv/ns/isbd/elements.csv \
  -p profiles/isbd-elements.csv

# 4. After editing in Google Sheets, generate MDX
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=element
```

## License

MIT