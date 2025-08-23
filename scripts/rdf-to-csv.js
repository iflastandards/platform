#!/usr/bin/env node
import { Command } from 'commander';
import { Parser, Store, DataFactory } from 'n3';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
const { namedNode, literal, quad } = DataFactory;
// Default namespace prefixes (will be overridden by prefixes from the RDF file)
const DEFAULT_PREFIXES = {
    skos: 'http://www.w3.org/2004/02/skos/core#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    dcterms: 'http://purl.org/dc/terms/',
    owl: 'http://www.w3.org/2002/07/owl#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
};
// This will be populated with prefixes from the parsed RDF file
let PREFIXES = { ...DEFAULT_PREFIXES };
function expandCurie(curie) {
    const colonIndex = curie.indexOf(':');
    if (colonIndex === -1) {
        return curie; // Not a CURIE
    }
    const prefix = curie.substring(0, colonIndex);
    const localName = curie.substring(colonIndex + 1);
    if (PREFIXES[prefix]) {
        return PREFIXES[prefix] + localName;
    }
    return curie;
}
function toCurie(uri) {
    // Sort prefixes by length (longest first) to ensure more specific matches
    const sortedPrefixes = Object.entries(PREFIXES).sort(([, a], [, b]) => b.length - a.length);
    for (const [prefix, namespace] of sortedPrefixes) {
        if (uri.startsWith(namespace)) {
            return `${prefix}:${uri.substring(namespace.length)}`;
        }
    }
    return uri;
}
async function loadDctapProfile(dctapPath) {
    const repeatableProperties = new Map();
    try {
        const csvContent = fs.readFileSync(dctapPath, 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        for (const record of records) {
            if (record.propertyID) {
                const isRepeatable = record.repeatable?.toLowerCase() === 'true' ||
                    record.repeatable?.toLowerCase() === 'yes' ||
                    record.repeatable === '1';
                const expandedUri = expandCurie(record.propertyID);
                repeatableProperties.set(expandedUri, isRepeatable);
            }
        }
    }
    catch (error) {
        console.error(`Warning: Could not load DCTAP profile from ${dctapPath}:`, error);
        // Set defaults for known repeatable properties
        repeatableProperties.set(expandCurie('skos:definition'), true);
        repeatableProperties.set(expandCurie('skos:scopeNote'), true);
        repeatableProperties.set(expandCurie('rdfs:label'), true);
    }
    return repeatableProperties;
}
async function parseRdfFile(filePath) {
    const store = new Store();
    const parser = new Parser({ baseIRI: `file://${path.resolve(filePath)}` });
    return new Promise((resolve, reject) => {
        const rdfData = fs.readFileSync(filePath, 'utf-8');
        // Reset prefixes to defaults before parsing
        PREFIXES = { ...DEFAULT_PREFIXES };
        parser.parse(rdfData, (error, quad, prefixes) => {
            if (error) {
                reject(error);
            }
            else if (quad) {
                store.add(quad);
            }
            else {
                // When parsing is complete, prefixes are provided in the third parameter
                if (prefixes) {
                    // Merge parsed prefixes with existing ones
                    for (const [prefix, iri] of Object.entries(prefixes)) {
                        if (iri && typeof iri === 'object' && 'value' in iri) {
                            // N3.js returns IRIs as objects with a 'value' property
                            PREFIXES[prefix] = iri.value;
                        }
                        else if (typeof iri === 'string') {
                            PREFIXES[prefix] = iri;
                        }
                    }
                    console.error('Extracted prefixes from RDF file:', Object.keys(PREFIXES).join(', '));
                }
                resolve(store);
            }
        });
    });
}
function extractResourceData(store) {
    const resources = new Map();
    // Get all unique subjects (resources)
    const subjects = new Set();
    for (const quad of store) {
        if (quad.subject.termType === 'NamedNode') {
            subjects.add(quad.subject.value);
        }
    }
    // Extract properties for each resource
    for (const subjectUri of subjects) {
        const resourceData = {
            uri: subjectUri,
            properties: new Map(),
        };
        const quads = store.getQuads(namedNode(subjectUri), null, null, null);
        for (const quad of quads) {
            const predicate = quad.predicate.value;
            const {object} = quad;
            if (!resourceData.properties.has(predicate)) {
                resourceData.properties.set(predicate, []);
            }
            const values = resourceData.properties.get(predicate);
            if (object.termType === 'Literal') {
                values.push({
                    value: object.value,
                    language: object.language || undefined,
                });
            }
            else if (object.termType === 'NamedNode') {
                values.push({
                    value: object.value,
                });
            }
        }
        resources.set(subjectUri, resourceData);
    }
    return resources;
}
function generateCsvHeaders(resources, repeatableProperties) {
    const headers = ['uri'];
    const propertyLanguageCounts = new Map();
    // First pass: count occurrences of each property-language combination
    for (const resource of resources.values()) {
        for (const [property, values] of resource.properties) {
            if (!propertyLanguageCounts.has(property)) {
                propertyLanguageCounts.set(property, new Map());
            }
            const langCounts = propertyLanguageCounts.get(property);
            const langOccurrences = new Map();
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
        const curie = toCurie(property);
        const langCounts = propertyLanguageCounts.get(property);
        const isRepeatable = repeatableProperties.get(property) || false;
        const sortedLangs = Array.from(langCounts.keys()).sort();
        for (const lang of sortedLangs) {
            const maxCount = langCounts.get(lang);
            if (isRepeatable && maxCount > 1) {
                for (let i = 0; i < maxCount; i++) {
                    const header = lang ? `${curie}@${lang}[${i}]` : `${curie}[${i}]`;
                    headers.push(header);
                }
            }
            else {
                const header = lang ? `${curie}@${lang}` : curie;
                headers.push(header);
            }
        }
    }
    return headers;
}
function generateCsvRows(resources, headers, repeatableProperties) {
    const rows = [];
    for (const resource of resources.values()) {
        // Convert resource URI to CURIE if possible
        const resourceId = toCurie(resource.uri);
        const row = [resourceId];
        // Track how many values we've added for each property-language combination
        const propertyLangIndices = new Map();
        for (let i = 1; i < headers.length; i++) {
            const header = headers[i];
            let value = '';
            // Parse header to extract property and language
            const match = header.match(/^(.+?)(?:@([^[]+))?(?:\[(\d+)\])?$/);
            if (match) {
                const [, curie, lang, indexStr] = match;
                const property = expandCurie(curie);
                const targetLang = lang || '';
                const targetIndex = indexStr ? parseInt(indexStr) : 0;
                if (resource.properties.has(property)) {
                    const values = resource.properties.get(property);
                    const filteredValues = values.filter(v => (v.language || '') === targetLang);
                    if (filteredValues.length > targetIndex) {
                        const val = filteredValues[targetIndex].value;
                        // Convert URI values to CURIEs if possible
                        if (val.startsWith('http://') || val.startsWith('https://')) {
                            value = toCurie(val);
                        }
                        else {
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
const program = new Command();
program
    .name('rdf-to-csv')
    .description('Convert RDF files to CSV format using DCTAP profile')
    .version('1.0.0')
    .argument('<rdf-file>', 'Path to the RDF file (TTL format)')
    .option('-p, --profile <dctap-file>', 'Path to DCTAP profile CSV file')
    .option('-o, --output <output-file>', 'Output CSV file (default: stdout)')
    .action(async (rdfFile, options) => {
    try {
        // Load DCTAP profile if provided
        const repeatableProperties = options.profile
            ? await loadDctapProfile(options.profile)
            : new Map([
                [expandCurie('skos:definition'), true],
                [expandCurie('skos:scopeNote'), true],
                [expandCurie('rdfs:label'), true],
            ]);
        // Parse RDF file
        console.error(`Parsing RDF file: ${rdfFile}`);
        const store = await parseRdfFile(rdfFile);
        // Extract resource data
        const resources = extractResourceData(store);
        console.error(`Found ${resources.size} resources`);
        // Generate CSV
        const headers = generateCsvHeaders(resources, repeatableProperties);
        const rows = generateCsvRows(resources, headers, repeatableProperties);
        // Create CSV output
        const csvData = [headers, ...rows];
        const csvString = stringify(csvData);
        // Write output
        if (options.output) {
            fs.writeFileSync(options.output, csvString);
            console.error(`CSV written to: ${options.output}`);
        }
        else {
            console.log(csvString);
        }
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
program.parse();
