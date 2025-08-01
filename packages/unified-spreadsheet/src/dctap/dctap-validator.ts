/**
 * DCTAP (Dublin Core Tabular Application Profiles) validator
 * Validates spreadsheet data against DCTAP profiles for RDF conversion
 */

import type {
  Workbook,
  Sheet,
  Row,
  CellValue,
  DctapProfile,
  DctapShape,
  DctapProperty,
  ValidationError
} from '../types';

/**
 * Configuration options for DCTAP validator
 */
export interface DctapValidatorOptions {
  languages?: string[];
  mode?: 'strict' | 'loose';
  includeWarnings?: boolean;
}

/**
 * Validator for DCTAP profiles
 * Ensures data conforms to RDF requirements before conversion
 */
export class DctapValidator {
  private options: Required<DctapValidatorOptions>;

  constructor(options: DctapValidatorOptions = {}) {
    this.options = {
      languages: options.languages || ['en'],
      mode: options.mode || 'strict',
      includeWarnings: options.includeWarnings ?? true
    };
  }

  /**
   * Validate workbook against DCTAP profile
   * @param workbook - Workbook to validate
   * @param profile - DCTAP profile to validate against
   * @returns Array of validation errors (empty if valid)
   */
  async validate(workbook: Workbook, profile: DctapProfile): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate each sheet
    for (const sheet of workbook.sheets) {
      const sheetErrors = await this.validateSheet(sheet, profile);
      errors.push(...sheetErrors);
    }

    return errors;
  }

  /**
   * Validate single sheet against DCTAP profile
   * @param sheet - Sheet to validate
   * @param profile - DCTAP profile
   * @returns Array of validation errors
   */
  async validateSheet(sheet: Sheet, profile: DctapProfile): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check if sheet has required headers
    if (!sheet.headers || sheet.headers.length === 0) {
      errors.push({
        severity: 'error',
        message: 'Sheet must have headers for DCTAP validation',
        suggestion: 'Add header row with property names'
      });
      return errors;
    }

    // Validate each row
    sheet.data.forEach((row, rowIndex) => {
      const rowErrors = this.validateRow(row, rowIndex + 2, sheet, profile);
      errors.push(...rowErrors);
    });

    // Check for missing mandatory properties
    if (this.options.mode === 'strict') {
      const missingErrors = this.checkMissingMandatory(sheet, profile);
      errors.push(...missingErrors);
    }

    return errors;
  }

  /**
   * Validate single row against DCTAP profile
   */
  private validateRow(
    row: Row, 
    rowNumber: number, 
    sheet: Sheet, 
    profile: DctapProfile
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Get shape for this row (could be based on a type column)
    const shapeId = this.determineShape(row, profile);
    if (!shapeId) {
      if (this.options.mode === 'strict') {
        errors.push({
          severity: 'error',
          row: rowNumber,
          message: 'Could not determine shape/type for row',
          suggestion: 'Add a type column or ensure row matches a defined shape'
        });
      }
      return errors;
    }

    const shape = profile.shapes.get(shapeId);
    if (!shape) {
      errors.push({
        severity: 'error',
        row: rowNumber,
        message: `Unknown shape: ${shapeId}`,
        suggestion: 'Use one of the defined shapes in the profile'
      });
      return errors;
    }

    // Validate each property in the shape
    for (const property of shape.properties) {
      const columnErrors = this.validateProperty(
        row,
        rowNumber,
        property,
        sheet.headers || []
      );
      errors.push(...columnErrors);
    }

    return errors;
  }

  /**
   * Validate property value according to DCTAP constraints
   */
  private validateProperty(
    row: Row,
    rowNumber: number,
    property: DctapProperty,
    headers: string[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Find columns for this property (considering language variants)
    const propertyColumns = this.findPropertyColumns(property, headers);
    
    if (propertyColumns.length === 0 && property.isMandatory) {
      errors.push({
        severity: 'error',
        row: rowNumber,
        propertyID: property.propertyID,
        message: `Missing mandatory property: ${property.propertyLabel || property.propertyID}`,
        suggestion: `Add column for ${property.propertyID}`
      });
      return errors;
    }

    // Validate each column value
    for (const column of propertyColumns) {
      const value = row[column];
      
      // Check mandatory
      if (property.isMandatory && this.isEmpty(value)) {
        errors.push({
          severity: 'error',
          row: rowNumber,
          column,
          propertyID: property.propertyID,
          message: `Missing value for mandatory property: ${property.propertyLabel || property.propertyID}`,
          suggestion: 'Provide a value for this property'
        });
        continue;
      }

      // Skip empty non-mandatory values
      if (this.isEmpty(value)) {
        continue;
      }

      // Validate value type
      const typeErrors = this.validateValueType(
        value,
        property,
        rowNumber,
        column
      );
      errors.push(...typeErrors);

      // Validate value constraints
      if (property.valueConstraint) {
        const constraintErrors = this.validateValueConstraint(
          value,
          property,
          rowNumber,
          column
        );
        errors.push(...constraintErrors);
      }
    }

    // Check repeatability
    if (!property.repeatable && propertyColumns.length > 1) {
      const nonEmptyColumns = propertyColumns.filter(col => !this.isEmpty(row[col]));
      if (nonEmptyColumns.length > 1) {
        errors.push({
          severity: 'warning',
          row: rowNumber,
          propertyID: property.propertyID,
          message: `Non-repeatable property has multiple values: ${property.propertyLabel || property.propertyID}`,
          suggestion: 'Use only one column for non-repeatable properties'
        });
      }
    }

    return errors;
  }

  /**
   * Validate value type according to DCTAP nodeType
   */
  private validateValueType(
    value: CellValue,
    property: DctapProperty,
    rowNumber: number,
    column: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Extract actual value if it's a rich cell
    const actualValue = typeof value === 'object' && value !== null && 'value' in value
      ? value.value
      : value;

    switch (property.valueNodeType) {
      case 'IRI':
        if (!this.isValidIRI(actualValue)) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID: property.propertyID,
            message: `Invalid IRI: ${actualValue}`,
            suggestion: 'Use a valid URL or URI'
          });
        }
        break;

      case 'literal':
        // Check datatype if specified
        if (property.valueDataType) {
          const datatypeErrors = this.validateDatatype(
            actualValue,
            property.valueDataType,
            rowNumber,
            column,
            property.propertyID
          );
          errors.push(...datatypeErrors);
        }
        break;

      case 'bnode':
        // Blank nodes typically don't need validation
        break;
    }

    return errors;
  }

  /**
   * Validate value against datatype
   */
  private validateDatatype(
    value: any,
    datatype: string,
    rowNumber: number,
    column: string,
    propertyID: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Common XSD datatypes
    switch (datatype) {
      case 'xsd:string':
        // Strings are always valid
        break;

      case 'xsd:integer':
      case 'xsd:int':
        if (!Number.isInteger(Number(value))) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID,
            message: `Value must be an integer: ${value}`,
            suggestion: 'Use a whole number without decimals'
          });
        }
        break;

      case 'xsd:decimal':
      case 'xsd:float':
      case 'xsd:double':
        if (isNaN(Number(value))) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID,
            message: `Value must be a number: ${value}`,
            suggestion: 'Use a valid numeric value'
          });
        }
        break;

      case 'xsd:boolean':
        const boolStr = String(value).toLowerCase();
        if (!['true', 'false', '1', '0'].includes(boolStr)) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID,
            message: `Value must be a boolean: ${value}`,
            suggestion: 'Use true, false, 1, or 0'
          });
        }
        break;

      case 'xsd:date':
        if (!this.isValidDate(value)) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID,
            message: `Invalid date format: ${value}`,
            suggestion: 'Use ISO date format (YYYY-MM-DD)'
          });
        }
        break;

      case 'xsd:dateTime':
        if (!this.isValidDateTime(value)) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID,
            message: `Invalid datetime format: ${value}`,
            suggestion: 'Use ISO datetime format (YYYY-MM-DDTHH:mm:ss)'
          });
        }
        break;
    }

    return errors;
  }

  /**
   * Validate value against constraints
   */
  private validateValueConstraint(
    value: CellValue,
    property: DctapProperty,
    rowNumber: number,
    column: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!property.valueConstraint || !property.valueConstraintType) {
      return errors;
    }

    const actualValue = typeof value === 'object' && value !== null && 'value' in value
      ? String(value.value)
      : String(value);

    switch (property.valueConstraintType) {
      case 'picklist':
        const allowedValues = property.valueConstraint.split('|').map(v => v.trim());
        if (!allowedValues.includes(actualValue)) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID: property.propertyID,
            message: `Value not in allowed list: ${actualValue}`,
            suggestion: `Use one of: ${allowedValues.join(', ')}`
          });
        }
        break;

      case 'pattern':
        try {
          const regex = new RegExp(property.valueConstraint);
          if (!regex.test(actualValue)) {
            errors.push({
              severity: 'error',
              row: rowNumber,
              column,
              propertyID: property.propertyID,
              message: `Value does not match pattern: ${actualValue}`,
              suggestion: `Value must match pattern: ${property.valueConstraint}`
            });
          }
        } catch (e) {
          errors.push({
            severity: 'warning',
            row: rowNumber,
            column,
            propertyID: property.propertyID,
            message: `Invalid regex pattern in profile: ${property.valueConstraint}`,
            suggestion: 'Fix the pattern in the DCTAP profile'
          });
        }
        break;

      case 'minLength':
        const minLen = parseInt(property.valueConstraint);
        if (actualValue.length < minLen) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID: property.propertyID,
            message: `Value too short: ${actualValue.length} characters (minimum: ${minLen})`,
            suggestion: `Provide at least ${minLen} characters`
          });
        }
        break;

      case 'maxLength':
        const maxLen = parseInt(property.valueConstraint);
        if (actualValue.length > maxLen) {
          errors.push({
            severity: 'error',
            row: rowNumber,
            column,
            propertyID: property.propertyID,
            message: `Value too long: ${actualValue.length} characters (maximum: ${maxLen})`,
            suggestion: `Limit to ${maxLen} characters`
          });
        }
        break;
    }

    return errors;
  }

  /**
   * Check for missing mandatory properties across the sheet
   */
  private checkMissingMandatory(sheet: Sheet, profile: DctapProfile): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // This would check if mandatory properties are completely missing
    // from the sheet structure, not just individual rows
    
    return errors;
  }

  /**
   * Determine which shape applies to a row
   */
  private determineShape(row: Row, profile: DctapProfile): string | null {
    // Look for a type column
    const typeValue = row['type'] || row['Type'] || row['rdf:type'];
    if (typeValue) {
      // Try to match against shape IDs
      for (const [shapeId] of profile.shapes) {
        if (String(typeValue).includes(shapeId)) {
          return shapeId;
        }
      }
    }

    // If only one shape in profile, use it
    if (profile.shapes.size === 1) {
      return Array.from(profile.shapes.keys())[0];
    }

    return null;
  }

  /**
   * Find columns that correspond to a property
   */
  private findPropertyColumns(property: DctapProperty, headers: string[]): string[] {
    const columns: string[] = [];

    // Direct match
    if (headers.includes(property.propertyID)) {
      columns.push(property.propertyID);
    }

    // Label match
    if (property.propertyLabel && headers.includes(property.propertyLabel)) {
      columns.push(property.propertyLabel);
    }

    // Language-specific columns
    if (property.language) {
      const langColumn = `${property.propertyID}@${property.language}`;
      if (headers.includes(langColumn)) {
        columns.push(langColumn);
      }
    } else {
      // Check for any language variants
      const langPattern = new RegExp(`^${property.propertyID}@\\w+$`);
      headers.forEach(header => {
        if (langPattern.test(header)) {
          columns.push(header);
        }
      });
    }

    // Array columns (for IFLA extensions)
    if (property.isArray) {
      const arrayPattern = new RegExp(`^${property.propertyID}\\[\\d+\\]$`);
      headers.forEach(header => {
        if (arrayPattern.test(header)) {
          columns.push(header);
        }
      });
    }

    return columns;
  }

  /**
   * Check if value is empty
   */
  private isEmpty(value: CellValue): boolean {
    return value === null || 
           value === undefined || 
           value === '' ||
           (typeof value === 'object' && value !== null && 'value' in value && this.isEmpty(value.value));
  }

  /**
   * Validate IRI format
   */
  private isValidIRI(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    // Simple IRI validation - could be more sophisticated
    try {
      new URL(value);
      return true;
    } catch {
      // Also accept URNs and other URI schemes
      return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
    }
  }

  /**
   * Validate date format
   */
  private isValidDate(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime());
    
    const dateStr = String(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  /**
   * Validate datetime format
   */
  private isValidDateTime(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime());
    
    const dateStr = String(value);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
}