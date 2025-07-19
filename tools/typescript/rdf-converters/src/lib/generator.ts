/**
 * CSV Generator Module
 * Handles generation of CSV files from RDF resource data
 */

import { stringify } from 'csv-stringify/sync';
import {
  ResourceData,
  GeneratorOptions,
  DctapProfile,
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
    return stringify(csvData, {
      delimiter: options?.delimiter || ',',
      quote: options?.quoteChar || '"',
      escape: options?.escapeChar || '"',
    });
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
    // Extract profile data
    const { repeatableProperties, urlLiteralProperties, maxPerLanguageProperties } =
      this.getProfileData(profile);

    return this.generateCsv(
      resources,
      repeatableProperties,
      maxPerLanguageProperties,
      urlLiteralProperties,
      options
    );
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