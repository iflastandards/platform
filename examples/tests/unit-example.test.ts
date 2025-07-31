/**
 * UNIT TEST EXAMPLE - IFLA Standards Platform
 * ===========================================
 * 
 * CATEGORY: Unit Tests (@unit tag)
 * PURPOSE: Test individual functions, classes, or components in isolation
 * EXECUTION: Pre-commit hooks and nx affected --target=test
 * 
 * DIRECTORY PLACEMENT: 
 * - Co-located with source files: `src/lib/services/__tests__/service-name.unit.test.ts`
 * - OR grouped under: `src/test/unit/service-name.test.ts`
 * 
 * REQUIRED TAGS: @unit (not yet enforced but recommended for future categorization)
 * 
 * NX TARGETS THAT RUN THIS TEST:
 * - nx affected --target=test (pre-commit hook)
 * - nx run-many --target=test --all (comprehensive test suite)
 * - pnpm test:vitest (direct Vitest execution)
 * - pnpm test (via affected strategy)
 * 
 * GIT HOOKS THAT RUN THIS TEST:
 * - Pre-commit hook: Fast validation of changed code
 * - Pre-push hook: Full validation before push
 * 
 * PERFORMANCE REQUIREMENTS:
 * - Must be FAST (< 1 second per test file)
 * - No external dependencies (databases, APIs, file system)
 * - Use mocks for all external interactions
 * 
 * WHY THIS IS A UNIT TEST:
 * - Tests pure functions with predictable inputs/outputs
 * - Mocks all external dependencies
 * - Focuses on business logic, not integration
 * - Can run in any environment without setup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Example service being tested (this would be imported from your actual code)
interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  suggestion?: string;
}

class IFLAElementValidator {
  private requiredFields = ['identifier', 'label', 'definition'];
  
  /**
   * Validates IFLA element data structure
   * Pure function - perfect for unit testing
   */
  validateElement(element: Record<string, any>): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Check required fields
    this.requiredFields.forEach(field => {
      if (!element[field] || element[field].trim() === '') {
        results.push({
          type: 'error',
          message: `Missing required field: ${field}`,
          field: field,
          suggestion: `Please provide a value for ${field}`
        });
      }
    });
    
    // Validate identifier format
    if (element.identifier && !/^[a-zA-Z0-9_-]+$/.test(element.identifier)) {
      results.push({
        type: 'error',
        message: 'Invalid identifier format',
        field: 'identifier',
        suggestion: 'Use only letters, numbers, hyphens, and underscores'
      });
    }
    
    // Check for multilingual labels
    if (element.label && typeof element.label === 'object') {
      const languages = Object.keys(element.label);
      if (languages.length === 0) {
        results.push({
          type: 'warning',
          message: 'No language variants provided for label',
          field: 'label',
          suggestion: 'Consider adding at least an English (en) label'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Extracts language codes from field names
   * Another pure function ideal for unit testing
   */
  extractLanguageCodes(fieldNames: string[]): string[] {
    const langPattern = /_([a-z]{2}(-[A-Z]{2})?)$/;
    const languages = new Set<string>();
    
    fieldNames.forEach(field => {
      const match = field.match(langPattern);
      if (match) {
        languages.add(match[1]);
      }
    });
    
    return Array.from(languages).sort();
  }
}

// UNIT TESTS START HERE
describe('IFLAElementValidator - Unit Tests @unit', () => {
  let validator: IFLAElementValidator;
  
  beforeEach(() => {
    // Create fresh instance for each test
    validator = new IFLAElementValidator();
  });
  
  describe('Element Validation', () => {
    it('should pass validation for complete valid element', () => {
      const validElement = {
        identifier: 'test-element-001',
        label: 'Test Element',
        definition: 'A test element for validation'
      };
      
      const results = validator.validateElement(validElement);
      
      expect(results).toHaveLength(0);
    });
    
    it('should detect missing required fields', () => {
      const incompleteElement = {
        identifier: 'test-001',
        label: 'Test Element'
        // Missing definition
      };
      
      const results = validator.validateElement(incompleteElement);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('error');
      expect(results[0].field).toBe('definition');
      expect(results[0].message).toContain('Missing required field: definition');
    });
    
    it('should detect invalid identifier format', () => {
      const elementWithBadId = {
        identifier: 'test element!', // Spaces and special chars not allowed
        label: 'Test Element',
        definition: 'A test element'
      };
      
      const results = validator.validateElement(elementWithBadId);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('error');
      expect(results[0].field).toBe('identifier');
      expect(results[0].message).toContain('Invalid identifier format');
    });
    
    it('should handle empty string fields as missing', () => {
      const elementWithEmptyFields = {
        identifier: 'test-001',
        label: '   ', // Whitespace only
        definition: ''  // Empty string
      };
      
      const results = validator.validateElement(elementWithEmptyFields);
      
      expect(results).toHaveLength(2);
      expect(results.map(r => r.field)).toContain('label');
      expect(results.map(r => r.field)).toContain('definition');
    });
    
    it('should warn about missing multilingual labels', () => {
      const elementWithEmptyLabels = {
        identifier: 'test-001',
        label: {}, // Empty language object
        definition: 'A test element'
      };
      
      const results = validator.validateElement(elementWithEmptyLabels);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('warning');
      expect(results[0].field).toBe('label');
      expect(results[0].message).toContain('No language variants provided');
    });
  });
  
  describe('Language Code Extraction', () => {
    it('should extract language codes from field names', () => {
      const fieldNames = [
        'label_en',
        'label_fr', 
        'definition_es',
        'note_de-DE',
        'regular_field', // No language suffix
        'another_field_with_underscores'
      ];
      
      const languages = validator.extractLanguageCodes(fieldNames);
      
      expect(languages).toEqual(['de-DE', 'en', 'es', 'fr']);
    });
    
    it('should return empty array when no language codes found', () => {
      const fieldNames = ['identifier', 'label', 'definition'];
      
      const languages = validator.extractLanguageCodes(fieldNames);
      
      expect(languages).toEqual([]);
    });
    
    it('should handle empty field names array', () => {
      const languages = validator.extractLanguageCodes([]);
      
      expect(languages).toEqual([]);
    });
    
    it('should deduplicate language codes', () => {
      const fieldNames = [
        'label_en',
        'definition_en', // Duplicate 'en'
        'note_en',       // Another duplicate 'en'
        'label_fr'
      ];
      
      const languages = validator.extractLanguageCodes(fieldNames);
      
      expect(languages).toEqual(['en', 'fr']);
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle null input gracefully', () => {
      const results = validator.validateElement(null as any);
      
      // Should detect missing fields even with null input
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.type === 'error')).toBe(true);
    });
    
    it('should handle undefined properties', () => {
      const elementWithUndefined = {
        identifier: undefined,
        label: 'Test',
        definition: 'Test definition'
      };
      
      const results = validator.validateElement(elementWithUndefined);
      
      expect(results).toHaveLength(1);
      expect(results[0].field).toBe('identifier');
      expect(results[0].type).toBe('error');
    });
  });
});

/**
 * SUMMARY OF TEST CHARACTERISTICS:
 * 
 * ✅ FAST: All tests complete in milliseconds
 * ✅ ISOLATED: No external dependencies or side effects  
 * ✅ PREDICTABLE: Same input always produces same output
 * ✅ FOCUSED: Tests single responsibility (validation logic)
 * ✅ COMPREHENSIVE: Covers happy path, edge cases, and error conditions
 * ✅ MAINTAINABLE: Clear test names and structure
 * 
 * WHEN TO RUN: These tests run on every commit and in CI/CD pipelines
 * WHERE TO PLACE: Co-locate with source files for easy discovery
 * HOW TO EXTEND: Add new describe blocks for new validation rules
 */
