# ISBD Excel Files (Proper Format)

## Overview
Complete ISBD vocabulary data with original CSV headers preserved.

**Total vocabularies:** 9  
**Total rows:** 417

## Structure

### Elements Workbook (`isbd-elements/`)
- **ISBD Elements** (192 rows): ISBD Elements and Classes
- **Unconstrained Elements** (165 rows): ISBD Unconstrained Elements

### Values Workbook (`isbd-values/`)
- **Content Form** (13 rows): ISBD Content Form vocabulary terms
- **Content Form Base** (15 rows): ISBD Content Form Base vocabulary terms
- **Dimensionality** (4 rows): ISBD Dimensionality vocabulary terms
- **Motion** (4 rows): ISBD Motion vocabulary terms
- **Sensory Specification** (7 rows): ISBD Sensory Specification vocabulary terms
- **Content Type** (5 rows): ISBD Content Type vocabulary for content qualification
- **Media Type** (12 rows): ISBD Media Type vocabulary terms

## Header Format
- Language tags: `@en`, `@es`, etc.
- Indexed properties: `[0]`, `[1]`, etc.
- Mandatory fields: `*` suffix
- Example: `skos:definition@en[0]*`

## Files
- Each vocabulary is a separate CSV file
- `index.csv` in each directory lists all vocabularies
- `master-index.csv` provides overview

## Usage
Import any CSV file into Excel, Google Sheets, or other tools.
All original RDF structure and multilingual content preserved.
