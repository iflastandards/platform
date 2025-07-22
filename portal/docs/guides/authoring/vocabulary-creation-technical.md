# Vocabulary Creation Guide

This guide explains how to create new ISBDM vocabularies using the automated Google Sheets creation workflow.

## Overview

The vocabulary creation workflow automates the process of:
1. Creating a Google Workbook for your repository and profile type
2. Setting up DCTAP profile sheets
3. Creating vocabulary sheets with multilingual support
4. Maintaining an index of all vocabularies

## Prerequisites

- Google Cloud service account with Sheets API access
- `GSHEETS_SA_KEY` environment variable (base64-encoded service account JSON)
- GitHub repository with appropriate permissions

## Usage Methods

### Method 1: Command Line (Local Development)

Run the interactive script:

```bash
yarn vocabulary:create
```

You'll be prompted for:
- Profile type (values or elements)
- Vocabulary name (lowercase with hyphens)
- Title
- Description
- Languages

### Method 2: GitHub Actions Workflow

Trigger manually from GitHub Actions:

1. Go to Actions → Create Vocabulary Sheet
2. Click "Run workflow"
3. Fill in the required fields
4. Click "Run workflow"

### Method 3: Web Form

Use the HTML form to submit vocabulary creation requests:

1. Open `create-vocabulary-form.html` in a browser
2. Fill out the form
3. Submit to trigger the creation process

### Method 4: API Endpoint

Send a POST request to your API endpoint:

```bash
curl -X POST https://your-site.com/api/create-vocabulary \
  -H "Content-Type: application/json" \
  -d '{
    "profileType": "values",
    "vocabularyName": "sensory-specification",
    "title": "Sensory Specification Vocabulary",
    "description": "Vocabulary for describing sensory characteristics",
    "languages": ["en", "fr", "es"]
  }'
```

## Vocabulary Structure

### Values Profile Columns
- `valueID` - Unique identifier
- `label` - Human-readable label (multilingual)
- `definition` - Description (multilingual)
- `scopeNote` - Usage notes (multilingual)
- `example` - Usage examples
- `source` - Source reference
- `status` - Current status

### Elements Profile Columns
- `elementID` - Unique identifier
- `label` - Human-readable label (multilingual)
- `definition` - Description (multilingual)
- `comment` - Additional notes (multilingual)
- `cardinality` - Usage constraints
- `datatype` - Expected data type
- `status` - Current status

## Multilingual Support

For translatable fields (label, definition, scopeNote, comment), the system creates language-specific columns:
- `label` → `label_en`, `label_fr`, `label_es`
- `definition` → `definition_en`, `definition_fr`, `definition_es`

## Spreadsheet Organization

```
ISBDM-values (Workbook)
├── Index (Sheet) - List of all vocabularies
├── DCTAP-values (Sheet) - Profile definition
├── sensory-specification (Sheet) - Vocabulary 1
└── color-vocabulary (Sheet) - Vocabulary 2
```

## Environment Setup

1. Create a Google Cloud service account
2. Enable Google Sheets API
3. Download service account JSON key
4. Encode as base64: `base64 -i key.json`
5. Set environment variable: `export GSHEETS_SA_KEY="<base64-string>"`

## Troubleshooting

### Authentication Errors
- Verify service account has Sheets API access
- Check GSHEETS_SA_KEY is properly set
- Ensure JSON is valid after base64 decoding

### Permission Errors
- Service account needs edit access to sheets
- For shared folders, add service account email

### Script Errors
- Install dependencies: `yarn add googleapis`
- Check Node.js version (≥18 recommended)

## Adding to README

To add a "Create New Vocabulary" button to your README:

```markdown
[![Create New Vocabulary](https://img.shields.io/badge/Create-New%20Vocabulary-blue.svg)](https://github.com/YOUR_ORG/ISBDM/actions/workflows/create-vocabulary-sheet.yml)
```

Or use a form link:

```markdown
[📊 Create New Vocabulary](https://your-site.com/create-vocabulary-form.html)
```