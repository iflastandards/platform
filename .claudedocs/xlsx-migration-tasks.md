# XLSX to ExcelJS Migration Tasks

## Overview
Migrate from vulnerable `xlsx@0.18.5` to secure `exceljs@4.4.0` while maintaining the complete RDF → CSV → Spreadsheet → CSV → RDF → Docusaurus pipeline.

## Pre-Migration Checklist
- [ ] Create feature branch: `feat/migrate-xlsx-to-exceljs`
- [ ] Backup current working state
- [ ] Document current xlsx usage patterns

## Phase 1: Dependency Management
- [ ] Remove vulnerable xlsx package: `pnpm remove xlsx`
- [ ] Add ExcelJS: `pnpm add exceljs`
- [ ] Add ExcelJS types: `pnpm add -D @types/exceljs`
- [ ] Run `pnpm install` to update lockfile
- [ ] Verify no xlsx references in package.json

## Phase 2: Create Unified Spreadsheet Package

### 2.1 Package Setup
- [ ] Create directory: `packages/unified-spreadsheet/`
- [ ] Create `package.json` with name `@ifla/unified-spreadsheet`
- [ ] Create `tsconfig.json` extending root config
- [ ] Create `project.json` for Nx configuration
- [ ] Add to workspace dependencies

### 2.2 Core Implementation
- [ ] Create `src/index.ts` with main exports
- [ ] Create `src/types.ts` with TypeScript interfaces:
  - [ ] `DataSource` interface
  - [ ] `DataTarget` interface
  - [ ] `Workbook` interface
  - [ ] `Sheet` interface
  - [ ] `ValidationResult` interface
- [ ] Create `src/unified-spreadsheet.ts` main class:
  - [ ] Constructor with Google Auth support
  - [ ] `read()` method for all sources
  - [ ] `write()` method for all targets
  - [ ] `fromCSV()` method
  - [ ] `toCSV()` method
  - [ ] `validateWithProfile()` method

### 2.3 Format Handlers
- [ ] Create `src/handlers/xlsx-handler.ts`:
  - [ ] `readXLSX()` using ExcelJS
  - [ ] `writeXLSX()` using ExcelJS
  - [ ] Cell formatting support
  - [ ] Multiple sheets support
- [ ] Create `src/handlers/csv-handler.ts`:
  - [ ] Integrate existing csv-parse
  - [ ] Integrate existing csv-stringify
  - [ ] Handle encoding properly
- [ ] Create `src/handlers/google-sheets-handler.ts`:
  - [ ] Move existing Google Sheets logic
  - [ ] Maintain API compatibility

### 2.4 RDF Integration
- [ ] Create `src/rdf-integration.ts`:
  - [ ] `fromRdfResources()` method
  - [ ] `toRdfResources()` method
  - [ ] DCTAP profile support
  - [ ] Language tag handling

### 2.5 Tests
- [ ] Create `tests/unified-spreadsheet.test.ts`
- [ ] Test CSV → XLSX conversion
- [ ] Test XLSX → CSV conversion
- [ ] Test Google Sheets operations
- [ ] Test DCTAP validation
- [ ] Test streaming large files

## Phase 3: Update Existing Code

### 3.1 Update `scripts/spreadsheet-api.ts`
- [ ] Remove xlsx imports
- [ ] Add UnifiedSpreadsheet import
- [ ] Update `createExcelWorkbooks()` method:
  - [ ] Replace `xlsxUtils.book_new()` with UnifiedSpreadsheet
  - [ ] Replace `xlsxUtils.aoa_to_sheet()` 
  - [ ] Replace `xlsxWrite()` with new API
- [ ] Update `createWorksheet()` method
- [ ] Test with existing CSV files

### 3.2 Update RDF Converters
- [ ] Update `tools/typescript/rdf-converters/src/lib/generator.ts`:
  - [ ] Add UnifiedSpreadsheet integration option
  - [ ] Maintain backward compatibility
- [ ] Update pipeline scripts if needed
- [ ] Test RDF → CSV → XLSX flow

### 3.3 Update Admin App Services
- [ ] Update `apps/admin/src/lib/services/adoption-service.ts`:
  - [ ] Check for xlsx usage
  - [ ] Update if necessary
- [ ] Update `apps/admin/src/lib/services/dctap-validation.ts`:
  - [ ] Integrate with UnifiedSpreadsheet validation
- [ ] Update import/export workflows

### 3.4 Update Other Files
- [ ] Search for remaining xlsx imports: `grep -r "from 'xlsx'" .`
- [ ] Update any found imports
- [ ] Update type definitions
- [ ] Fix any TypeScript errors

## Phase 4: Testing & Validation

### 4.1 Unit Tests
- [ ] Run existing tests: `pnpm test`
- [ ] Fix any failing tests
- [ ] Add new tests for UnifiedSpreadsheet
- [ ] Achieve >80% coverage

### 4.2 Integration Tests
- [ ] Test complete RDF → CSV pipeline
- [ ] Test CSV → XLSX conversion
- [ ] Test XLSX → Google Sheets sync
- [ ] Test Google Sheets → CSV export
- [ ] Test CSV → RDF conversion
- [ ] Test Docusaurus build

### 4.3 Manual Testing
- [ ] Test with small vocabulary file
- [ ] Test with large ISBD dataset
- [ ] Test with multiple languages
- [ ] Test with special characters
- [ ] Test error handling
- [ ] Test memory usage with large files

## Phase 5: Documentation

### 5.1 Code Documentation
- [ ] Add JSDoc comments to all public methods
- [ ] Document migration changes
- [ ] Update inline comments

### 5.2 User Documentation
- [ ] Create `packages/unified-spreadsheet/README.md`
- [ ] Document API usage examples
- [ ] Document migration guide
- [ ] Update main README if needed

## Phase 6: Deployment

### 6.1 Pre-deployment
- [ ] Run full test suite
- [ ] Run security scan: `pnpm audit`
- [ ] Check bundle size impact
- [ ] Review all changes

### 6.2 Deployment
- [ ] Create PR with detailed description
- [ ] Get code review
- [ ] Run CI/CD pipeline
- [ ] Merge to main branch
- [ ] Tag release

### 6.3 Post-deployment
- [ ] Monitor for errors
- [ ] Check performance metrics
- [ ] Document lessons learned
- [ ] Close security issue

## Rollback Plan
If issues arise:
1. [ ] Revert PR
2. [ ] Re-add xlsx package temporarily
3. [ ] Investigate issues
4. [ ] Fix and retry

## Success Criteria
- [ ] All tests passing
- [ ] No xlsx vulnerabilities in `pnpm audit`
- [ ] RDF pipeline working end-to-end
- [ ] No performance regression
- [ ] All existing features maintained

## Notes
- ExcelJS uses different API than xlsx
- Keep backward compatibility where possible
- Focus on security and maintainability
- Consider adding progress indicators for large files

---
**Estimated Time**: 8-12 hours
**Priority**: High (security vulnerability)
**Risk**: Medium (API changes required)