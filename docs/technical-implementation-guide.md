# Technical Implementation Guide - IFLA Standards Platform

## Table of Contents

1. [Spreadsheet Import Component](#spreadsheet-import-component)
2. [RDF Generation Service](#rdf-generation-service)
3. [GitHub Integration Service](#github-integration-service)
4. [Vocabulary Editor Component](#vocabulary-editor-component)
5. [Version Management System](#version-management-system)
6. [Translation Sync Service](#translation-sync-service)

---

## 1. Spreadsheet Import Component

### Overview
The Spreadsheet Import Component handles the complete workflow of importing vocabulary data from Google Sheets into the platform.

### Architecture

```typescript
// apps/admin/src/domains/vocabulary/import/
├── types.ts                 // Type definitions
├── validation.ts           // DCTAP validation logic
├── parser.ts              // CSV parsing utilities
├── transformer.ts         // CSV to vocabulary transformation
├── components/
│   ├── ImportWizard.tsx   // Main wizard component
│   ├── SheetSelector.tsx  // Sheet selection UI
│   ├── ValidationResults.tsx // Validation display
│   └── PreviewGrid.tsx    // Preview component
└── services/
    ├── sheets-service.ts   // Google Sheets API wrapper
    └── import-service.ts   // Import orchestration
```

### Implementation Details

#### 1.1 Type Definitions

```typescript
// types.ts
export interface ImportConfig {
  namespaceId: string;
  spreadsheetId: string;
  dctapProfileId: string;
  dryRun: boolean;
  options: ImportOptions;
}

export interface ImportOptions {
  overwriteExisting: boolean;
  validateOnly: boolean;
  generateDocs: boolean;
  commitMessage?: string;
}

export interface ImportResult {
  success: boolean;
  summary: ImportSummary;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  preview?: ImportPreview;
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  elementsCreated: number;
  elementsUpdated: number;
  documentsGenerated: number;
}

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportPreview {
  elements: PreviewElement[];
  changes: ChangeSet[];
  affectedFiles: string[];
}
```

#### 1.2 Google Sheets Service

```typescript
// services/sheets-service.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export class GoogleSheetsService {
  private auth: JWT;
  private sheets: any;

  constructor() {
    // Initialize with service account
    this.auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async fetchSheetData(spreadsheetId: string): Promise<SheetData> {
    try {
      // Get spreadsheet metadata
      const metadata = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
      });

      // Get all sheets
      const sheetPromises = metadata.data.sheets.map((sheet: any) =>
        this.fetchSingleSheet(spreadsheetId, sheet.properties.title)
      );

      const sheets = await Promise.all(sheetPromises);

      return {
        spreadsheetId,
        title: metadata.data.properties.title,
        sheets,
        lastModified: new Date(),
      };
    } catch (error) {
      if (error.code === 403) {
        throw new Error('Sheet not shared with service account');
      }
      throw error;
    }
  }

  private async fetchSingleSheet(
    spreadsheetId: string,
    sheetName: string
  ): Promise<Sheet> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`, // Fetch all columns
    });

    return {
      name: sheetName,
      headers: response.data.values?.[0] || [],
      rows: response.data.values?.slice(1) || [],
    };
  }

  async validateAccess(spreadsheetId: string): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'spreadsheetId',
      });
      return true;
    } catch {
      return false;
    }
  }

  async annotateErrors(
    spreadsheetId: string,
    sheetName: string,
    errors: ValidationError[]
  ): Promise<void> {
    // Group errors by cell
    const cellNotes = errors.reduce((acc, error) => {
      const cell = `${error.column}${error.row}`;
      if (!acc[cell]) acc[cell] = [];
      acc[cell].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);

    // Create batch update request
    const requests = Object.entries(cellNotes).map(([cell, messages]) => ({
      updateCells: {
        range: {
          sheetId: await this.getSheetId(spreadsheetId, sheetName),
          startRowIndex: parseInt(cell.slice(1)) - 1,
          endRowIndex: parseInt(cell.slice(1)),
          startColumnIndex: cell.charCodeAt(0) - 65,
          endColumnIndex: cell.charCodeAt(0) - 64,
        },
        rows: [{
          values: [{
            note: messages.join('\n'),
          }],
        }],
        fields: 'note',
      },
    }));

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests },
    });
  }
}
```

#### 1.3 DCTAP Validation

```typescript
// validation.ts
import { DCTAPProfile, ValidationResult } from '../types';

export class DCTAPValidator {
  constructor(private profile: DCTAPProfile) {}

  validateSheet(sheet: Sheet): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate headers match profile
    const requiredProperties = this.profile.shapes
      .flatMap(shape => shape.properties)
      .filter(prop => prop.mandatory)
      .map(prop => prop.propertyLabel);

    const missingHeaders = requiredProperties.filter(
      prop => !sheet.headers.includes(prop)
    );

    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        column: 'headers',
        value: sheet.headers,
        rule: 'required-properties',
        message: `Missing required columns: ${missingHeaders.join(', ')}`,
        severity: 'error',
      });
    }

    // Validate each row
    sheet.rows.forEach((row, index) => {
      this.validateRow(row, index + 2, sheet.headers, errors, warnings);
    });

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
    };
  }

  private validateRow(
    row: string[],
    rowNumber: number,
    headers: string[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    headers.forEach((header, colIndex) => {
      const value = row[colIndex];
      const property = this.findProperty(header);

      if (!property) return;

      // Check mandatory fields
      if (property.mandatory && !value) {
        errors.push({
          row: rowNumber,
          column: String.fromCharCode(65 + colIndex),
          value,
          rule: 'mandatory',
          message: `${header} is required`,
          severity: 'error',
        });
      }

      // Validate data type
      if (value && property.valueDataType) {
        const valid = this.validateDataType(value, property.valueDataType);
        if (!valid) {
          errors.push({
            row: rowNumber,
            column: String.fromCharCode(65 + colIndex),
            value,
            rule: 'datatype',
            message: `Invalid ${property.valueDataType} value`,
            severity: 'error',
          });
        }
      }

      // Check value constraints
      if (value && property.valueConstraint) {
        const valid = this.validateConstraint(value, property.valueConstraint);
        if (!valid) {
          warnings.push({
            row: rowNumber,
            column: String.fromCharCode(65 + colIndex),
            value,
            rule: 'constraint',
            message: `Value doesn't match constraint: ${property.valueConstraint}`,
            severity: 'warning',
          });
        }
      }
    });
  }

  private findProperty(label: string) {
    return this.profile.shapes
      .flatMap(shape => shape.properties)
      .find(prop => prop.propertyLabel === label);
  }

  private validateDataType(value: string, dataType: string): boolean {
    switch (dataType) {
      case 'xsd:string':
        return true;
      case 'xsd:integer':
        return /^\d+$/.test(value);
      case 'xsd:boolean':
        return ['true', 'false', '1', '0'].includes(value.toLowerCase());
      case 'xsd:anyURI':
        return /^https?:\/\//.test(value);
      default:
        return true;
    }
  }

  private validateConstraint(value: string, constraint: string): boolean {
    // Implement constraint validation logic
    // This could be regex, enumeration, or other constraint types
    return true;
  }
}
```

#### 1.4 Import Wizard Component

```typescript
// components/ImportWizard.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { SheetSelector } from './SheetSelector';
import { ValidationResults } from './ValidationResults';
import { PreviewGrid } from './PreviewGrid';
import { importSpreadsheet, validateSpreadsheet } from '../services/import-service';

interface ImportWizardProps {
  namespaceId: string;
  dctapProfileId: string;
}

export function ImportWizard({ namespaceId, dctapProfileId }: ImportWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (sheetId: string) => {
      return validateSpreadsheet({
        namespaceId,
        spreadsheetId: sheetId,
        dctapProfileId,
      });
    },
    onSuccess: (result) => {
      setValidation(result);
      if (result.valid) {
        setPreview(result.preview);
        setStep(3);
      } else {
        setStep(2);
      }
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (options: { dryRun: boolean }) => {
      return importSpreadsheet({
        namespaceId,
        spreadsheetId,
        dctapProfileId,
        dryRun: options.dryRun,
        options: {
          overwriteExisting: false,
          validateOnly: false,
          generateDocs: true,
        },
      });
    },
    onSuccess: (result, variables) => {
      if (variables.dryRun) {
        router.push(`/admin/namespace/${namespaceId}/pulls/${result.prNumber}`);
      } else {
        router.push(`/admin/namespace/${namespaceId}/vocabularies`);
      }
    },
  });

  const steps = [
    { title: 'Select Spreadsheet', description: 'Choose or link a Google Sheet' },
    { title: 'Validation', description: 'Check against DCTAP profile' },
    { title: 'Preview', description: 'Review changes before import' },
    { title: 'Import', description: 'Execute import operation' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Stepper steps={steps} currentStep={step} className="mb-8" />

      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Select Spreadsheet</h2>
          <SheetSelector
            onSelect={(id) => {
              setSpreadsheetId(id);
              validateMutation.mutate(id);
            }}
            namespaceId={namespaceId}
          />
        </Card>
      )}

      {step === 2 && validation && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Validation Results</h2>
          <ValidationResults
            result={validation}
            onFix={() => validateMutation.mutate(spreadsheetId)}
            onContinue={() => setStep(3)}
          />
        </Card>
      )}

      {step === 3 && preview && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Preview Import</h2>
          <PreviewGrid
            preview={preview}
            onBack={() => setStep(1)}
            onContinue={() => setStep(4)}
          />
        </Card>
      )}

      {step === 4 && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Confirm Import</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Choose how you want to import the vocabulary:
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 cursor-pointer hover:shadow-lg"
                onClick={() => importMutation.mutate({ dryRun: true })}>
                <h3 className="font-semibold">Create Pull Request</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Review changes in a pull request before merging
                </p>
              </Card>
              
              <Card className="p-4 cursor-pointer hover:shadow-lg"
                onClick={() => importMutation.mutate({ dryRun: false })}>
                <h3 className="font-semibold">Direct Import</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Import directly to the main branch
                </p>
              </Card>
            </div>

            {importMutation.isLoading && (
              <div className="text-center py-4">
                <span className="loading loading-spinner" />
                <p>Importing vocabulary...</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
```

---

## 2. RDF Generation Service

### Overview
The RDF Generation Service harvests RDF data from Docusaurus pages and generates vocabulary files in multiple formats.

### Architecture

```typescript
// packages/rdf-tools/
├── src/
│   ├── harvester.ts        // Extract RDF from pages
│   ├── serializer.ts       // Convert to different formats
│   ├── validator.ts        // Validate RDF data
│   ├── formats/
│   │   ├── turtle.ts       // Turtle serialization
│   │   ├── rdfxml.ts       // RDF/XML serialization
│   │   └── jsonld.ts       // JSON-LD serialization
│   └── utils/
│       ├── namespace.ts    // Namespace utilities
│       └── prefixes.ts     // Prefix management
```

### Implementation Details

#### 2.1 RDF Harvester

```typescript
// harvester.ts
import { Store, DataFactory, Quad } from 'n3';
import * as yaml from 'js-yaml';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { extractFrontMatter } from './utils/frontmatter';

const { namedNode, literal, quad } = DataFactory;

export class RDFHarvester {
  private store: Store;
  private baseUri: string;

  constructor(baseUri: string) {
    this.store = new Store();
    this.baseUri = baseUri;
  }

  async harvestFromDirectory(directory: string): Promise<Store> {
    // Find all MDX files
    const files = await glob(`${directory}/**/*.{md,mdx}`);
    
    // Process each file
    for (const file of files) {
      await this.harvestFromFile(file);
    }

    return this.store;
  }

  private async harvestFromFile(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const { frontMatter, body } = extractFrontMatter(content);

    if (!frontMatter.rdf) return;

    // Convert JSON-LD to quads
    const quads = await this.jsonLdToQuads(frontMatter.rdf);
    
    // Add to store
    for (const quad of quads) {
      this.store.add(quad);
    }

    // Add page metadata
    if (frontMatter.id) {
      const subject = namedNode(`${this.baseUri}${frontMatter.id}`);
      this.store.add(
        quad(
          subject,
          namedNode('http://purl.org/dc/terms/source'),
          literal(filePath)
        )
      );
    }
  }

  private async jsonLdToQuads(jsonld: any): Promise<Quad[]> {
    // Expand JSON-LD context
    const expanded = await this.expandJsonLd(jsonld);
    const quads: Quad[] = [];

    // Convert to quads
    this.processJsonLdNode(expanded, quads);

    return quads;
  }

  private processJsonLdNode(
    node: any,
    quads: Quad[],
    subject?: any
  ): any {
    if (Array.isArray(node)) {
      return node.map(n => this.processJsonLdNode(n, quads, subject));
    }

    if (typeof node !== 'object' || node === null) {
      return node;
    }

    // Get or create subject
    const nodeSubject = node['@id'] 
      ? namedNode(node['@id'])
      : subject || this.createBlankNode();

    // Process type
    if (node['@type']) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      for (const type of types) {
        quads.push(
          quad(
            nodeSubject,
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode(type)
          )
        );
      }
    }

    // Process properties
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('@')) continue;

      const predicate = this.expandPredicate(key);
      this.processPropertyValue(nodeSubject, predicate, value, quads);
    }

    return nodeSubject;
  }

  private processPropertyValue(
    subject: any,
    predicate: any,
    value: any,
    quads: Quad[]
  ): void {
    if (Array.isArray(value)) {
      value.forEach(v => this.processPropertyValue(subject, predicate, v, quads));
      return;
    }

    if (typeof value === 'object' && value !== null) {
      if (value['@value'] !== undefined) {
        // Literal with language or datatype
        const literalValue = value['@language']
          ? literal(value['@value'], value['@language'])
          : value['@type']
          ? literal(value['@value'], namedNode(value['@type']))
          : literal(value['@value']);
        
        quads.push(quad(subject, predicate, literalValue));
      } else {
        // Nested object
        const object = this.processJsonLdNode(value, quads);
        quads.push(quad(subject, predicate, object));
      }
    } else {
      // Simple literal
      quads.push(quad(subject, predicate, literal(String(value))));
    }
  }

  private expandPredicate(predicate: string): any {
    // Expand compact IRI or return full IRI
    if (predicate.includes(':')) {
      const [prefix, local] = predicate.split(':');
      const namespace = this.getPrefixNamespace(prefix);
      return namedNode(`${namespace}${local}`);
    }
    return namedNode(predicate);
  }

  private getPrefixNamespace(prefix: string): string {
    const prefixes: Record<string, string> = {
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'skos': 'http://www.w3.org/2004/02/skos/core#',
      'dc': 'http://purl.org/dc/elements/1.1/',
      'dcterms': 'http://purl.org/dc/terms/',
      // Add more as needed
    };
    return prefixes[prefix] || `${this.baseUri}${prefix}/`;
  }

  async addVocabularyMetadata(vocabulary: VocabularyMetadata): Promise<void> {
    const vocabUri = namedNode(vocabulary.uri);

    // Basic metadata
    this.store.add(
      quad(
        vocabUri,
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/2004/02/skos/core#ConceptScheme')
      )
    );

    this.store.add(
      quad(
        vocabUri,
        namedNode('http://purl.org/dc/terms/title'),
        literal(vocabulary.title, 'en')
      )
    );

    if (vocabulary.description) {
      this.store.add(
        quad(
          vocabUri,
          namedNode('http://purl.org/dc/terms/description'),
          literal(vocabulary.description, 'en')
        )
      );
    }

    // Version info
    this.store.add(
      quad(
        vocabUri,
        namedNode('http://purl.org/dc/terms/hasVersion'),
        literal(vocabulary.version)
      )
    );

    // Modified date
    this.store.add(
      quad(
        vocabUri,
        namedNode('http://purl.org/dc/terms/modified'),
        literal(vocabulary.modified.toISOString(), namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))
      )
    );

    // License
    if (vocabulary.license) {
      this.store.add(
        quad(
          vocabUri,
          namedNode('http://purl.org/dc/terms/license'),
          namedNode(vocabulary.license)
        )
      );
    }
  }
}
```

#### 2.2 RDF Serializers

```typescript
// formats/turtle.ts
import { Writer } from 'n3';
import { Store } from 'n3';

export class TurtleSerializer {
  private prefixes: Record<string, string>;

  constructor(prefixes: Record<string, string> = {}) {
    this.prefixes = {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      dc: 'http://purl.org/dc/elements/1.1/',
      dcterms: 'http://purl.org/dc/terms/',
      ...prefixes,
    };
  }

  async serialize(store: Store): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new Writer({ prefixes: this.prefixes });
      
      // Add all quads to writer
      for (const quad of store) {
        writer.addQuad(quad);
      }

      // End and get result
      writer.end((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
}

// formats/rdfxml.ts
import { Store } from 'n3';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export class RDFXMLSerializer {
  private prefixes: Record<string, string>;

  constructor(prefixes: Record<string, string> = {}) {
    this.prefixes = prefixes;
  }

  async serialize(store: Store): Promise<string> {
    const doc = new DOMParser().parseFromString(
      '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"></rdf:RDF>',
      'text/xml'
    );

    const rdfElement = doc.documentElement;

    // Add namespace declarations
    for (const [prefix, namespace] of Object.entries(this.prefixes)) {
      rdfElement.setAttribute(`xmlns:${prefix}`, namespace);
    }

    // Group quads by subject
    const subjectMap = new Map<string, any[]>();
    for (const quad of store) {
      const subject = quad.subject.value;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }
      subjectMap.get(subject)!.push(quad);
    }

    // Create resource elements
    for (const [subject, quads] of subjectMap) {
      const resource = this.createResourceElement(doc, subject, quads);
      rdfElement.appendChild(resource);
    }

    return new XMLSerializer().serializeToString(doc);
  }

  private createResourceElement(doc: Document, subject: string, quads: any[]): Element {
    // Determine resource type
    const typeQuad = quads.find(q => 
      q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    );

    const resourceType = typeQuad 
      ? this.compactIRI(typeQuad.object.value)
      : 'rdf:Description';

    const resource = doc.createElement(resourceType);
    resource.setAttribute('rdf:about', subject);

    // Add properties
    for (const quad of quads) {
      if (quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        continue; // Already handled
      }

      const property = this.createPropertyElement(doc, quad);
      resource.appendChild(property);
    }

    return resource;
  }

  private createPropertyElement(doc: Document, quad: any): Element {
    const propertyName = this.compactIRI(quad.predicate.value);
    const property = doc.createElement(propertyName);

    if (quad.object.termType === 'NamedNode') {
      property.setAttribute('rdf:resource', quad.object.value);
    } else if (quad.object.termType === 'Literal') {
      property.textContent = quad.object.value;
      if (quad.object.language) {
        property.setAttribute('xml:lang', quad.object.language);
      } else if (quad.object.datatype) {
        property.setAttribute('rdf:datatype', quad.object.datatype.value);
      }
    }

    return property;
  }

  private compactIRI(iri: string): string {
    for (const [prefix, namespace] of Object.entries(this.prefixes)) {
      if (iri.startsWith(namespace)) {
        return `${prefix}:${iri.slice(namespace.length)}`;
      }
    }
    return iri;
  }
}
```

#### 2.3 RDF Generation Service

```typescript
// packages/rdf-tools/src/service.ts
import { RDFHarvester } from './harvester';
import { TurtleSerializer } from './formats/turtle';
import { RDFXMLSerializer } from './formats/rdfxml';
import { JSONLDSerializer } from './formats/jsonld';
import { uploadToGitHub } from '@/services/github';

export interface GenerateOptions {
  namespaceId: string;
  version: string;
  formats: ('turtle' | 'rdfxml' | 'jsonld')[];
  baseUri: string;
  outputDir: string;
}

export class RDFGenerationService {
  async generateVocabulary(options: GenerateOptions): Promise<GenerationResult> {
    const { namespaceId, version, formats, baseUri, outputDir } = options;

    // 1. Harvest RDF from documentation
    const harvester = new RDFHarvester(baseUri);
    const store = await harvester.harvestFromDirectory(
      `sites/${namespaceId}/docs`
    );

    // 2. Add vocabulary metadata
    await harvester.addVocabularyMetadata({
      uri: baseUri,
      title: `Vocabulary for ${namespaceId}`,
      version,
      modified: new Date(),
      license: 'https://creativecommons.org/licenses/by/4.0/',
    });

    // 3. Generate files in requested formats
    const files: GeneratedFile[] = [];

    for (const format of formats) {
      const content = await this.serializeFormat(store, format, { baseUri });
      const filename = `${namespaceId}-${version}.${this.getExtension(format)}`;
      
      files.push({
        filename,
        format,
        content,
        size: Buffer.byteLength(content, 'utf8'),
      });
    }

    // 4. Save files
    await this.saveFiles(files, outputDir);

    return {
      success: true,
      files,
      tripleCount: store.size,
      generatedAt: new Date(),
    };
  }

  private async serializeFormat(
    store: Store,
    format: string,
    options: any
  ): Promise<string> {
    const prefixes = {
      [options.namespace]: options.baseUri,
      // Add standard prefixes
    };

    switch (format) {
      case 'turtle':
        return new TurtleSerializer(prefixes).serialize(store);
      case 'rdfxml':
        return new RDFXMLSerializer(prefixes).serialize(store);
      case 'jsonld':
        return new JSONLDSerializer(prefixes).serialize(store);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private getExtension(format: string): string {
    const extensions: Record<string, string> = {
      'turtle': 'ttl',
      'rdfxml': 'rdf',
      'jsonld': 'jsonld',
    };
    return extensions[format] || format;
  }

  private async saveFiles(
    files: GeneratedFile[],
    outputDir: string
  ): Promise<void> {
    for (const file of files) {
      const path = `${outputDir}/${file.filename}`;
      await writeFile(path, file.content);
    }
  }

  async publishToGitHub(
    files: GeneratedFile[],
    release: GitHubRelease
  ): Promise<void> {
    for (const file of files) {
      await uploadToGitHub({
        owner: release.owner,
        repo: release.repo,
        releaseId: release.id,
        filename: file.filename,
        content: file.content,
        contentType: this.getContentType(file.format),
      });
    }
  }

  private getContentType(format: string): string {
    const types: Record<string, string> = {
      'turtle': 'text/turtle',
      'rdfxml': 'application/rdf+xml',
      'jsonld': 'application/ld+json',
    };
    return types[format] || 'text/plain';
  }
}
```

---

## 3. GitHub Integration Service

### Overview
Comprehensive GitHub integration for authentication, repository management, and version control.

### Implementation

```typescript
// apps/admin/src/services/github/github-service.ts
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import crypto from 'crypto';

export class GitHubService {
  private octokit: Octokit;
  private webhookSecret: string;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_APP_TOKEN,
    });
    this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;
  }

  // Repository Management
  async createRepository(options: CreateRepoOptions): Promise<Repository> {
    const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
      name: options.name,
      description: options.description,
      private: options.isPrivate,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: options.license || 'cc-by-4.0',
    });

    return this.mapRepository(data);
  }

  async linkRepository(
    namespaceId: string,
    owner: string,
    repo: string
  ): Promise<Repository> {
    // Verify access
    const { data } = await this.octokit.rest.repos.get({ owner, repo });
    
    // Create webhook
    const webhook = await this.createWebhook(owner, repo, namespaceId);

    return {
      ...this.mapRepository(data),
      webhookId: webhook.id,
    };
  }

  private async createWebhook(
    owner: string,
    repo: string,
    namespaceId: string
  ): Promise<Webhook> {
    const { data } = await this.octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`,
        content_type: 'json',
        secret: this.webhookSecret,
      },
      events: ['push', 'release', 'pull_request'],
      active: true,
    });

    return {
      id: data.id,
      url: data.config.url!,
      events: data.events,
    };
  }

  // Version Management
  async getTags(owner: string, repo: string): Promise<Tag[]> {
    const { data } = await this.octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: 100,
    });

    return data.map(tag => ({
      name: tag.name,
      sha: tag.commit.sha,
      url: tag.commit.url,
    }));
  }

  async createRelease(options: CreateReleaseOptions): Promise<Release> {
    const { data } = await this.octokit.rest.repos.createRelease({
      owner: options.owner,
      repo: options.repo,
      tag_name: options.tagName,
      name: options.name,
      body: options.description,
      draft: options.draft || false,
      prerelease: options.prerelease || false,
    });

    return {
      id: data.id,
      tagName: data.tag_name,
      name: data.name!,
      body: data.body!,
      url: data.html_url,
      createdAt: new Date(data.created_at),
      author: data.author.login,
    };
  }

  // File Operations
  async getFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<FileContent> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ('content' in data) {
        return {
          path: data.path,
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          sha: data.sha,
        };
      }

      throw new Error('Path is a directory');
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  async createOrUpdateFile(options: FileUpdateOptions): Promise<void> {
    // Check if file exists
    let sha: string | undefined;
    try {
      const existing = await this.getFile(
        options.owner,
        options.repo,
        options.path,
        options.branch
      );
      sha = existing.sha;
    } catch {
      // File doesn't exist, will create
    }

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner: options.owner,
      repo: options.repo,
      path: options.path,
      message: options.message,
      content: Buffer.from(options.content).toString('base64'),
      branch: options.branch,
      sha,
    });
  }

  // Webhook Validation
  validateWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  // Pull Request Operations
  async createPullRequest(options: CreatePROptions): Promise<PullRequest> {
    const { data } = await this.octokit.rest.pulls.create({
      owner: options.owner,
      repo: options.repo,
      title: options.title,
      body: options.body,
      head: options.head,
      base: options.base || 'main',
      draft: options.draft || false,
    });

    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body!,
      url: data.html_url,
      state: data.state,
      createdAt: new Date(data.created_at),
    };
  }

  // Issue Operations
  async createIssue(options: CreateIssueOptions): Promise<Issue> {
    const { data } = await this.octokit.rest.issues.create({
      owner: options.owner,
      repo: options.repo,
      title: options.title,
      body: options.body,
      labels: options.labels,
      assignees: options.assignees,
    });

    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body!,
      url: data.html_url,
      state: data.state,
      createdAt: new Date(data.created_at),
    };
  }

  // Organization Management
  async getUserOrganizations(): Promise<Organization[]> {
    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();

    return data.map(org => ({
      id: org.id,
      login: org.login,
      name: org.name || org.login,
      avatarUrl: org.avatar_url,
    }));
  }

  async verifyOrgAdmin(org: string): Promise<boolean> {
    try {
      const { data } = await this.octokit.rest.orgs.getMembershipForAuthenticatedUser({
        org,
      });
      return data.role === 'admin';
    } catch {
      return false;
    }
  }

  // Utility Methods
  private mapRepository(data: any): Repository {
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      isPrivate: data.private,
      defaultBranch: data.default_branch,
      owner: data.owner.login,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Webhook Handler
export async function handleGitHubWebhook(
  event: string,
  payload: any,
  signature: string
): Promise<void> {
  const github = new GitHubService();
  
  // Validate signature
  if (!github.validateWebhookSignature(JSON.stringify(payload), signature)) {
    throw new Error('Invalid webhook signature');
  }

  // Route to appropriate handler
  switch (event) {
    case 'push':
      await handlePushEvent(payload);
      break;
    case 'release':
      await handleReleaseEvent(payload);
      break;
    case 'pull_request':
      await handlePullRequestEvent(payload);
      break;
    case 'issues':
      await handleIssueEvent(payload);
      break;
    default:
      console.log(`Unhandled webhook event: ${event}`);
  }
}

async function handlePushEvent(payload: any): Promise<void> {
  // Sync changes to namespace
  const namespace = await getNamespaceByRepo(
    payload.repository.owner.login,
    payload.repository.name
  );

  if (!namespace) return;

  // Update sync status
  await updateNamespaceSyncStatus(namespace.id, {
    status: 'syncing',
    lastCommit: payload.head_commit.id,
  });

  // Trigger sync job
  await triggerSyncJob(namespace.id);
}

async function handleReleaseEvent(payload: any): Promise<void> {
  if (payload.action !== 'published') return;

  // Create version record
  const namespace = await getNamespaceByRepo(
    payload.repository.owner.login,
    payload.repository.name
  );

  if (!namespace) return;

  await createVersion({
    namespaceId: namespace.id,
    tagName: payload.release.tag_name,
    name: payload.release.name,
    description: payload.release.body,
    githubReleaseId: payload.release.id,
    publishedAt: new Date(payload.release.published_at),
    publishedBy: payload.release.author.login,
  });
}
```

---

## 4. Vocabulary Editor Component

### Overview
Rich editor for vocabulary elements with RDF preview and validation.

### Implementation

```typescript
// apps/admin/src/components/vocabulary/VocabularyEditor.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CodeEditor } from '@/components/ui/code-editor';
import { RDFPreview } from './RDFPreview';
import { ElementForm } from './ElementForm';
import { generateRDF } from '@/lib/rdf';

const elementSchema = z.object({
  term: z.string().min(1),
  label: z.string().min(1),
  definition: z.string().optional(),
  type: z.enum(['Property', 'Class', 'Concept']),
  broader: z.array(z.string()).optional(),
  narrower: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
  source: z.string().optional(),
  status: z.enum(['draft', 'published', 'deprecated']),
});

interface VocabularyEditorProps {
  element?: Element;
  vocabulary: Vocabulary;
  onSave: (data: ElementFormData) => Promise<void>;
}

export function VocabularyEditor({
  element,
  vocabulary,
  onSave,
}: VocabularyEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [rdfPreview, setRdfPreview] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');

  const form = useForm<ElementFormData>({
    resolver: zodResolver(elementSchema),
    defaultValues: element || {
      term: '',
      label: '',
      definition: '',
      type: 'Property',
      status: 'draft',
      broader: [],
      narrower: [],
      related: [],
      examples: [],
      notes: [],
    },
  });

  // Watch form changes to update previews
  const watchedValues = form.watch();

  useEffect(() => {
    // Generate RDF preview
    const rdf = generateRDF({
      ...watchedValues,
      baseUri: vocabulary.baseUri,
      prefix: vocabulary.prefix,
    });
    setRdfPreview(rdf);

    // Generate markdown preview
    const markdown = generateMarkdown(watchedValues);
    setMarkdownContent(markdown);
  }, [watchedValues, vocabulary]);

  const generateMarkdown = (data: ElementFormData): string => {
    const frontMatter = {
      title: data.label,
      id: data.term,
      rdf: {
        '@context': {
          '@vocab': vocabulary.baseUri,
          'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
          'skos': 'http://www.w3.org/2004/02/skos/core#',
        },
        '@id': `${vocabulary.baseUri}${data.term}`,
        '@type': data.type,
        'rdfs:label': data.label,
        'rdfs:comment': data.definition,
        'skos:notation': data.term,
        ...(data.broader?.length && { 'skos:broader': data.broader }),
        ...(data.narrower?.length && { 'skos:narrower': data.narrower }),
        ...(data.related?.length && { 'skos:related': data.related }),
      },
    };

    let content = `---\n${yaml.stringify(frontMatter)}---\n\n`;
    content += `# ${data.label}\n\n`;
    content += `${data.definition || 'No definition provided.'}\n\n`;

    if (data.examples?.length) {
      content += '## Examples\n\n';
      data.examples.forEach((example, i) => {
        content += `${i + 1}. ${example}\n`;
      });
      content += '\n';
    }

    if (data.notes?.length) {
      content += '## Notes\n\n';
      data.notes.forEach(note => {
        content += `- ${note}\n`;
      });
      content += '\n';
    }

    if (data.source) {
      content += `## Source\n\n${data.source}\n`;
    }

    return content;
  };

  const handleSubmit = async (data: ElementFormData) => {
    await onSave({
      ...data,
      rdfData: watchedValues,
      markdownContent,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {element ? 'Edit Element' : 'Create Element'}
        </h2>

        <ElementForm
          form={form}
          vocabulary={vocabulary}
          onSubmit={handleSubmit}
        />
      </Card>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="rdf">RDF</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="prose max-w-none">
              <h1>{watchedValues.label}</h1>
              <p>{watchedValues.definition || 'No definition provided.'}</p>
              
              {watchedValues.examples?.length > 0 && (
                <>
                  <h2>Examples</h2>
                  <ul>
                    {watchedValues.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </>
              )}

              {watchedValues.notes?.length > 0 && (
                <>
                  <h2>Notes</h2>
                  <ul>
                    {watchedValues.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rdf" className="mt-4">
            <RDFPreview
              content={rdfPreview}
              format="turtle"
              onFormatChange={(format) => {
                // Regenerate in different format
                const newRdf = generateRDF({
                  ...watchedValues,
                  baseUri: vocabulary.baseUri,
                  prefix: vocabulary.prefix,
                  format,
                });
                setRdfPreview(newRdf);
              }}
            />
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <CodeEditor
              value={markdownContent}
              language="markdown"
              readOnly
              height="500px"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Element Form Component
function ElementForm({ form, vocabulary, onSubmit }: ElementFormProps) {
  const existingTerms = vocabulary.elements?.map(e => e.term) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Term*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="camelCaseIdentifier"
                  pattern="[a-zA-Z][a-zA-Z0-9]*"
                />
              </FormControl>
              <FormDescription>
                Unique identifier for this element (camelCase)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Human Readable Label" />
              </FormControl>
              <FormDescription>
                Display name for this element
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="definition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Clear description of what this element represents..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="Class">Class</SelectItem>
                  <SelectItem value="Concept">Concept</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="broader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broader Terms</FormLabel>
              <FormControl>
                <MultiSelect
                  options={existingTerms}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select broader terms..."
                />
              </FormControl>
              <FormDescription>
                Terms that this element is a specialization of
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examples"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Examples</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Add an example..."
                />
              </FormControl>
              <FormDescription>
                Usage examples for this element
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Element'}
          </Button>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## 5. Version Management System

### Overview
Complete version management with GitHub releases integration.

### Implementation

```typescript
// apps/admin/src/domains/version/version-manager.ts
import { GitHubService } from '@/services/github';
import { RDFGenerationService } from '@/services/rdf';
import { prisma } from '@/lib/prisma';

export interface CreateVersionOptions {
  namespaceId: string;
  semver: string;
  name: string;
  description: string;
  isDraft: boolean;
  isPrerelease: boolean;
}

export class VersionManager {
  private github: GitHubService;
  private rdfService: RDFGenerationService;

  constructor() {
    this.github = new GitHubService();
    this.rdfService = new RDFGenerationService();
  }

  async createVersion(options: CreateVersionOptions): Promise<Version> {
    const namespace = await prisma.namespace.findUnique({
      where: { id: options.namespaceId },
      include: { vocabularies: true },
    });

    if (!namespace) {
      throw new Error('Namespace not found');
    }

    // 1. Validate version number
    await this.validateVersion(options.namespaceId, options.semver);

    // 2. Generate RDF files
    const rdfFiles = await this.rdfService.generateVocabulary({
      namespaceId: options.namespaceId,
      version: options.semver,
      formats: ['turtle', 'rdfxml', 'jsonld'],
      baseUri: `https://iflastandards.info/ns/${namespace.id}/`,
      outputDir: `/tmp/${namespace.id}-${options.semver}`,
    });

    // 3. Create GitHub release
    const release = await this.github.createRelease({
      owner: namespace.githubRepo.owner,
      repo: namespace.githubRepo.repo,
      tagName: `v${options.semver}`,
      name: options.name,
      description: this.generateReleaseNotes(options, rdfFiles),
      draft: options.isDraft,
      prerelease: options.isPrerelease,
    });

    // 4. Upload RDF assets
    await this.rdfService.publishToGitHub(rdfFiles.files, release);

    // 5. Create version record
    const version = await prisma.version.create({
      data: {
        namespaceId: options.namespaceId,
        semver: options.semver,
        name: options.name,
        description: options.description,
        githubReleaseId: String(release.id),
        githubTagName: release.tagName,
        publishedAt: new Date(),
        publishedBy: getCurrentUserId(),
        isLatest: !options.isPrerelease,
        isPrerelease: options.isPrerelease,
      },
    });

    // 6. Update latest version if needed
    if (!options.isPrerelease) {
      await this.updateLatestVersion(options.namespaceId, version.id);
    }

    // 7. Trigger post-publish tasks
    await this.postPublishTasks(version);

    return version;
  }

  private async validateVersion(
    namespaceId: string,
    semver: string
  ): Promise<void> {
    // Check if version already exists
    const existing = await prisma.version.findFirst({
      where: {
        namespaceId,
        semver,
      },
    });

    if (existing) {
      throw new Error(`Version ${semver} already exists`);
    }

    // Validate semver format
    if (!this.isValidSemver(semver)) {
      throw new Error('Invalid semantic version format');
    }
  }

  private isValidSemver(version: string): boolean {
    const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return regex.test(version);
  }

  private generateReleaseNotes(
    options: CreateVersionOptions,
    rdfResult: any
  ): string {
    return `# ${options.name}

${options.description}

## Vocabulary Statistics
- Total triples: ${rdfResult.tripleCount}
- Formats available: Turtle (.ttl), RDF/XML (.rdf), JSON-LD (.jsonld)

## Download
Download vocabulary files from the assets below.

## Changes
See [CHANGELOG.md](./CHANGELOG.md) for detailed changes.

---
Generated by IFLA Standards Platform`;
  }

  private async updateLatestVersion(
    namespaceId: string,
    versionId: string
  ): Promise<void> {
    // Set all other versions as not latest
    await prisma.version.updateMany({
      where: {
        namespaceId,
        id: { not: versionId },
      },
      data: {
        isLatest: false,
      },
    });
  }

  private async postPublishTasks(version: Version): Promise<void> {
    // 1. Clear CDN cache
    await this.clearCDNCache(version.namespaceId);

    // 2. Update vocabulary server
    await this.updateVocabularyServer(version);

    // 3. Send notifications
    await this.sendNotifications(version);

    // 4. Create blog post
    await this.createBlogPost(version);

    // 5. Trigger translation sync
    if (!version.isPrerelease) {
      await this.triggerTranslationSync(version);
    }
  }

  async compareVersions(
    namespaceId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<VersionComparison> {
    const from = await this.getVersionData(namespaceId, fromVersion);
    const to = await this.getVersionData(namespaceId, toVersion);

    const changes = {
      added: this.findAddedElements(from, to),
      modified: this.findModifiedElements(from, to),
      removed: this.findRemovedElements(from, to),
    };

    return {
      from: fromVersion,
      to: toVersion,
      changes,
      summary: this.generateChangeSummary(changes),
    };
  }

  private async getVersionData(
    namespaceId: string,
    version: string
  ): Promise<VersionData> {
    // Fetch version data from GitHub tag
    const namespace = await prisma.namespace.findUnique({
      where: { id: namespaceId },
    });

    const files = await this.github.getFilesAtTag(
      namespace!.githubRepo.owner,
      namespace!.githubRepo.repo,
      `v${version}`
    );

    // Parse vocabulary data
    return this.parseVersionData(files);
  }
}

// Version UI Component
export function VersionManager({ namespace }: { namespace: Namespace }) {
  const [isCreating, setIsCreating] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);

  const createVersion = async (data: CreateVersionData) => {
    const manager = new VersionManager();
    const version = await manager.createVersion({
      namespaceId: namespace.id,
      ...data,
    });
    
    setVersions([version, ...versions]);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Version Management</h2>
        <Button onClick={() => setIsCreating(true)}>
          Create New Version
        </Button>
      </div>

      {isCreating && (
        <CreateVersionDialog
          onClose={() => setIsCreating(false)}
          onCreate={createVersion}
          namespace={namespace}
        />
      )}

      <VersionTimeline versions={versions} />
    </div>
  );
}
```

---

## 6. Translation Sync Service

### Overview
Crowdin integration for managing translations across versions.

### Implementation

```typescript
// apps/admin/src/services/translation/crowdin-service.ts
import axios from 'axios';
import { prisma } from '@/lib/prisma';

interface CrowdinConfig {
  apiToken: string;
  projectId: number;
  baseUrl: string;
}

export class CrowdinService {
  private api: any;
  private config: CrowdinConfig;

  constructor() {
    this.config = {
      apiToken: process.env.CROWDIN_API_TOKEN!,
      projectId: parseInt(process.env.CROWDIN_PROJECT_ID!),
      baseUrl: 'https://api.crowdin.com/api/v2',
    };

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async syncNamespaceContent(
    namespaceId: string,
    version: string
  ): Promise<SyncResult> {
    const namespace = await prisma.namespace.findUnique({
      where: { id: namespaceId },
    });

    if (!namespace) {
      throw new Error('Namespace not found');
    }

    // 1. Create branch for version
    const branch = await this.createBranch(
      `${namespaceId}-v${version}`
    );

    // 2. Upload source files
    const files = await this.getSourceFiles(namespaceId, version);
    const uploadResults = await this.uploadFiles(branch.id, files);

    // 3. Update project settings
    await this.updateProjectSettings(namespaceId, version);

    // 4. Create translation jobs
    const jobs = await this.createTranslationJobs(branch.id);

    return {
      branchId: branch.id,
      filesUploaded: uploadResults.length,
      jobsCreated: jobs.length,
      status: 'success',
    };
  }

  private async createBranch(name: string): Promise<Branch> {
    const response = await this.api.post(
      `/projects/${this.config.projectId}/branches`,
      {
        name,
        title: `Version ${name}`,
      }
    );

    return response.data.data;
  }

  private async uploadFiles(
    branchId: number,
    files: SourceFile[]
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        // Create storage
        const storage = await this.api.post('/storages', {
          fileName: file.name,
          content: file.content,
        });

        // Add file to project
        const projectFile = await this.api.post(
          `/projects/${this.config.projectId}/files`,
          {
            storageId: storage.data.data.id,
            name: file.path,
            branchId,
            type: 'md',
          }
        );

        results.push({
          fileName: file.name,
          fileId: projectFile.data.data.id,
          status: 'success',
        });
      } catch (error) {
        results.push({
          fileName: file.name,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }

  async getTranslationProgress(
    namespaceId: string
  ): Promise<TranslationProgress> {
    const response = await this.api.get(
      `/projects/${this.config.projectId}/languages/progress`
    );

    const languages = response.data.data.map((lang: any) => ({
      code: lang.languageId,
      name: lang.language.name,
      progress: {
        translated: lang.translationProgress,
        approved: lang.approvalProgress,
        words: lang.words,
        phrases: lang.phrases,
      },
    }));

    return {
      namespaceId,
      languages,
      lastUpdated: new Date(),
    };
  }

  async downloadTranslations(
    namespaceId: string,
    languageCode: string,
    branchId?: number
  ): Promise<TranslationFiles> {
    // Build export
    const build = await this.api.post(
      `/projects/${this.config.projectId}/translations/builds`,
      {
        targetLanguageIds: [languageCode],
        branchId,
      }
    );

    // Wait for build to complete
    await this.waitForBuild(build.data.data.id);

    // Download build
    const download = await this.api.get(
      `/projects/${this.config.projectId}/translations/builds/${build.data.data.id}/download`
    );

    return this.extractTranslationFiles(download.data);
  }

  private async waitForBuild(buildId: number): Promise<void> {
    let status = 'inProgress';
    
    while (status === 'inProgress') {
      const response = await this.api.get(
        `/projects/${this.config.projectId}/translations/builds/${buildId}`
      );
      
      status = response.data.data.status;
      
      if (status === 'inProgress') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async createTranslationMemory(
    name: string,
    languagePairs: Array<{ source: string; target: string }>
  ): Promise<void> {
    await this.api.post('/tms', {
      name,
      languageIds: languagePairs.map(pair => pair.target),
      segmentApprovalMode: 'currentWorflow',
    });
  }

  async updateTranslationMemory(
    tmId: number,
    entries: TranslationMemoryEntry[]
  ): Promise<void> {
    for (const entry of entries) {
      await this.api.post(`/tms/${tmId}/segments`, {
        records: [
          {
            languageId: entry.sourceLanguage,
            text: entry.sourceText,
          },
          {
            languageId: entry.targetLanguage,
            text: entry.targetText,
          },
        ],
      });
    }
  }
}

// Translation Sync Component
export function TranslationSync({ namespace }: { namespace: Namespace }) {
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncTranslations = async () => {
    setSyncing(true);
    try {
      const crowdin = new CrowdinService();
      await crowdin.syncNamespaceContent(
        namespace.id,
        namespace.latestVersion
      );
      
      // Refresh progress
      const newProgress = await crowdin.getTranslationProgress(namespace.id);
      setProgress(newProgress);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Translation Status</h3>
        <Button
          onClick={syncTranslations}
          disabled={syncing}
          size="sm"
        >
          {syncing ? 'Syncing...' : 'Sync with Crowdin'}
        </Button>
      </div>

      {progress ? (
        <div className="space-y-4">
          {progress.languages.map(lang => (
            <LanguageProgress key={lang.code} language={lang} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No translation data available
        </div>
      )}
    </Card>
  );
}

function LanguageProgress({ language }: { language: any }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{language.name}</span>
        <span className="text-sm text-gray-600">
          {language.progress.phrases} phrases
        </span>
      </div>
      
      <div className="space-y-2">
        <ProgressBar
          label="Translated"
          value={language.progress.translated}
          color="blue"
        />
        <ProgressBar
          label="Approved"
          value={language.progress.approved}
          color="green"
        />
      </div>
    </div>
  );
}

function ProgressBar({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

---

## Testing Strategy

Each component should have comprehensive tests:

1. **Unit Tests**: Test individual functions and services
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete workflows
4. **Performance Tests**: Ensure scalability requirements are met

Example test structure:
```typescript
// __tests__/services/github.test.ts
describe('GitHubService', () => {
  it('should create repository with correct settings', async () => {
    // Test implementation
  });
  
  it('should validate webhook signatures', () => {
    // Test implementation
  });
});
```

## Deployment Considerations

1. **Environment Variables**: Properly configure all service credentials
2. **Database Migrations**: Use Prisma migrations for schema updates
3. **Monitoring**: Implement logging and error tracking
4. **Caching**: Use Redis for frequently accessed data
5. **Rate Limiting**: Implement for all public APIs