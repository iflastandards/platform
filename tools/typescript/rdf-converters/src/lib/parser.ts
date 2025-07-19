/**
 * RDF Parser Module
 * Handles parsing of various RDF formats into a common data structure
 */

import { Parser, Store, DataFactory, Quad } from 'n3';
import * as fs from 'fs';
import * as path from 'path';
import * as jsonld from 'jsonld';
import { RdfXmlParser } from 'rdfxml-streaming-parser';
import {
  RdfFormat,
  ResourceData,
  ParserOptions,
  NamespaceMapping,
} from './types';

const { namedNode } = DataFactory;

// Default namespace prefixes
export const DEFAULT_PREFIXES: NamespaceMapping = {
  skos: 'http://www.w3.org/2004/02/skos/core#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dcterms: 'http://purl.org/dc/terms/',
  dc: 'http://purl.org/dc/elements/1.1/',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  reg: 'http://metadataregistry.org/uri/profile/regap/',
};

export class RdfParser {
  private prefixes: NamespaceMapping = { ...DEFAULT_PREFIXES };

  /**
   * Parse an RDF file into a Store
   */
  async parseFile(filePath: string, options?: ParserOptions): Promise<Store> {
    const format = options?.format || this.detectFormat(filePath);
    const baseIRI = options?.baseIRI || `file://${path.resolve(filePath)}`;

    // Reset prefixes to defaults before parsing
    this.prefixes = { ...DEFAULT_PREFIXES };

    if (format === 'rdfxml') {
      return this.parseRdfXml(filePath, baseIRI);
    }

    let rdfData: string;
    let actualFormat = format;

    if (format === 'jsonld') {
      rdfData = await this.parseJsonLdToNQuads(filePath);
      actualFormat = 'nquads';
    } else {
      rdfData = fs.readFileSync(filePath, 'utf-8');
    }

    return this.parseString(rdfData, actualFormat, baseIRI);
  }

  /**
   * Parse RDF string data into a Store
   */
  private async parseString(
    data: string,
    format: RdfFormat,
    baseIRI: string
  ): Promise<Store> {
    const store = new Store();
    const parser = new Parser({
      baseIRI,
      format: this.getN3Format(format),
      blankNodePrefix: '_:b',
    });

    return new Promise((resolve, reject) => {
      parser.parse(data, (error, quad, prefixes) => {
        if (error) {
          reject(error);
        } else if (quad) {
          store.add(quad);
        } else {
          // Parsing complete, merge prefixes
          if (prefixes) {
            this.mergePrefixes(prefixes);
          }
          resolve(store);
        }
      });
    });
  }

  /**
   * Parse RDF/XML file
   */
  private async parseRdfXml(filePath: string, baseIRI: string): Promise<Store> {
    const store = new Store();

    return new Promise((resolve, reject) => {
      const rdfXmlParser = new RdfXmlParser({ baseIRI });
      const fileStream = fs.createReadStream(filePath);

      rdfXmlParser.on('data', (quad: Quad) => {
        store.add(quad);
      });

      rdfXmlParser.on('error', (error: Error) => {
        reject(error);
      });

      rdfXmlParser.on('end', () => {
        // Extract prefixes if available
        const prefixes = (rdfXmlParser as { prefixes?: Record<string, string> }).prefixes;
        if (prefixes) {
          this.mergePrefixesFromObject(prefixes);
        } else {
          // Try manual extraction
          this.extractPrefixesFromRdfXml(filePath);
        }
        resolve(store);
      });

      fileStream.pipe(rdfXmlParser);
    });
  }

  /**
   * Parse JSON-LD to N-Quads
   */
  private async parseJsonLdToNQuads(filePath: string): Promise<string> {
    const jsonldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Extract prefixes from context
    await this.extractPrefixesFromJsonLd(jsonldData);

    // Create document loader
    const documentLoader = this.createJsonLdDocumentLoader();

    // Convert to N-Quads
    const nquads = await jsonld.toRDF(jsonldData, {
      documentLoader,
    } as Parameters<typeof jsonld.toRDF>[1]);

    return typeof nquads === 'string' ? nquads : JSON.stringify(nquads);
  }

  /**
   * Extract resource data from Store
   */
  extractResources(
    store: Store,
    urlLiteralProperties: Set<string> = new Set()
  ): Map<string, ResourceData> {
    const resources = new Map<string, ResourceData>();
    const subjects = new Set<string>();
    const allURIs: string[] = [];

    // Collect all subjects and URIs
    for (const quad of store) {
      if (quad.subject.termType === 'NamedNode') {
        subjects.add(quad.subject.value);
        allURIs.push(quad.subject.value);
      }
      if (quad.object.termType === 'NamedNode') {
        allURIs.push(quad.object.value);
      }
    }

    // Infer additional prefixes from URIs
    this.inferNamespaceFromURIs(allURIs);

    // Extract properties for each resource
    for (const subjectUri of subjects) {
      const resourceData: ResourceData = {
        uri: subjectUri,
        properties: new Map(),
      };

      const quads = store.getQuads(namedNode(subjectUri), null, null, null);

      for (const quad of quads) {
        const predicate = quad.predicate.value;
        const object = quad.object;

        if (!resourceData.properties.has(predicate)) {
          resourceData.properties.set(predicate, []);
        }

        const values = resourceData.properties.get(predicate)!;

        if (object.termType === 'Literal') {
          values.push({
            value: object.value,
            language: object.language || undefined,
            datatype: object.datatype?.value,
            isLiteral: true,
          });
        } else if (object.termType === 'NamedNode') {
          values.push({
            value: urlLiteralProperties.has(predicate)
              ? object.value
              : this.toCurie(object.value),
            isLiteral: false,
          });
        }
      }

      resources.set(subjectUri, resourceData);
    }

    return resources;
  }

  /**
   * Get namespace prefixes
   */
  getPrefixes(): NamespaceMapping {
    return { ...this.prefixes };
  }

  /**
   * Expand CURIE to full URI
   */
  expandCurie(curie: string): string {
    const colonIndex = curie.indexOf(':');
    if (colonIndex === -1) {
      return curie;
    }

    const prefix = curie.substring(0, colonIndex);
    const localName = curie.substring(colonIndex + 1);

    return this.prefixes[prefix] ? this.prefixes[prefix] + localName : curie;
  }

  /**
   * Convert URI to CURIE
   */
  toCurie(uri: string): string {
    const sortedPrefixes = Object.entries(this.prefixes).sort(
      ([, a], [, b]) => b.length - a.length
    );

    for (const [prefix, namespace] of sortedPrefixes) {
      if (uri.startsWith(namespace)) {
        return `${prefix}:${uri.substring(namespace.length)}`;
      }
    }
    return uri;
  }

  /**
   * Detect RDF format from file extension
   */
  private detectFormat(filePath: string): RdfFormat {
    const ext = path.extname(filePath).toLowerCase();
    const formatMap: Record<string, RdfFormat> = {
      '.ttl': 'turtle',
      '.turtle': 'turtle',
      '.n3': 'turtle',
      '.nt': 'ntriples',
      '.ntriples': 'ntriples',
      '.jsonld': 'jsonld',
      '.json': 'jsonld',
      '.rdf': 'rdfxml',
      '.xml': 'rdfxml',
      '.owl': 'rdfxml',
    };

    return formatMap[ext] || 'turtle';
  }

  /**
   * Get N3.js format string
   */
  private getN3Format(format: RdfFormat): string {
    const formatMap: Record<RdfFormat, string> = {
      turtle: 'text/turtle',
      ntriples: 'application/n-triples',
      nquads: 'application/n-quads',
      jsonld: 'application/ld+json',
      rdfxml: 'application/rdf+xml',
    };
    return formatMap[format];
  }

  /**
   * Merge prefixes from parser
   */
  private mergePrefixes(prefixes: Record<string, unknown>): void {
    for (const [prefix, iri] of Object.entries(prefixes)) {
      if (iri && typeof iri === 'object' && 'value' in iri) {
        this.prefixes[prefix] = (iri as { value: string }).value;
      } else if (typeof iri === 'string') {
        this.prefixes[prefix] = iri;
      }
    }
  }

  /**
   * Merge prefixes from object
   */
  private mergePrefixesFromObject(prefixes: Record<string, string>): void {
    for (const [prefix, iri] of Object.entries(prefixes)) {
      if (typeof iri === 'string') {
        this.prefixes[prefix] = iri;
      }
    }
  }

  /**
   * Extract prefixes from JSON-LD context
   */
  private async extractPrefixesFromJsonLd(
    jsonldData: Record<string, unknown>
  ): Promise<void> {
    if (jsonldData['@context']) {
      const context = jsonldData['@context'];
      const contexts = Array.isArray(context) ? context : [context];

      for (const ctx of contexts) {
        if (typeof ctx === 'object' && ctx !== null) {
          for (const [key, value] of Object.entries(ctx)) {
            if (
              typeof value === 'string' &&
              value.startsWith('http') &&
              !key.startsWith('@')
            ) {
              this.prefixes[key] = value;
            }
          }
        }
      }
    }
  }

  /**
   * Extract prefixes from RDF/XML file
   */
  private extractPrefixesFromRdfXml(filePath: string): void {
    try {
      const xmlContent = fs.readFileSync(filePath, 'utf-8');
      const xmlnsRegex = /xmlns:(\w+)="([^"]+)"/g;
      let match;

      while ((match = xmlnsRegex.exec(xmlContent)) !== null) {
        const [, prefix, namespace] = match;
        if (!this.prefixes[prefix]) {
          this.prefixes[prefix] = namespace;
        }
      }
    } catch (error) {
      console.error(
        'Error extracting prefixes from RDF/XML:',
        error instanceof Error ? error.message : error
      );
    }
  }

  /**
   * Create JSON-LD document loader
   */
  private createJsonLdDocumentLoader() {
    const scriptDir = __dirname;
    const projectRoot = path.join(scriptDir, '..', '..', '..');

    return async (url: string) => {
      const contextMappings: Record<string, string> = {
        'http://metadataregistry.org/uri/schema/Contexts/elements_langmap.jsonld':
          'elements_langmap.jsonld',
        'http://metadataregistry.org/uri/schema/Contexts/concepts_langmap.jsonld':
          'concepts_langmap.jsonld',
        'http://iflastandards.info/ns/isbd/terms/Contexts/concepts_langmap.jsonld':
          'concepts_langmap.jsonld',
        'http://iflastandards.info/ns/isbd/terms/contentqualification/Contexts/concepts_langmap.jsonld':
          'concepts_langmap.jsonld',
      };

      if (contextMappings[url]) {
        const contextFile = contextMappings[url];
        const contextPath = path.join(
          projectRoot,
          'static',
          'data',
          'contexts',
          contextFile
        );

        if (fs.existsSync(contextPath)) {
          const localContext = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
          await this.extractPrefixesFromJsonLd(localContext);

          return {
            contextUrl: undefined,
            document: localContext,
            documentUrl: url,
          };
        }
      }

      // Return empty context for unhandled URLs
      return {
        contextUrl: undefined,
        document: { '@context': {} },
        documentUrl: url,
      };
    };
  }

  /**
   * Infer namespace from URIs
   */
  private inferNamespaceFromURIs(uris: string[]): void {
    // Implementation simplified for brevity
    // The full implementation would analyze URI patterns to infer namespaces
    const namespaceCount = new Map<string, number>();

    for (const uri of uris) {
      const hashIndex = uri.lastIndexOf('#');
      const slashIndex = uri.lastIndexOf('/');
      const splitIndex = hashIndex > slashIndex ? hashIndex : slashIndex;

      if (splitIndex > 0) {
        const namespace = uri.substring(0, splitIndex + 1);
        namespaceCount.set(namespace, (namespaceCount.get(namespace) || 0) + 1);
      }
    }

    // Add most common namespaces
    const sortedNamespaces = Array.from(namespaceCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    for (const [namespace, count] of sortedNamespaces) {
      if (count < 3) continue;

      if (!Object.values(this.prefixes).includes(namespace)) {
        const parts = namespace.split('/').filter((p) => p);
        const lastPart = parts[parts.length - 1].replace(/#$/, '');

        if (lastPart && !this.prefixes[lastPart]) {
          this.prefixes[lastPart] = namespace;
        }
      }
    }
  }
}