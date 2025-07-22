# RDF to CSV Conversion Tools

## Overview

This package provides two scripts for converting RDF files to CSV format:

1. **`rdf-to-csv.ts`** - Converts individual RDF files to CSV
2. **`rdf-folder-to-csv.ts`** - Batch converts entire directory structures

Both tools support intelligent namespace prefix handling, multilingual properties with repeatability based on DCTAP profiles, and multiple RDF formats including Turtle, N-Triples, RDF/XML, and JSON-LD.

## Table of Contents

- [Installation](#installation)
- [Single File Converter](#single-file-converter)
  - [Basic Usage](#basic-usage)
  - [Command-Line Options](#command-line-options)
  - [Examples](#examples)
- [Batch Conversion Tool](#batch-conversion-tool)
  - [Usage](#usage)
  - [Command-Line Options](#command-line-options-1)
  - [Default Output Directory](#default-output-directory)
  - [Examples](#examples-1)
  - [Features](#features)
- [Supported RDF Formats](#supported-rdf-formats)
- [Features](#features-1)
- [Troubleshooting](#troubleshooting)
- [Extending the Tool](#extending-the-tool)

## Installation

The scripts are located in `/scripts/` and require the following dependencies:

```bash
yarn add n3 csv-parse csv-stringify commander @types/n3 jsonld @types/jsonld rdfxml-streaming-parser glob @types/glob chalk ora
yarn add -D tsx  # For running TypeScript files directly
```

## Single File Converter

### Basic Usage

```bash
yarn rdf:to-csv <rdf-file> [options]
```

Or directly:

```bash
tsx scripts/rdf-to-csv.ts <rdf-file> [options]
```

### Command-Line Options

- `-p, --profile <dctap-file>`: Path to DCTAP profile CSV file (optional)
- `-o, --output <output-file>`: Output CSV file path (default: stdout)
- `-f, --format <format>`: Force RDF format (auto-detected by default)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

### Examples

1. **Basic conversion to stdout:**
   ```bash
   yarn rdf:to-csv /path/to/file.ttl
   ```

2. **Save to file:**
   ```bash
   yarn rdf:to-csv /path/to/file.ttl -o output.csv
   ```

3. **Use DCTAP profile:**
   ```bash
   yarn rdf:to-csv /path/to/file.ttl -p profile.csv -o output.csv
   ```

4. **Real-world examples:**
   ```bash
   # Turtle format
   yarn rdf:to-csv /Users/jonphipps/Code/isbd/ttl/ns/isbd/elements.ttl -o isbd-elements.csv
   
   # N-Triples format
   yarn rdf:to-csv /Users/jonphipps/Code/isbd/nt/ns/isbd/elements.nt -o isbd-elements.csv
   
   # RDF/XML format
   yarn rdf:to-csv /Users/jonphipps/Code/isbd/xml/ns/isbd/elements.xml -o isbd-elements.csv
   
   # JSON-LD format
   yarn rdf:to-csv /Users/jonphipps/Code/isbd/jsonld/ns/isbd/elements.jsonld -o isbd-elements.csv
   
   # Force format detection
   yarn rdf:to-csv data.rdf -f application/rdf+xml -o output.csv
   ```

## Batch Conversion Tool

The `rdf-folder-to-csv.ts` script recursively converts all RDF files in a directory structure to CSV format, preserving the folder hierarchy.

### Usage

```bash
yarn rdf:folder-to-csv <source-dir> [output-dir] [options]
```

### Command-Line Options

- `-p, --profile <dctap-file>`: Path to DCTAP profile CSV file
- `-d, --dry-run`: Show what would be converted without actually converting
- `-v, --verbose`: Show detailed progress information
- `-e, --extensions <exts>`: Comma-separated list of file extensions to process
- `-h, --help`: Display help information
- `-V, --version`: Display version information

### Default Output Directory

The tool intelligently determines the default output directory:
- If source directory ends with `/ttl`, it replaces it with `/csv`
- Otherwise, it adds `_csv` suffix to the source directory name

### Examples

1. **Basic batch conversion:**
   ```bash
   # Converts /path/to/ttl/* to /path/to/csv/*
   yarn rdf:folder-to-csv /path/to/ttl
   ```

2. **Specify output directory:**
   ```bash
   yarn rdf:folder-to-csv /path/to/rdf /path/to/output
   ```

3. **Dry run to preview:**
   ```bash
   yarn rdf:folder-to-csv /path/to/ttl --dry-run
   ```

4. **Verbose output with progress:**
   ```bash
   yarn rdf:folder-to-csv /path/to/ttl --verbose
   ```

5. **With DCTAP profile:**
   ```bash
   yarn rdf:folder-to-csv /path/to/ttl -p profile.csv
   ```

6. **Custom file extensions:**
   ```bash
   # Only process .ttl and .rdf files
   yarn rdf:folder-to-csv /path/to/mixed -e ".ttl,.rdf"
   ```

7. **Real-world example:**
   ```bash
   # Convert ISBD vocabularies
   yarn rdf:folder-to-csv /Users/jonphipps/Code/ISBDM/static/vocabs/ttl
   # Output: /Users/jonphipps/Code/ISBDM/static/vocabs/csv/
   ```

### Features

- **Recursive processing**: Finds all RDF files in subdirectories
- **Structure preservation**: Maintains the same folder hierarchy in output
- **Progress reporting**: Shows real-time conversion progress
- **Error handling**: Continues processing even if individual files fail
- **Summary statistics**: Reports success/failure counts
- **Flexible extensions**: Configurable file type filtering

## Supported RDF Formats

The tool automatically detects RDF format based on file extension:

| Extension | Format | MIME Type | Support Level |
|-----------|--------|-----------|---------------|
| `.ttl`, `.turtle` | Turtle | `text/turtle` | Full |
| `.n3` | Notation3 | `text/n3` | Full |
| `.nt`, `.ntriples` | N-Triples | `application/n-triples` | Full |
| `.rdf`, `.xml`, `.owl` | RDF/XML | `application/rdf+xml` | Full |
| `.jsonld`, `.json` | JSON-LD | `application/ld+json` | Full* |

*JSON-LD files that reference remote contexts will use local fallback context files if available. The tool includes context files for common vocabularies in `static/data/contexts/`.

## Features

### 1. Dynamic Namespace Prefix Extraction

The tool automatically extracts namespace prefixes from:
- `@prefix` declarations in the RDF file
- Intelligent inference from URI patterns in the data

### 2. Intelligent Namespace Inference

The script uses a tree-based algorithm to infer namespace prefixes when not explicitly declared:

1. **Builds a URI segment tree** from all URIs in the RDF data
2. **Identifies namespace boundaries** by analyzing:
   - Branching points in the URI structure
   - Frequency of URI patterns
   - Common namespace indicators (ns, vocab, onto, schema)
3. **Prioritizes namespaces** based on depth and frequency
4. **Generates readable prefixes** from URI segments

Example inference:
- `http://iflastandards.info/ns/isbd/` → `isbd:`
- `http://iflastandards.info/ns/isbd/elements/P1001` → `isbd:elements/P1001`
- `http://iflastandards.info/ns/isbd/unc/elements/P1001` → `isbd:unc/elements/P1001`

### 3. Multilingual Property Support

Properties with language tags are handled with separate columns:
- `skos:definition@en` - English definition
- `skos:definition@es` - Spanish definition
- Properties without language tags have no suffix

### 4. Repeatable Property Handling

Repeatable properties (as defined in DCTAP or defaults) use indexed columns:
- `skos:definition@en[0]` - First English definition
- `skos:definition@en[1]` - Second English definition
- `rdfs:label@es[0]` - First Spanish label
- `rdfs:label@es[1]` - Second Spanish label

Default repeatable properties:
- `skos:definition`
- `skos:scopeNote`
- `rdfs:label`

### 5. CSV Output Format

The CSV output includes:
- **First column**: Resource URI (as CURIE if possible)
- **Subsequent columns**: Property values with headers indicating property, language, and index
- **All URIs converted to CURIEs** where possible for readability

## DCTAP Profile Format

The DCTAP profile should be a CSV file with at least these columns:

| propertyID | repeatable |
|------------|------------|
| skos:definition | true |
| rdfs:label | true |
| dcterms:title | false |

The `repeatable` column accepts: `true`, `yes`, `1` (case-insensitive) for repeatable properties.

Example DCTAP profile:
```csv
shapeID,shapeLabel,propertyID,propertyLabel,mandatory,repeatable,valueDataType,valueShape,valueConstraint,valueConstraintType,note
,,skos:definition,Definition,false,true,,,,,
,,rdfs:label,Label,true,true,,,,,
,,dcterms:created,Date Created,false,false,xsd:date,,,,
```

## Algorithm Details

### Namespace Inference Algorithm

The namespace inference works in multiple phases:

1. **Tree Construction Phase:**
   - Parse all URIs into a hierarchical tree structure
   - Track frequency of each path segment

2. **Candidate Identification Phase:**
   - Identify potential namespace boundaries based on:
     - Multiple child branches (indicating a common parent)
     - High frequency (used by many resources)
     - Namespace indicators in path segments
     - Reasonable depth (2-5 segments)

3. **Scoring and Selection Phase:**
   - Score candidates: `score = frequency × log(depth + 1)`
   - Higher scores indicate better namespace candidates
   - Avoid overlapping namespaces

4. **Prefix Generation Phase:**
   - Extract meaningful prefix from last segment
   - Ensure no prefix conflicts

### CSV Generation Process

1. **Resource Extraction:**
   - Identify all unique subject URIs
   - Group properties by subject

2. **Header Generation:**
   - Count all property-language combinations
   - Determine maximum occurrences for repeatable properties
   - Generate indexed headers for repeatable properties

3. **Row Generation:**
   - Convert resource URIs to CURIEs
   - Map property values to appropriate columns
   - Handle language tags and indices correctly

## Output Example

Given this RDF:
```turtle
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://example.org/concept/123>
    rdfs:label "Example"@en ;
    rdfs:label "Ejemplo"@es ;
    skos:definition "First definition"@en ;
    skos:definition "Second definition"@en ;
    skos:definition "Definición"@es .
```

The CSV output would be:
```csv
uri,rdfs:label@en,rdfs:label@es,skos:definition@en[0],skos:definition@en[1],skos:definition@es
ex:concept/123,Example,Ejemplo,First definition,Second definition,Definición
```

## Troubleshooting

### Common Issues

1. **Missing prefixes in output:**
   - Check if the RDF file contains `@prefix` declarations
   - The inference algorithm needs sufficient data to detect patterns
   - Manually add prefixes to the DEFAULT_PREFIXES in the script if needed

2. **Properties not marked as repeatable:**
   - Provide a DCTAP profile with the `-p` option
   - Or modify the default repeatable properties in the script

3. **Memory issues with large files:**
   - The script loads the entire RDF file into memory
   - Consider splitting large files or increasing Node.js memory limit

4. **JSON-LD remote context errors:**
   - Ensure local context files exist in `static/data/contexts/`
   - Check that the context file name matches the expected pattern
   - Verify the local context file contains proper JSON-LD context definitions

### Debugging

Run with stderr to see inference information:
```bash
yarn rdf:to-csv input.ttl -o output.csv 2> debug.log
```

The debug output shows:
- Extracted prefixes from the RDF file
- Inferred namespace prefixes
- Number of resources found

## Extending the Tool

### Adding Additional RDF Format Support

To add support for new RDF formats:

1. **Update format detection** in `detectRdfFormat()`:
   ```typescript
   const formatMap: Record<string, string> = {
     '.newext': 'application/new-format',
     // ... existing formats
   };
   ```

2. **Add parser support**:
   - For formats supported by N3.js: Update the `format` parameter
   - For other formats: Add a new parser library and handle in `parseRdfFile()`

3. **Handle format-specific requirements**:
   - Namespace extraction
   - Special parsing considerations
   - Error handling

### JSON-LD Context Files

The tool automatically handles JSON-LD files that reference remote contexts by using local fallback context files. When a JSON-LD file references a remote context URL that is unavailable, the tool will:

1. Detect the remote context URL (e.g., `http://metadataregistry.org/uri/schema/Contexts/elements_langmap.jsonld`)
2. Load the corresponding local context file from `static/data/contexts/`
3. Use the local context to properly parse the JSON-LD data

Available local context files:
- `elements_langmap.jsonld` - For RDFS/OWL elements (metadataregistry.org element sets)
- `concepts_langmap.jsonld` - For SKOS concepts (metadataregistry.org concept schemes)

These context files define the necessary mappings for custom properties used in metadata registry JSON-LD files, ensuring proper conversion even when remote contexts are unavailable.

### Custom Namespace Inference

To customize namespace detection:
1. Modify the `namespaceIndicators` array
2. Adjust scoring algorithm in `inferNamespaceFromURIs()`
3. Change depth limits or frequency thresholds

### Additional Output Formats

The tool could be extended to support:
- JSON-LD output
- Direct database insertion
- Custom delimiters or quoting styles