# DCTAP Extensions Test Fixtures

This directory contains test fixtures for IFLA's DCTAP (Dublin Core Tabular Application Profiles) extensions. These extensions enhance standard DCTAP with features needed for managing multilingual vocabularies and element sets.

## DCTAP Extension Features

### 1. Mandatory Fields (`mandatory-fields/`)
- **Syntax**: `*propertyID` (e.g., `*skos:prefLabel`)
- **Purpose**: Mark properties as required for validation
- **Example**: `*rdf:type` ensures all resources have a type

### 2. Language Tags (`language-tags/`)
- **Syntax**: `propertyID@lang` (e.g., `skos:prefLabel@en`)
- **Purpose**: Create language-specific columns in CSV
- **Features**:
  - Mandatory languages via `@mandatoryLanguages` metadata row
  - `maxPerLanguage` constraint to limit values per language
  - Language-specific validation

### 3. Repeatable Array Format (`repeatable-array/`)
- **Syntax**: `propertyID[n]` (e.g., `skos:altLabel[0]`, `skos:altLabel[1]`)
- **Purpose**: Create fixed columns for first N values of repeatable properties
- **Features**:
  - Numbered columns for predictable CSV structure
  - Overflow handling (extra values are dropped)
  - Sparse array support (empty slots preserved)

### 4. Repeatable CSV Format (`repeatable-csv/`)
- **Syntax**: `propertyID[csv]` (e.g., `skos:altLabel[csv]`)
- **Purpose**: Store all values in a single column with semicolon delimiters
- **Features**:
  - Semicolon (`;`) as delimiter
  - Proper CSV escaping for values containing semicolons
  - More flexible than array format for unlimited values

### 5. Mixed Formats (`mixed-formats/`)
- **Purpose**: Demonstrate combining all extension features
- **Features**:
  - Mandatory + language tags (e.g., `*skos:prefLabel@en`)
  - Same property in both array and CSV formats
  - Postel's Law: liberal import, conservative export
  - Complex validation scenarios

### 6. Registry Properties (`registry-properties/`)
- **Purpose**: Support metadata registry properties
- **Common properties**:
  - `reg:status`: Publication status
  - `reg:identifier`: Registry ID
  - `dct:created`: Creation date
  - `dct:modified`: Modification date
  - `dct:creator`: Creator agent
  - `dct:contributor`: Contributors

## Test Structure

Each test directory contains:
- `profile.csv`: DCTAP profile with extension features
- `input.ttl`: RDF data to be converted
- `expected.csv`: Expected CSV output
- `expected-errors.json`: Expected validation errors (if any)
- `notes.md`: Detailed explanation of the test case

## Usage

These fixtures are used by the test suite to verify correct implementation of DCTAP extensions in the RDF to CSV converter.