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

This package is designed to work as part of the larger RDF → CSV → Google Sheets → MDX pipeline. See the main project documentation for complete workflow details.

## License

MIT