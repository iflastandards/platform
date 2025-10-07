# Test Improvements Guide

This guide documents the improvements made to the ISBDM test suite to address issues where tests were "cheating" by hardcoding responses or testing mocks instead of actual functionality.

## Key Issues Identified

1. **Over-mocking**: Tests mocked core functionality they were supposed to test
2. **Hardcoded Values**: Tests checked for exact strings that mirrored implementation
3. **Testing Mocks**: Tests verified mock calls instead of actual behavior
4. **Missing Edge Cases**: No tests for errors, empty data, or invalid inputs
5. **No Integration Testing**: Components tested in isolation without framework integration

## Improvements Made

### 1. Vocabulary Creation Tests

**Before**: Tests only verified that mocks were called with certain parameters
**After**: Tests validate actual business logic:
- Column generation logic for different profiles
- Vocabulary name validation patterns
- URL generation algorithms
- Configuration validation rules
- Error handling scenarios

### 2. VocabularyTable Tests

**Before**: Hardcoded `colorMode: 'light'`, never tested dark mode
**After**: 
- Tests both light and dark mode rendering
- Validates filtering logic across languages
- Tests performance with large datasets
- Handles special characters and XSS prevention
- Tests edge cases (empty data, missing translations)

### 3. ElementReference Tests

**Before**: Tested for exact hardcoded URI strings
**After**: Tests the actual URI generation logic:
- Prefix determination based on element type
- Type normalization (Class → C prefix, Property → P prefix)
- Relationship processing (elementSuperType → subPropertyOf)
- RDF serialization logic for different formats

### 4. InLink Tests

**Before**: Mocked both `useBaseUrl` and `Link` component
**After**: Tests actual functionality:
- Smart wrapping logic implementation
- Zero-width space insertion algorithm
- URL processing with different formats
- Performance with large text and deep nesting
- Accessibility implications

### 5. Google Sheets Integration Tests

**New**: Added comprehensive tests for:
- Service account authentication parsing
- Spreadsheet operation request building
- Workbook naming and search query construction
- Index sheet hyperlink formula generation
- Data transformation for multilingual vocabularies
- Batch operation chunking
- Error recovery and rate limiting

## Best Practices for Future Tests

### 1. Test Real Behavior, Not Mocks

```typescript
// ❌ Bad: Testing mock was called
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);

// ✅ Good: Testing actual output
const result = processData(input);
expect(result).toEqual(expectedOutput);
```

### 2. Test Business Logic Separately

```typescript
// ✅ Good: Test the logic function directly
const generateUri = (base: string, prefix: string, id: number) => {
  return `${base}/${prefix}${id}`;
};

expect(generateUri('http://example.com', 'P', 123))
  .toBe('http://example.com/P123');
```

### 3. Test Edge Cases

```typescript
// ✅ Good: Test various edge cases
describe('validation', () => {
  it('handles empty input', () => {});
  it('handles null values', () => {});
  it('handles special characters', () => {});
  it('handles maximum length', () => {});
});
```

### 4. Test Integration Points

```typescript
// ✅ Good: Test how components work together
it('should process URL and apply smart wrapping together', () => {
  // Test that multiple features work correctly when combined
});
```

### 5. Test Performance

```typescript
// ✅ Good: Ensure reasonable performance
it('should handle large datasets efficiently', () => {
  const largeData = generateLargeDataset(1000);
  const startTime = performance.now();
  processData(largeData);
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(1000); // Under 1 second
});
```

## Running the Improved Tests

```bash
# Run all tests
yarn test

# Run specific improved test files
yarn test create-vocabulary-sheet-improved.test.ts
yarn test VocabularyTable-improved.test.tsx
yarn test ElementReference-improved.test.tsx
yarn test InLink-improved.test.tsx
yarn test google-sheets-integration.test.ts

# Run with coverage to see improvement
yarn test --coverage
```

## Measuring Test Quality

Good tests should:
1. **Fail when the implementation is broken** - Not just when mocks change
2. **Pass when the implementation works** - Regardless of internal details
3. **Be readable** - Clearly show what behavior is being tested
4. **Be maintainable** - Not break with minor refactoring
5. **Run fast** - But not at the expense of testing real behavior

## Migration Strategy

When improving existing tests:
1. Keep the original test file for reference
2. Create a new `-improved.test.ts` file
3. Focus on testing actual logic, not mocks
4. Add edge cases and error scenarios
5. Test integration between components
6. Once validated, replace the original test file