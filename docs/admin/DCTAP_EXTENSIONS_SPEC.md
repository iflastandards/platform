# DCTAP Extensions Specification

## Overview
This specification extends the Dublin Core Tabular Application Profiles (DCTAP) standard to support IFLA's metadata workflows, particularly for ISBD element sets and concept schemes.

## Core Extensions

### 1. Mandatory Column Markers
- **Syntax**: Prefix column headers with asterisk (`*`) for mandatory fields
- **Example**: `*rdfs:label@en` indicates a mandatory English label
- **Validation**: Asterisk columns must have non-empty values

### 2. Language-Tagged Properties
- **Syntax**: `namespace:property@language` (e.g., `skos:prefLabel@en`)
- **Special Rule**: `skos:prefLabel` - maximum one value per language
- **General Rule**: All other SKOS properties are repeatable within languages
- **Mandatory Languages**: Configurable per namespace/vocabulary (defaults to English)

### 3. Repeatable Value Formats

#### Array Format (for literals)
- **Syntax**: `property@language[index]` (e.g., `skos:definition@en[0]`, `skos:definition@en[1]`)
- **Use**: Complex literals where semicolon parsing would be problematic

#### CSV Format (for URIs and simple literals)
- **Syntax**: `property[csv]` (e.g., `skos:broader[csv]`)
- **Content**: Semicolon-separated values in single cell: `uri1;uri2;uri3`
- **Single values**: Also valid: `uri1`
- **No quotes required**: Values are delimited by semicolons only
- **Applies to**: All URI properties, `skos:altLabel`

## Column Organization

### 1. Default Column Order
1. Core identification (`uri`, `*rdf:type`)
2. Labels (`*skos:prefLabel@lang`, `skos:altLabel@lang`)
3. Definitions (`*skos:definition@lang`)
4. Relationships (`skos:broader`, `skos:narrower`, etc.)
5. Registry metadata (`reg:status`, `reg:identifier`)
6. Additional properties

### 2. Language Grouping Options
- **By Property**: `prefLabel@en`, `prefLabel@fr`, `definition@en`, `definition@fr`
- **By Language**: All English columns, then all French columns

### 3. User Preferences
```json
{
  "dctapPreferences": {
    "profileId-version": {
      "order": [1, 3, 2, 5, 4, ...],  // DCTAP row indices
      "langGrouping": "byProperty" | "byLanguage"
    }
  }
}
```

## Registry Properties
Include RDA Registry metadata properties:
- `reg:status` (system-assigned)
- `reg:identifier`
- `reg:hasSubproperty`
- `reg:hasUnconstrained`
- `reg:hasSubClass`

## Validation Rules

### 1. Import Validation (Postel's Law)
- Accept both array and CSV formats in same import
- Normalize during processing: `foo[csv]: "a;b;c"` → `foo[0]: a, foo[1]: b, foo[2]: c`
- No warnings for mixed formats

### 2. Language Validation
- Configurable mandatory languages per namespace/vocabulary
- Hierarchy: namespace defaults < vocabulary overrides
- Example: Namespace requires English, French vocabulary also requires French

### 3. Property Constraints
- `skos:prefLabel`: Max one per language
- URI properties: Always allow CSV format
- `skos:altLabel`: Allow CSV format
- Complex literals: Array format only

## Export Workflow

### 1. Language Selection
- **Mandatory only**: Include only required languages
- **Specific languages**: Translator workflow (single language)
- **All languages**: Gap analysis (full multilingual view)

### 2. Format Selection
- URI properties: Always CSV format
- `skos:altLabel`: Always CSV format
- Other literals: Array format if multiple values

### 3. Column Ordering
- Apply user preferences from Clerk metadata
- Fall back to default order if no preferences
- Respect language grouping preference

## Profile Management Interface Requirements

### 1. Profile Creation
- Visual DCTAP editor
- Property constraint configuration
- Language requirement settings
- CSV format allowance toggles

### 2. Export Configuration
- Language selection interface
- Column ordering drag-and-drop
- Language grouping toggle
- Format preview

### 3. Validation Setup
- Mandatory language configuration
- Property constraint rules
- Profile versioning

## Implementation Requirements

### Profile Management Interface
Both interfaces are required:

1. **Profile Management Interface**
   - Create/edit DCTAP profiles
   - Configure language requirements
   - Set property constraints
   - Version management

2. **Enhanced Export Interface** (Birth Certificate)
   - User-friendly spreadsheet adoption
   - Export configuration options
   - Column ordering preferences
   - Language selection

The profile management is for administrators/review groups, while the export interface is for day-to-day user workflows.

---

*Version: 1.0*  
*Date: 2025-01-16*  
*Author: IFLA Standards Development Team*