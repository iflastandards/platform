# ISBDM Application Profiles

This directory contains Dublin Core Tabular Application Profiles (DCTAP) for the ISBDM project.

## About DCTAP

DCTAP is a simple model for application profiles that can be developed in a spreadsheet program. These profiles provide:

- Human-readable documentation for metadata requirements
- Machine-actionable validation rules
- Source for generating JSON-LD contexts
- Standards-compliant metadata modeling

## Available Profiles

The DCTAP profiles are now available for download at `/data/DCTAP/`:

### 1. [`isbdm-elements-profile.csv`](/data/DCTAP/isbdm-elements-profile.csv)

This profile defines the structure and constraints for ISBDM element metadata that appears in MDX front matter.

Key components:
- **Element** shape - Core metadata for elements (properties, domains, ranges, etc.)
- **ElementSubType** shape - References to more specific element types
- **ElementSuperType** shape - References to more general element types

### 2. [`isbdm-values-profile.csv`](/data/DCTAP/isbdm-values-profile.csv)

This profile defines the structure and constraints for ISBDM value vocabulary metadata that appears in MDX front matter.

Key components:
- **Vocabulary** shape - Core metadata for vocabularies
- **VocabularyRDF** shape - RDF-specific metadata with SKOS properties
- **VocabularyTerm** shape - Structure for individual terms in the vocabulary

Based on the SKOS (Simple Knowledge Organization System) model, this profile supports:
- Essential vocabulary metadata (ID, URI, title, description)
- Vocabulary display configuration (numeric or slug URIs, styling options)
- Rich term descriptions with definitions, scope notes, and examples
- Full SKOS concept scheme capabilities including notes and documentation properties
- Language-tagged data for multilingual support

## Usage

### For Content Creators

Use the examples in the `/examples` directory as templates when creating new elements or value vocabularies. These examples follow the structure defined in the profiles.

### For Validation

The profiles can be used with DCTAP validation tools to verify that content conforms to the expected structure before being published.

### For JSON-LD Context Generation

The profiles serve as the source for generating JSON-LD contexts, which are available for download at `/data/contexts/`.

## Profile Constraints

The profiles define the following types of constraints:

1. **Required Fields** - Fields marked as `mandatory: TRUE`
2. **Repeatable Fields** - Fields marked as `repeatable: TRUE`
3. **Data Types** - Fields with `valueDataType` defined
4. **Controlled Vocabularies** - Fields with `valueConstraintType: picklist`
5. **URI Patterns** - Fields with `valueConstraintType: IRIstem`
6. **Value Shapes** - Fields that reference other shapes

## Version Information

This is version 1.0 of the ISBDM application profiles, created in May 2025.

## Related Resources

- [DCTAP Specification](https://www.dublincore.org/specifications/dctap/)
- [ISBDM Documentation](https://www.iflastandards.info/ISBDM/)
- JSON-LD contexts: [`/data/contexts/`](/data/contexts/)