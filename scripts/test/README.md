# Test Suite for Test-Tagging Scripts

This comprehensive test suite validates the functionality of the AI-powered test file tagging scripts used in the IFLA Standards Platform.

## 🧪 Test Structure

```
scripts/test/
├── auto-tag-tests.test.ts           # Unit tests for TestTagger class
├── apply-test-tags.test.js          # Tests for TestTagUpdater
├── validate-test-tags.test.js       # Tests for TestTagValidator
├── integration/
│   └── file-processing.test.ts      # Integration tests for workflows
├── error-handling.test.ts           # Error scenarios and edge cases
├── fixtures/
│   └── test-files.fixtures.ts       # Test data and mock responses
└── README.md                        # This file
```

## 🏃‍♂️ Running the Tests

### Run All Tests
```bash
# Run all test-tagging script tests
pnpm test scripts/test --grep "@testing"

# Run with coverage
pnpm test scripts/test --coverage
```

### Run Specific Test Categories
```bash
# Unit tests only
pnpm test scripts/test --grep "@unit.*@testing"

# Integration tests only  
pnpm test scripts/test --grep "@integration.*@testing"

# Critical tests only
pnpm test scripts/test --grep "@critical.*@testing"
```

### Run Individual Test Files
```bash
# TestTagger core functionality
pnpm test scripts/test/auto-tag-tests.test.ts

# Tag updater functionality  
pnpm test scripts/test/apply-test-tags.test.js

# Validation functionality
pnpm test scripts/test/validate-test-tags.test.js

# Integration workflows
pnpm test scripts/test/integration/file-processing.test.ts

# Error handling scenarios
pnpm test scripts/test/error-handling.test.ts
```

## 📋 Test Coverage

### TestTagger Class (`auto-tag-tests.test.ts`)
- ✅ Constructor and initialization
- ✅ AI provider setup (Anthropic, Gemini, OpenAI, Perplexity)
- ✅ Test file analysis and classification
- ✅ Tag generation and application
- ✅ File location analysis and movement
- ✅ Batch processing capabilities
- ✅ Git integration (staged/affected files)
- ✅ Dry run mode validation

### TestTagUpdater (`apply-test-tags.test.js`)
- ✅ Category tag application
- ✅ Priority tag application  
- ✅ Functional tag application
- ✅ File content parsing and modification
- ✅ Error handling and recovery
- ✅ Dry run mode functionality
- ✅ Multiple describe pattern support

### TestTagValidator (`validate-test-tags.test.js`)
- ✅ Test file discovery and scanning
- ✅ Tag validation against standards
- ✅ Compliance reporting and metrics
- ✅ Tag usage demonstration
- ✅ Final report generation
- ✅ Error handling for missing files

### Integration Workflows (`integration/file-processing.test.ts`)
- ✅ End-to-end file processing pipelines
- ✅ AI provider response handling
- ✅ Batch vs sequential processing logic
- ✅ File discovery workflows (staged, affected, glob)
- ✅ File location analysis and movement
- ✅ Error recovery and resilience
- ✅ Dry run mode validation

### Error Handling (`error-handling.test.ts`)
- ✅ AI provider initialization failures
- ✅ File system errors (permissions, not found, corruption)
- ✅ Network and connectivity issues
- ✅ Malformed AI responses and edge cases
- ✅ Git command failures
- ✅ Memory and resource constraints
- ✅ Race conditions and concurrency issues

## 🎯 Test Data and Fixtures

The `fixtures/test-files.fixtures.ts` file provides:

### Mock Test Files
- **Unit Test Examples**: Properly mocked dependencies, pure logic tests
- **Integration Test Examples**: Database connections, API calls
- **E2E Test Examples**: Playwright browser automation
- **Smoke Test Examples**: Critical path validation
- **Problematic Files**: Edge cases and error scenarios

### AI Response Fixtures
- **Valid Analyses**: Correct classification responses for each test type
- **Invalid Responses**: Malformed JSON, empty responses, errors
- **Edge Cases**: Low confidence, ambiguous classifications

### Location Test Cases
- **Correct Locations**: Files in appropriate directories
- **Wrong Locations**: Misplaced files requiring movement
- **Naming Issues**: Incorrect filename patterns

## 🏷️ Test Tags Used

All tests in this suite use the following tags:
- `@integration @critical @testing` - For comprehensive integration tests
- `@unit @critical @testing` - For focused unit tests
- Tags align with the project's testing strategy

## 🔧 Mock Strategy

### External Dependencies
- **File System**: All `fs` operations mocked for predictable testing
- **Child Process**: Git and shell commands mocked with controlled responses  
- **AI Providers**: Dynamic imports and API calls mocked
- **Console Output**: Captured and validated for user feedback

### Test Isolation
- Each test has isolated mock state
- No shared state between test cases
- Proper cleanup in `beforeEach`/`afterEach` hooks

## 📊 Expected Test Results

When running the complete test suite:

- **Total Tests**: ~100+ test cases covering all scenarios
- **Coverage Target**: >90% line and branch coverage
- **Performance**: All tests should complete within 30 seconds
- **Reliability**: No flaky tests, all mocked dependencies controlled

## 🚨 Common Test Failures

### Environment Setup
```bash
# Missing dependencies
pnpm install -D vitest @vitest/ui

# Missing test environment variables (if needed)
export NODE_ENV=test
```

### Mock Issues  
- Ensure all external dependencies are properly mocked
- Check that dynamic imports are handled correctly
- Verify file paths use absolute paths in tests

### TypeScript Issues
- Ensure test files can import from the scripts directory
- Check that fixture types match expected interfaces
- Verify mock typing is compatible with real implementations

## 🔄 Continuous Integration

These tests are designed to run in CI environments:

- **No External Dependencies**: All APIs and services mocked
- **Deterministic**: Consistent results across runs
- **Fast Execution**: Optimized for quick feedback cycles
- **Comprehensive Coverage**: Validates all critical functionality

## 🎓 Contributing

When adding new functionality to the test-tagging scripts:

1. **Add Unit Tests**: Test individual methods and functions
2. **Add Integration Tests**: Test complete workflows
3. **Add Error Tests**: Test failure scenarios and edge cases  
4. **Update Fixtures**: Add new test data as needed
5. **Maintain Coverage**: Ensure >90% coverage is maintained

### Test Naming Convention
```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

### Tag Requirements
All test files must include appropriate tags:
```javascript
/**
 * @integration @critical @testing
 */
```

## 📈 Metrics and Reporting

Test results provide metrics on:
- **Functionality Coverage**: All features tested
- **Error Handling**: Edge cases and failures covered
- **Performance**: Batch processing and efficiency
- **Reliability**: Consistent behavior across scenarios

This comprehensive test suite ensures the test-tagging scripts function correctly and reliably across all supported scenarios and edge cases.