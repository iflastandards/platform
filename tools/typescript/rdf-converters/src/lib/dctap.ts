/**
 * DCTAP (Dublin Core Tabular Application Profiles) Module
 * Handles DCTAP profile parsing and IFLA extensions
 */

import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import {
  DctapProfile,
  DctapShape,
  DctapProperty,
  ValidationError,
} from './types';

export class DctapProfileParser {
  /**
   * Load and parse a DCTAP profile from CSV file
   */
  async loadProfile(filePath: string): Promise<DctapProfile> {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      comment: '#',
    }) as Record<string, string>[];

    const shapes = new Map<string, DctapShape>();
    const metadata: DctapProfile['metadata'] = {
      mandatoryLanguages: [],
    };

    // Process records
    for (const record of records) {
      // Skip empty records
      if (!record.propertyID && !record.shapeID) continue;

      // Handle metadata rows
      if (record.shapeID?.startsWith('@')) {
        this.processMetadata(record, metadata);
        continue;
      }

      // Process property definitions
      if (record.propertyID) {
        const property = this.parseProperty(record);
        const shapeId = record.shapeID || 'default';

        if (!shapes.has(shapeId)) {
          shapes.set(shapeId, {
            shapeID: shapeId,
            shapeLabel: record.shapeLabel,
            properties: [],
          });
        }

        shapes.get(shapeId)!.properties.push(property);
      }
    }

    return { shapes, metadata };
  }

  /**
   * Parse a property definition with IFLA extensions
   */
  private parseProperty(record: Record<string, string>): DctapProperty {
    const propertyID = record.propertyID;
    let processedID = propertyID;
    let isMandatory = false;
    let language: string | undefined;
    let isArray = false;
    let isCsv = false;
    let arrayIndex: number | undefined;

    // Check for IFLA extensions

    // 1. Mandatory marker (*)
    if (processedID.startsWith('*')) {
      isMandatory = true;
      processedID = processedID.substring(1);
    }

    // 2. Language tag (@lang)
    const langMatch = processedID.match(/^(.+)@(\w+)$/);
    if (langMatch) {
      processedID = langMatch[1];
      language = langMatch[2];
    }

    // 3. Array index ([0], [1], etc.)
    const arrayMatch = processedID.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      processedID = arrayMatch[1];
      isArray = true;
      arrayIndex = parseInt(arrayMatch[2]);
    }

    // 4. CSV format ([csv])
    const csvMatch = processedID.match(/^(.+)\[csv\]$/);
    if (csvMatch) {
      processedID = csvMatch[1];
      isCsv = true;
    }

    // Parse standard DCTAP fields
    const property: DctapProperty = {
      propertyID: processedID,
      propertyLabel: record.propertyLabel,
      mandatory: this.parseBoolean(record.mandatory) || isMandatory,
      repeatable: this.parseBoolean(record.repeatable),
      valueNodeType: this.parseValueNodeType(record.valueNodeType),
      valueDataType: record.valueDataType,
      valueConstraint: record.valueConstraint,
      valueConstraintType: record.valueConstraintType,
      valueShape: record.valueShape,
      note: record.note,
      // IFLA extensions
      isMandatory,
      language,
      isArray,
      isCsv,
      arrayIndex,
      originalPropertyID: propertyID,
    };

    return property;
  }

  /**
   * Process metadata rows
   */
  private processMetadata(
    record: Record<string, string>,
    metadata: DctapProfile['metadata']
  ): void {
    if (!metadata) return;
    
    const key = record.shapeID.substring(1); // Remove @ prefix

    switch (key) {
      case 'name':
        metadata.name = record.propertyID;
        break;
      case 'version':
        metadata.version = record.propertyID;
        break;
      case 'description':
        metadata.description = record.propertyID;
        break;
      case 'mandatoryLanguages':
        metadata.mandatoryLanguages = record.propertyID.split(',').map((l) => l.trim());
        break;
    }
  }

  /**
   * Get profile data for compatibility
   */
  getProfileData(profile: DctapProfile): {
    repeatableProperties: Map<string, boolean>;
    urlLiteralProperties: Map<string, boolean>;
    maxPerLanguageProperties: Map<string, number>;
  } {
    const repeatableProperties = new Map<string, boolean>();
    const urlLiteralProperties = new Map<string, boolean>();
    const maxPerLanguageProperties = new Map<string, number>();

    for (const shape of profile.shapes.values()) {
      for (const property of shape.properties) {
        const propertyID = property.propertyID;

        // Handle repeatable properties
        if (property.repeatable) {
          repeatableProperties.set(propertyID, true);
        }

        // Handle URL literal properties
        if (
          property.valueDataType === 'xsd:anyURI' ||
          property.valueDataType === 'anyURI'
        ) {
          urlLiteralProperties.set(propertyID, true);
        }

        // Handle maxPerLanguage constraint
        if (
          property.valueConstraint &&
          property.valueConstraint.startsWith('maxPerLanguage:')
        ) {
          const maxCount = parseInt(property.valueConstraint.split(':')[1]);
          if (!isNaN(maxCount)) {
            maxPerLanguageProperties.set(propertyID, maxCount);
          }
        }
      }
    }

    return {
      repeatableProperties,
      urlLiteralProperties,
      maxPerLanguageProperties,
    };
  }

  /**
   * Validate resource data against profile
   */
  validateResource(
    resourceUri: string,
    resourceData: Map<string, Array<{ language?: string }>>,
    shape: DctapShape,
    mandatoryLanguages: string[] = []
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check mandatory properties
    for (const property of shape.properties) {
      if (property.mandatory && !resourceData.has(property.propertyID)) {
        errors.push({
          severity: 'error',
          resourceUri,
          propertyID: property.propertyID,
          message: `Mandatory property '${property.propertyID}' is missing`,
        });
      }

      // Check mandatory languages
      if (property.language && mandatoryLanguages.includes(property.language)) {
        const values = resourceData.get(property.propertyID) || [];
        const hasLanguage = values.some(
          (v) => v.language === property.language
        );

        if (!hasLanguage) {
          errors.push({
            severity: 'error',
            resourceUri,
            propertyID: property.propertyID,
            message: `Missing mandatory language '${property.language}' for property '${property.propertyID}'`,
          });
        }
      }
    }

    return errors;
  }

  /**
   * Parse boolean value
   */
  private parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' || value === '1';
  }

  /**
   * Parse value node type
   */
  private parseValueNodeType(
    value: string | undefined
  ): 'IRI' | 'literal' | 'bnode' | undefined {
    if (!value) return undefined;
    const lower = value.toLowerCase();
    if (lower === 'iri' || lower === 'uri') return 'IRI';
    if (lower === 'literal') return 'literal';
    if (lower === 'bnode' || lower === 'blank') return 'bnode';
    return undefined;
  }
}

/**
 * Create default profile data for when no DCTAP file is provided
 */
export function createDefaultProfileData(expandCurie: (curie: string) => string) {
  return {
    repeatableProperties: new Map([
      [expandCurie('skos:definition'), true],
      [expandCurie('skos:scopeNote'), true],
      [expandCurie('rdfs:label'), true],
      [expandCurie('skos:altLabel'), true],
      [expandCurie('skos:changeNote'), true],
      [expandCurie('skos:editorialNote'), true],
      [expandCurie('skos:historyNote'), true],
      [expandCurie('skos:example'), true],
      [expandCurie('skos:notation'), true],
      [expandCurie('skos:prefLabel'), true],
    ]),
    urlLiteralProperties: new Map<string, boolean>(),
    maxPerLanguageProperties: new Map([
      [expandCurie('skos:prefLabel'), 1],
    ]),
  };
}