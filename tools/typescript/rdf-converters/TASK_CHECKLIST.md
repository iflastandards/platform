# RDF Converters Implementation Task Checklist

## Phase 1: Core Migration & Basic Tests

### Setup & Migration
- [x] Create directory structure at `/tools/typescript/rdf-converters/`
- [x] Move `scripts/rdf-to-csv.ts` to `src/rdf-to-csv.ts`
- [x] Move `scripts/rdf-folder-to-csv.ts` to `src/rdf-folder-to-csv.ts`
- [x] Create `package.json` with dependencies
- [x] Configure `tsconfig.json` for the package
- [x] Set up `vitest.config.ts` for testing

### Module Extraction
- [ ] Extract RDF parsing logic into `lib/rdf-parser.ts`
- [ ] Extract CSV generation logic into `lib/csv-generator.ts`
- [ ] Extract DCTAP loading logic into `lib/dctap-loader.ts`
- [ ] Create TypeScript interfaces in `lib/types.ts`

### Basic Tests & Fixtures
- [x] Create basic test structure
- [ ] Write tests for `rdf-parser.ts`
- [ ] Write tests for `csv-generator.ts`
- [ ] Write tests for `dctap-loader.ts`
- [x] Create test fixtures for basic element sets (started)
- [ ] Create test fixtures for basic vocabulary terms
- [ ] Create test fixtures for different RDF formats

### Integration
- [x] Update import paths in moved scripts (no changes needed)
- [ ] Ensure existing functionality still works
- [x] Update root `package.json` scripts

## Phase 2: DCTAP Extensions

### Implementation
- [ ] Create `lib/dctap-extensions.ts` module
- [ ] Implement mandatory field validation (`*` prefix)
- [ ] Implement language-tagged property support
- [ ] Implement `skos:prefLabel` one-per-language constraint
- [ ] Implement array format for repeatable values
- [ ] Implement CSV format for repeatable values
- [ ] Implement Postel's Law for import
- [ ] Implement registry property support

### Testing
- [ ] Create test fixtures for mandatory fields
- [ ] Create test fixtures for language tags
- [ ] Create test fixtures for repeatable formats
- [ ] Create test fixtures for mixed formats
- [ ] Create test fixtures for registry properties
- [ ] Write tests for all DCTAP extension features
- [ ] Create error case fixtures and tests

### Integration
- [ ] Update main converters to use DCTAP extensions
- [ ] Add validation error reporting

## Phase 3: Template Generation

### Core Implementation
- [ ] Create `src/csv-to-mdx.ts` converter
- [ ] Create `lib/mdx-generator.ts` module
- [ ] Set up Handlebars for templating
- [ ] Create `templates/vocabulary-template.mdx`
- [ ] Create `templates/element-template.mdx`
- [ ] Create `config/template-config.json`

### Features
- [ ] Implement template variable extraction from CSV
- [ ] Implement namespace mapping logic
- [ ] Implement multilingual content handling
- [ ] Implement conditional sections

### Testing
- [ ] Create test fixtures for vocabulary templates
- [ ] Create test fixtures for element templates
- [ ] Create test fixtures for multilingual templates
- [ ] Write comprehensive tests for template generation
- [ ] Test file naming patterns
- [ ] Test output directory structure

## Phase 4: Pipeline Integration

### Core Components
- [ ] Create `src/pipeline.ts` orchestrator
- [ ] Create `lib/google-sheets.ts` module
- [ ] Implement Google Sheets API integration
- [ ] Add database schema updates to documentation

### Features
- [ ] Implement conversion job tracking
- [ ] Implement sheet ID storage
- [ ] Implement MDX file tracking
- [ ] Add progress reporting
- [ ] Add rollback capabilities

### Testing
- [ ] Create end-to-end pipeline tests
- [ ] Test simple vocabulary pipeline
- [ ] Test complex elements pipeline
- [ ] Test error handling in pipeline

## Phase 5: Documentation & Polish

### Documentation
- [ ] Update `developer_notes/data-storage-architecture.md`
- [ ] Create comprehensive README.md
- [ ] Document all DCTAP extensions
- [ ] Create user guide for the pipeline
- [ ] Document template customization
- [ ] Add JSDoc comments to all functions
- [ ] Create troubleshooting guide

### Optimization
- [ ] Optimize performance for large RDF files
- [ ] Add caching where appropriate
- [ ] Improve error messages and logging
- [ ] Add configuration validation

## Current Status

**Phase**: 1 - Core Migration & Basic Tests
**Current Task**: Extracting core logic into modules
**Progress**: Scripts moved, package configured, basic tests created

## Next Steps

1. Extract RDF parsing logic into `lib/rdf-parser.ts`
2. Extract CSV generation logic into `lib/csv-generator.ts`
3. Extract DCTAP loading logic into `lib/dctap-loader.ts`
4. Create more test fixtures for different scenarios
5. Test that existing functionality still works