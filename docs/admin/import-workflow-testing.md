# Import Workflow Testing Documentation

## Overview

The import workflow tests are designed to fit into the existing 5-level testing strategy:

1. **Pre-commit (Level 3)**: Fast unit tests that run on every commit
2. **Pre-push (Level 4)**: Integration tests that ensure nothing broken gets pushed
3. **E2E Tests (Level 5)**: Full workflow tests (only when needed)

## Test Structure

### Unit Tests (Pre-commit)

Located in `__tests__` directories with `.unit.test.ts` suffix:

- **ImportService Unit Tests**: `src/lib/services/__tests__/import-service.unit.test.ts`
  - URL validation logic
  - Job management functions
  - IFLA-specific validation rules
  - Language detection
  - Duplicate checking

- **Component Unit Tests**: `src/app/import/__tests__/ImportWorkflow.unit.test.tsx`
  - Basic rendering
  - UI state management
  - Step navigation logic

### Integration Tests (Pre-push)

Located in `__tests__` directories with `.integration.test.ts` suffix:

- **API Integration Tests**: `src/app/api/actions/scaffold-from-spreadsheet/__tests__/route.integration.test.ts`
  - POST endpoint validation
  - GET endpoint for job status
  - Permission checking
  - Error handling

### What's NOT Tested (Yet)

These would be added as needed:

1. **Actual Google Sheets Integration**: Requires credentials
2. **Real Supabase Operations**: Requires live database
3. **GitHub API Integration**: Requires tokens
4. **Full E2E Workflow**: Would test complete import process

## Running Tests

### During Development

```bash
# Run all unit tests (fast)
pnpm test:unit

# Run integration tests
pnpm test:integration

# Watch mode for TDD
pnpm test:admin:watch
```

### Git Hooks

Tests run automatically:

- **Pre-commit**: Unit tests via `nx affected`
- **Pre-push**: Integration tests via smart detection

### Manual Testing

For full workflow testing:

1. Set up `.env.local` with mock values
2. Start dev server: `pnpm nx dev admin`
3. Navigate to `/admin/import`
4. Follow the 5-step wizard

## Test Data

### Mock Spreadsheet URLs

Valid test URLs:
- `https://docs.google.com/spreadsheets/d/1abc123/edit`
- `https://docs.google.com/spreadsheets/d/test-sheet-id/edit#gid=0`

### Mock Namespaces

Available in tests:
- `isbd` - International Standard Bibliographic Description
- `lrm` - Library Reference Model

### Mock User Roles

- `ifla-admin` - Full access
- `site-admin` - Full access
- `{namespace}-editor` - Namespace-specific access

## Quality Checks

The import workflow includes several IFLA-specific validations:

1. **Required Columns**: Identifier, Label, Definition
2. **Language Detection**: Automatic detection of `_en`, `_es`, `_fr` suffixes
3. **Duplicate Detection**: Checks for duplicate identifiers
4. **Language Mismatch Detection**: Based on the existing QA scripts you mentioned

## Integration with Existing Tools

The tests verify integration points with:

- `tools/sheet-sync` - Google Sheets synchronization
- `scripts/spreadsheet-api.ts` - Spreadsheet operations
- `scripts/rdf-to-csv.ts` - RDF conversion
- Language mismatch detection scripts

## Future Enhancements

When moving beyond mocks:

1. **Google Sheets API Tests**: With service account credentials
2. **Supabase Integration Tests**: With test database
3. **GitHub API Tests**: Branch creation and PR workflows
4. **Full E2E Tests**: Complete import → review → merge flow

## Troubleshooting

### Common Issues

1. **MUI Form Warnings**: Use proper `id` attributes or `inputProps`
2. **Async Timeouts**: Use `waitFor` with appropriate timeouts
3. **Mock Data**: Ensure mocks match expected shapes

### Debug Mode

Enable verbose logging:
```bash
DEBUG=admin:import pnpm test:unit
```