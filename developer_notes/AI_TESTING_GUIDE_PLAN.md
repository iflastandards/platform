# AI Testing Guide Implementation Plan

## Project Overview
Create a comprehensive testing guide that AI assistants can reference when writing tests, ensuring consistent test tagging and proper placement within the 5-level testing strategy.

## Task Checklist

### ✅ Phase 1: Audit & Extract Current Testing Rules
- [x] **Task 1.1**: Read `/developer_notes/TESTING_STRATEGY.md`
- [x] **Task 1.2**: Read `/developer_notes/TEST_PLACEMENT_GUIDE.md` 
- [x] **Task 1.3**: Read other testing-related docs in `/developer_notes/`
- [x] **Task 1.4**: Compile exhaustive list of existing levels, file patterns, Nx targets, Git hooks, and speed targets
- [x] **Task 1.5**: Record gaps or ambiguities that AI assistants face when tagging tests

### ✅ Phase 2: Define Canonical Tagging Vocabulary  
- [x] **Task 2.1**: Create table mapping test phases to file patterns, directories, and tags
- [x] **Task 2.2**: Include optional meta-tags with clear usage rules
- [x] **Task 2.3**: Ensure vocabulary aligns with Nx targets and Husky scripts
- [x] **Task 2.4**: Validate against existing tagging utilities in `e2e/utils/test-tags.ts`

### ✅ Phase 3: Design Decision Trees & Flowcharts
- [x] **Task 3.1**: Transform "Quick Decision Tree" from TEST_PLACEMENT_GUIDE into text-based step-by-step flow
- [x] **Task 3.2**: Create ASCII flowchart or Mermaid diagram for visual learners
- [x] **Task 3.3**: Add branching for edge cases (environment-dependent, cross-service, visual regression)
- [x] **Task 3.4**: Highlight default paths to minimize confusion (most tests are unit tests)

### ✅ Phase 4: Curate End-to-End Examples for Every Category
- [x] **Task 4.1**: Select/create minimal example file for Unit tests
- [x] **Task 4.2**: Select/create minimal example file for Integration tests
- [x] **Task 4.3**: Select/create minimal example file for E2E tests
- [x] **Task 4.4**: Select/create minimal example file for Env tests
- [x] **Task 4.5**: Annotate each example with inline comments explaining categorization
- [x] **Task 4.6**: Validate examples by running `nx run-many --target=test --all`

### ✅ Phase 5: Draft the "AI Testing Instruction Guide"
- [x] **Task 5.1**: Create `developer_notes/AI_TESTING_INSTRUCTIONS.md` structure
- [x] **Task 5.2**: Write Introduction & scope section
- [x] **Task 5.3**: Write Five-Level Testing Strategy recap (one paragraph each)
- [x] **Task 5.4**: Insert tagging vocabulary table
- [x] **Task 5.5**: Insert decision tree & flowchart
- [x] **Task 5.6**: Write category-specific guidelines (Do/Don't lists)
- [x] **Task 5.7**: Create example library (links to curated files)
- [x] **Task 5.8**: Create quick-reference cheat sheet & checklist for new tests
- [x] **Task 5.9**: Embed lint-safe code blocks and command snippets

### ✅ Phase 6: Validate Guide Against Static Analysis & CI
- [x] **Task 6.1**: Run ESLint on the new guide
- [x] **Task 6.2**: Run markdown-lint on the new guide  
- [x] **Task 6.3**: Execute dry-run: rename existing tests using new conventions
- [x] **Task 6.4**: Ensure pre-commit/pre-push hooks behave as documented
- [x] **Task 6.5**: Fix any mismatches between guide and tooling

### ⏳ Phase 7: Integrate & Cross-Link Documentation
- [ ] **Task 7.1**: Add cross-references from `README.md` to the new AI guide
- [ ] **Task 7.2**: Add cross-references from `TESTING_STRATEGY.md` to the new AI guide
- [ ] **Task 7.3**: Add cross-references from `CONTRIBUTING.md` to the new AI guide
- [ ] **Task 7.4**: Update generator scripts mentioning test levels
- [ ] **Task 7.5**: Update commit message templates mentioning test levels
- [ ] **Task 7.6**: Ensure `developer_notes/README.md` lists the guide in "🧪 Testing" section
- [ ] **Task 7.7**: Add Husky pre-commit rule for test file validation
- [ ] **Task 7.8**: Schedule quarterly audit process

## Progress Notes

### Completed Work
- **Phase 1**: Successfully read and analyzed all existing testing strategy documentation including TESTING_STRATEGY.md, TEST_PLACEMENT_GUIDE.md, E2E_TESTING_FRAMEWORK_GUIDE.md, E2E_TEST_INVENTORY.md, and TEST_ADDITION_SUMMARY.md
- **Phase 2**: Created comprehensive canonical tagging vocabulary table that maps all 5 test phases to file patterns, directories, and required tags. Validated alignment with existing `e2e/utils/test-tags.ts` utilities.
- **Phase 3**: Created decision trees and flowcharts from existing Quick Decision Tree in TEST_PLACEMENT_GUIDE.md
- **Phase 4**: Curated excellent examples for each test category with proper annotations
- **Phase 5**: Successfully created comprehensive AI_TESTING_INSTRUCTIONS.md file with complete guide content including introduction, 5-level strategy recap, tagging vocabulary, decision trees, category guidelines, examples, and quick-reference materials
- **Phase 6**: Validated guide against static analysis and CI - ran markdown linting, verified pre-commit/pre-push hooks behavior, fixed mismatches between guide and TestTags utility by adding missing @unit and @env tags

### Current Status
- Moving to Phase 7: Integrate & Cross-Link Documentation
- Ready to add cross-references and integrate the guide with existing documentation

### Next Steps
1. Add cross-references from existing documentation to the new AI guide
2. Update README files and generator scripts to reference the guide
3. Add Husky pre-commit rules for test tagging validation

## Key Findings So Far

### Existing Test Structure
- 5 test phases: Selective, Pre-Commit, Pre-Push, Comprehensive, CI-Env
- Existing tagging system in `e2e/utils/test-tags.ts` with comprehensive tag definitions
- Performance targets: Selective <30s, Pre-commit <60s, Pre-push <180s
- Uses `nx affected` for optimization

### Canonical Tagging Vocabulary Created
| Test Phase       | File Naming Patterns                | Directory Locations                  | Required Tags          | Optional Meta-Tags                      |
|------------------|-------------------------------------|--------------------------------------|------------------------|----------------------------------------|
| **Selective**    | `*.test.ts`, `*.spec.ts`            | `src/`, `scripts/`, `components/`    | `@unit`                | `@ui`, `@api`, `@critical`             |
| **Pre-Commit**   | `*.test.ts`, `*.spec.ts`            | `src/`, `scripts/`, `components/`    | `@unit`, `@integration`| `@critical`, `@auth`                   |
| **Pre-Push**     | `*.test.ts`, `*.spec.ts`            | `src/`, `scripts/`, `e2e/`           | `@integration`, `@e2e` | `@performance`, `@regression`          |
| **Comprehensive**| `*.test.ts`, `*.spec.ts`, `.e2e.ts` | `e2e/`, `integration/`               | `@e2e`                 | `@cross-site`, `@accessibility`        |
| **CI-Env**       | `.ci.ts`, `.e2e.ts`                 | `ci/`                                | `@env`                 | `@env-specific`                        |

### Alignment Confirmed
- Tags align with existing TestTags in `e2e/utils/test-tags.ts`
- Integration with Nx targets and Husky scripts validated
- Mis-tagged tests will fail fast as designed
