/**
 * CSV Generator Module
 * Handles generation of CSV files from RDF resource data
 */

import { stringify } from 'csv-stringify/sync';
import {
  ResourceData,
  GeneratorOptions,
  DctapProfile,
  DctapProperty,
} from './types';

export class CsvGenerator {
  private prefixExpander: (curie: string) => string;
  private curieMaker: (uri: string) => string;

  constructor(
    prefixExpander: (curie: string) => string,
    curieMaker: (uri: string) => string
  ) {
    this.prefixExpander = prefixExpander;
    this.curieMaker = curieMaker;
  }

  /**
   * Generate CSV from resources
   */
  generateCsv(
    resources: Map<string, ResourceData>,
    repeatableProperties: Map<string, boolean>,
    maxPerLanguageProperties: Map<string, number>,
    urlLiteralProperties: Map<string, boolean>,
    options?: GeneratorOptions
  ): string {
    const headers = this.generateHeaders(
      resources,
      repeatableProperties,
      maxPerLanguageProperties
    );

    const rows = this.generateRows(
      resources,
      headers,
      repeatableProperties,
      urlLiteralProperties
    );

    const csvData = [headers, ...rows];
    const csvString = stringify(csvData, {
      delimiter: options?.delimiter || ',',
      quote: options?.quoteChar || '"',
      escape: options?.escapeChar || '"',
    });
    
    // Remove trailing newline if present
    return csvString.endsWith('\n') ? csvString.slice(0, -1) : csvString;
  }

  /**
   * Generate CSV headers based on resource properties
   */
  private generateHeaders(
    resources: Map<string, ResourceData>,
    repeatableProperties: Map<string, boolean>,
    maxPerLanguageProperties: Map<string, number>
  ): string[] {
    const headers: string[] = ['uri'];
    const propertyLanguageCounts = new Map<string, Map<string, number>>();

    // First pass: count occurrences of each property-language combination
    for (const resource of resources.values()) {
      for (const [property, values] of resource.properties) {
        if (!propertyLanguageCounts.has(property)) {
          propertyLanguageCounts.set(property, new Map());
        }

        const langCounts = propertyLanguageCounts.get(property)!;
        const langOccurrences = new Map<string, number>();

        for (const value of values) {
          const lang = value.language || '';
          langOccurrences.set(lang, (langOccurrences.get(lang) || 0) + 1);
        }

        for (const [lang, count] of langOccurrences) {
          langCounts.set(lang, Math.max(langCounts.get(lang) || 0, count));
        }
      }
    }

    // Second pass: generate headers
    const sortedProperties = Array.from(propertyLanguageCounts.keys()).sort();

    for (const property of sortedProperties) {
      const curie = this.curieMaker(property);
      const langCounts = propertyLanguageCounts.get(property)!;
      const isRepeatable = repeatableProperties.get(property) || false;

      const sortedLangs = Array.from(langCounts.keys()).sort();

      for (const lang of sortedLangs) {
        const maxCount = langCounts.get(lang)!;
        const maxPerLanguage = maxPerLanguageProperties.get(property);

        if (isRepeatable) {
          // Check if this property has a maxPerLanguage constraint
          if (maxPerLanguage && maxPerLanguage === 1) {
            // For maxPerLanguage:1, don't add indices
            const header = lang ? `${curie}@${lang}` : curie;
            headers.push(header);
          } else {
            // Always add [0] index for repeatable properties
            const actualMaxCount = Math.max(maxCount, 1);
            for (let i = 0; i < actualMaxCount; i++) {
              const header = lang ? `${curie}@${lang}[${i}]` : `${curie}[${i}]`;
              headers.push(header);
            }
          }
        } else {
          const header = lang ? `${curie}@${lang}` : curie;
          headers.push(header);
        }
      }
    }

    return headers;
  }

  /**
   * Generate CSV rows from resources
   */
  private generateRows(
    resources: Map<string, ResourceData>,
    headers: string[],
    repeatableProperties: Map<string, boolean>,
    urlLiteralProperties: Map<string, boolean>
  ): string[][] {
    const rows: string[][] = [];

    for (const resource of resources.values()) {
      const resourceId = this.curieMaker(resource.uri);
      const row: string[] = [resourceId];

      for (let i = 1; i < headers.length; i++) {
        const header = headers[i];
        let value = '';

        // Parse header to extract property and language
        const match = header.match(/^(.+?)(?:@([^[]+))?(?:\[(\d+)\])?$/);
        if (match) {
          const [, curie, lang, indexStr] = match;
          const property = this.prefixExpander(curie);
          const targetLang = lang || '';
          const targetIndex = indexStr ? parseInt(indexStr) : 0;

          if (resource.properties.has(property)) {
            const values = resource.properties.get(property)!;
            const filteredValues = values.filter(
              (v) => (v.language || '') === targetLang
            );

            if (filteredValues.length > targetIndex) {
              const val = filteredValues[targetIndex].value;
              // Check if this property should remain as a URL literal
              if (val.startsWith('http://') || val.startsWith('https://')) {
                if (urlLiteralProperties.has(property)) {
                  value = val; // Keep as full URL
                } else {
                  value = this.curieMaker(val); // Convert URI to CURIE
                }
              } else {
                value = val;
              }
            }
          }
        }

        row.push(value);
      }

      rows.push(row);
    }

    return rows;
  }

  /**
   * Generate CSV with IFLA DCTAP extensions
   */
  generateCsvWithProfile(
    resources: Map<string, ResourceData>,
    profile: DctapProfile,
    options?: GeneratorOptions
  ): string {
    // Generate headers based on DCTAP profile
    const headers = this.generateHeadersFromProfile(profile, resources);
    
    // Generate rows based on profile
    const rows = this.generateRowsFromProfile(resources, profile, headers);
    
    const csvData = [headers, ...rows];
    const csvString = stringify(csvData, {
      delimiter: options?.delimiter || ',',
      quote: options?.quoteChar || '"',
      escape: options?.escapeChar || '"',
    });
    
    // Remove trailing newline if present
    return csvString.endsWith('\n') ? csvString.slice(0, -1) : csvString;
  }

  /**
   * Generate headers from DCTAP profile with IFLA extensions
   */
  private generateHeadersFromProfile(
    profile: DctapProfile,
    resources: Map<string, ResourceData>
  ): string[] {
    const headers: string[] = ['uri'];
    const addedHeaders = new Set<string>();
    
    // Process profile properties in order to maintain consistent column order
    for (const shape of profile.shapes.values()) {
      for (const property of shape.properties) {
        const propertyUri = property.propertyID;
        const curie = this.curieMaker(propertyUri);
        
        // Handle different property formats based on DCTAP extensions
        if (property.isCsv) {
          // CSV format: propertyID[csv] or propertyID@lang[csv]
          const csvHeader = property.language 
            ? `${curie}@${property.language}[csv]`
            : `${curie}[csv]`;
          if (!addedHeaders.has(csvHeader)) {
            headers.push(csvHeader);
            addedHeaders.add(csvHeader);
          }
        } else if (property.isArray && property.arrayIndex !== undefined) {
          // Array format: propertyID[n] or propertyID@lang[n]
          const arrayHeader = property.language
            ? `${curie}@${property.language}[${property.arrayIndex}]`
            : `${curie}[${property.arrayIndex}]`;
          if (!addedHeaders.has(arrayHeader)) {
            headers.push(arrayHeader);
            addedHeaders.add(arrayHeader);
          }
        } else if (property.language) {
          // Language-specific: propertyID@lang
          const langHeader = `${curie}@${property.language}`;
          if (!addedHeaders.has(langHeader)) {
            headers.push(langHeader);
            addedHeaders.add(langHeader);
          }
        } else if (property.repeatable) {
          // For repeatable properties without specific format, generate array columns
          // Analyze the data to see what languages and counts we have
          const langCounts = new Map<string, number>();
          
          for (const resource of resources.values()) {
            // Need to use the expanded property URI to match the resource data
            const expandedUri = this.prefixExpander(propertyUri);
            const values = resource.properties.get(expandedUri) || [];
            const langOccurrences = new Map<string, number>();
            
            for (const value of values) {
              const lang = value.language || '';
              langOccurrences.set(lang, (langOccurrences.get(lang) || 0) + 1);
            }
            
            for (const [lang, count] of langOccurrences) {
              langCounts.set(lang, Math.max(langCounts.get(lang) || 0, count));
            }
          }
          
          // Generate headers for each language and occurrence
          const sortedLangs = Array.from(langCounts.keys()).sort();
          for (const lang of sortedLangs) {
            const maxCount = langCounts.get(lang)!;
            for (let i = 0; i < maxCount; i++) {
              const header = lang 
                ? `${curie}@${lang}[${i}]`
                : `${curie}[${i}]`;
              if (!addedHeaders.has(header)) {
                headers.push(header);
                addedHeaders.add(header);
              }
            }
          }
          
          // If no data found, still add at least one column for the property
          if (langCounts.size === 0) {
            const header = `${curie}[0]`;
            if (!addedHeaders.has(header)) {
              headers.push(header);
              addedHeaders.add(header);
            }
          }
        } else {
          // Simple non-repeatable property
          // Check what languages exist in the data
          const langs = new Set<string>();
          for (const resource of resources.values()) {
            // Need to use the expanded property URI to match the resource data
            const expandedUri = this.prefixExpander(propertyUri);
            const values = resource.properties.get(expandedUri) || [];
            for (const value of values) {
              langs.add(value.language || '');
            }
          }
          
          if (langs.size === 0) {
            // No data found, add simple header
            if (!addedHeaders.has(curie)) {
              headers.push(curie);
              addedHeaders.add(curie);
            }
          } else {
            // Add header for each language found
            const sortedLangs = Array.from(langs).sort();
            for (const lang of sortedLangs) {
              const header = lang ? `${curie}@${lang}` : curie;
              if (!addedHeaders.has(header)) {
                headers.push(header);
                addedHeaders.add(header);
              }
            }
          }
        }
      }
    }
    
    return headers;
  }

  /**
   * Generate rows from resources using DCTAP profile
   */
  private generateRowsFromProfile(
    resources: Map<string, ResourceData>,
    profile: DctapProfile,
    headers: string[]
  ): string[][] {
    const rows: string[][] = [];
    
    for (const resource of resources.values()) {
      const resourceId = this.curieMaker(resource.uri);
      const row: string[] = [resourceId];
      
      // Process each header (skip 'uri' at index 0)
      for (let i = 1; i < headers.length; i++) {
        const header = headers[i];
        let value = '';
        
        // Find the property definition for this header
        const propertyDef = this.findPropertyForHeader(header, profile);
        
        // console.error(`Header: ${header}, Found property: ${propertyDef?.propertyID}`);
        
        if (propertyDef) {
          // Use expanded property URI to match resource data
          const propertyUri = this.prefixExpander(propertyDef.propertyID);
          
          if (resource.properties.has(propertyUri)) {
            const values = resource.properties.get(propertyUri)!;
            
            // Filter by language based on the header
            let filteredValues = values;
            
            // Parse the header to get the actual language requested
            const headerLangMatch = header.match(/@([^[]+)/);
            if (headerLangMatch) {
              const headerLang = headerLangMatch[1];
              filteredValues = values.filter(v => v.language === headerLang);
            } else if (!header.includes('@')) {
              // No language in header - be flexible about language matching
              // If the property definition doesn't specify a language, accept any values
              if (!propertyDef.language) {
                // Use all values regardless of language
                filteredValues = values;
              } else {
                // Property definition specifies no language, so only accept values without language
                filteredValues = values.filter(v => !v.language);
              }
            }
            
            if (propertyDef.isCsv) {
              // Join all values with semicolon for CSV format
              value = filteredValues
                .map(v => this.formatValue(v.value, propertyUri, propertyDef))
                .join(';');
            } else if (propertyDef.isArray && propertyDef.arrayIndex !== undefined) {
              // Get specific index for array format
              if (filteredValues.length > propertyDef.arrayIndex) {
                value = this.formatValue(
                  filteredValues[propertyDef.arrayIndex].value,
                  propertyUri,
                  propertyDef
                );
              }
            } else {
              // Check if header has array index
              const arrayMatch = header.match(/\[(\d+)\]$/);
              if (arrayMatch) {
                const index = parseInt(arrayMatch[1]);
                if (filteredValues.length > index) {
                  value = this.formatValue(
                    filteredValues[index].value,
                    propertyUri,
                    propertyDef
                  );
                }
              } else {
                // Get first value for non-repeatable properties
                if (filteredValues.length > 0) {
                  value = this.formatValue(
                    filteredValues[0].value,
                    propertyUri,
                    propertyDef
                  );
                }
              }
            }
          }
        }
        
        row.push(value);
      }
      
      rows.push(row);
    }
    
    return rows;
  }

  /**
   * Find property definition for a given header
   */
  private findPropertyForHeader(
    header: string,
    profile: DctapProfile
  ): DctapProperty | undefined {
    // Parse the header to extract components
    const headerMatch = header.match(/^(.+?)(?:@([^[]+))?(?:\[(\d+|csv)\])?$/);
    if (!headerMatch) return undefined;
    
    const [, headerCurie, headerLang, headerFormat] = headerMatch;
    
    // Search through all properties in the profile
    for (const shape of profile.shapes.values()) {
      for (const property of shape.properties) {
        const propertyCurie = this.curieMaker(property.propertyID);
        
        // Check if the base property matches
        if (propertyCurie !== headerCurie) continue;
        
        // For properties in the profile, we match just on the property ID
        // The language and format in the header come from the actual data,
        // not from the profile definition
        
        // If the profile has specific extensions, check them
        if (property.language && property.language !== headerLang) {
          continue;
        }
        
        if (property.isCsv && headerFormat !== 'csv') {
          continue;
        }
        
        if (property.isArray && property.arrayIndex !== undefined) {
          if (headerFormat !== String(property.arrayIndex)) {
            continue;
          }
        }
        
        // Found a matching property
        return property;
      }
    }
    
    return undefined;
  }

  /**
   * Format a value based on property definition
   */
  private formatValue(
    value: string,
    propertyUri: string,
    propertyDef: DctapProperty
  ): string {
    // Handle URI values
    if (value.startsWith('http://') || value.startsWith('https://')) {
      // Check if property should keep URL literal
      if (
        propertyDef.valueDataType === 'xsd:anyURI' ||
        propertyDef.valueDataType === 'anyURI' ||
        propertyDef.valueNodeType === 'IRI'
      ) {
        // For IRI values, convert to CURIE unless it's explicitly a URL literal
        return this.curieMaker(value);
      }
    }
    
    return value;
  }

  /**
   * Extract profile data from DCTAP profile
   */
  private getProfileData(profile: DctapProfile) {
    const repeatableProperties = new Map<string, boolean>();
    const urlLiteralProperties = new Map<string, boolean>();
    const maxPerLanguageProperties = new Map<string, number>();

    for (const shape of profile.shapes.values()) {
      for (const property of shape.properties) {
        const propertyID = this.prefixExpander(property.propertyID);

        if (property.repeatable) {
          repeatableProperties.set(propertyID, true);
        }

        if (
          property.valueDataType === 'xsd:anyURI' ||
          property.valueDataType === 'anyURI'
        ) {
          urlLiteralProperties.set(propertyID, true);
        }

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
}

/**
 * Filter out container resources (ConceptSchemes, etc.)
 */
export function filterContainerResources(
  resources: Map<string, ResourceData>,
  expandCurie: (curie: string) => string
): Map<string, ResourceData> {
  const filtered = new Map<string, ResourceData>();

  for (const [uri, resource] of resources) {
    // Check if this resource has a type that indicates it's a container
    const rdfTypeProperty = expandCurie('rdf:type');
    const types = resource.properties.get(rdfTypeProperty);

    if (types) {
      const typeValues = types.map((t) => t.value);

      // Filter out ConceptSchemes and other container types
      if (
        typeValues.includes('skos:ConceptScheme') ||
        typeValues.includes(expandCurie('skos:ConceptScheme'))
      ) {
        continue;
      }
    }

    // Also filter out resources that appear to be ElementSets or namespaces
    if (uri.endsWith('/') || uri.endsWith('#')) {
      const hasTopConcept = resource.properties.has(
        expandCurie('skos:hasTopConcept')
      );
      const hasTitle = resource.properties.has(expandCurie('dc:title'));
      const hasNoSpecificType =
        !resource.properties.has(rdfTypeProperty) ||
        resource.properties.get(rdfTypeProperty)?.length === 0;

      if (hasTopConcept || (hasTitle && hasNoSpecificType)) {
        continue;
      }
    }

    // Filter out status/metadata concepts
    if (uri.includes('RegStatus') || uri.includes('/uri/')) {
      continue;
    }

    // Keep this resource
    filtered.set(uri, resource);
  }

  return filtered;
}