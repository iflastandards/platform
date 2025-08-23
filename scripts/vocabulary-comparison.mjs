/**
 * Generic Vocabulary Comparison Tool
 * Compares Google Sheets SKOS concepts with published RDF vocabularies
 *
 * Usage:
 * node scripts/vocabulary-comparison.js --spreadsheet-id=YOUR_ID [options]
 * yarn compare:vocabulary --spreadsheet-id=YOUR_ID [options]
 *
 * Options:
 * --spreadsheet-id=ID    Required: Google Sheets spreadsheet ID
 * --index-sheet=NAME     Optional: Name of index sheet (default: 'index')
 * --skip-rdf-check       Optional: Skip RDF comparison, only validate sheet structure
 * --markdown, -md        Optional: Output results as markdown file
 * --output=PATH          Optional: Custom output file path (default: tmp/vocabulary-comparison-report.md)
 * --help                 Show help message
 *
 * Setup for Node.js 18+:
 * npm init -y
 * npm install dotenv
 *
 * Create .env file with:
 * GOOGLE_SHEETS_API_KEY=your_api_key_here
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';
dotenv.config();

// Use native fetch (Node.js 18+)
const {fetch} = globalThis;

class VocabularyComparisonTool {
    constructor(apiKey, spreadsheetId, options = {}) {
        this.apiKey = apiKey;
        this.spreadsheetId = spreadsheetId;
        this.baseGoogleSheetsUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.options = {
            indexSheet: options.indexSheet || 'index',
            skipRdfCheck: options.skipRdfCheck || false,
            markdown: options.markdown || false,
            outputPath: options.outputPath || 'tmp/vocabulary-comparison-report.md',
            ...options
        };
        this.vocabularies = [];
        this.results = {
            matches: [],
            mismatches: [],
            missing: [],
            errors: []
        };
    }

    /**
     * Main method to run the complete comparison
     */
    async runComparison() {
        try {
            console.log('🚀 Starting vocabulary comparison...');
            console.log(`📋 Spreadsheet: ${this.spreadsheetId}`);
            console.log(`📑 Index sheet: ${this.options.indexSheet}`);
            console.log(`🔍 RDF check: ${this.options.skipRdfCheck ? 'disabled' : 'enabled'}`);

            // Step 1: Read the index sheet to get vocabularies
            await this.loadVocabularies();

            // Step 2: Process each vocabulary
            for (const vocab of this.vocabularies) {
                if (vocab.hasRdf && !this.options.skipRdfCheck) {
                    console.log(`\n📋 Processing: ${vocab.token}`);
                    await this.compareVocabulary(vocab);
                } else if (this.options.skipRdfCheck) {
                    console.log(`\n📋 Validating structure: ${vocab.token}`);
                    await this.validateSheetStructure(vocab);
                } else {
                    console.log(`\n⏳ Skipping ${vocab.token} (no RDF URL provided)`);
                }
            }

            // Step 3: Generate report
            const results = this.generateReport();
            
            // Step 4: Generate markdown if requested
            if (this.options.markdown) {
                this.generateMarkdownReport(results);
            }

        } catch (error) {
            console.error('❌ Comparison failed:', error);
            this.results.errors.push({
                message: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Load vocabularies from the index sheet with flexible structure detection
     */
    async loadVocabularies() {
        console.log(`📖 Loading vocabularies from '${this.options.indexSheet}' sheet...`);

        // First, get spreadsheet metadata to see available sheets
        this.availableSheets = await this.getAvailableSheets();
        console.log(`📋 Available sheets: ${this.availableSheets.map(s => s.title).join(', ')}`);

        const indexData = await this.fetchSheetData(this.options.indexSheet);
        const headers = indexData[0];
        
        // Find relevant columns with flexible naming
        const tokenCol = this.findColumn(headers, ['token', 'name', 'sheet', 'vocabulary']);
        const titleCol = this.findColumn(headers, ['title', 'label', 'description']);
        const idCol = this.findColumn(headers, ['id', 'uri', 'url', 'namespace']);

        if (tokenCol === -1) {
            throw new Error(`Could not find token/name column in index sheet. Headers: ${headers.join(', ')}`);
        }

        console.log(`📊 Found columns - Token: ${headers[tokenCol]}${titleCol >= 0 ? `, Title: ${headers[titleCol]}` : ''}${idCol >= 0 ? `, URI: ${headers[idCol]}` : ''}`);

        // Skip header row
        for (let i = 1; i < indexData.length; i++) {
            const row = indexData[i];
            if (row[tokenCol]) {
                const token = row[tokenCol];
                const title = titleCol >= 0 ? (row[titleCol] || '') : '';
                const uri = idCol >= 0 ? row[idCol] || '' : '';
                
                // Skip instruction rows or empty tokens
                if (this.isInstructionRow(token, uri)) {
                    continue;
                }

                // Try to find matching sheet by token name or title
                const matchingSheet = this.findMatchingSheet(this.availableSheets, token, title);
                
                this.vocabularies.push({
                    token: token,
                    title: title,
                    uri: uri,
                    hasRdf: this.hasValidRdfUri(uri),
                    sheetName: matchingSheet ? matchingSheet.title : token,
                    sheetId: matchingSheet ? matchingSheet.sheetId : null
                });
            }
        }

        console.log(`✅ Loaded ${this.vocabularies.length} vocabularies`);
        console.log(`🔗 ${this.vocabularies.filter(v => v.hasRdf).length} have RDF URIs`);
        console.log(`📑 ${this.vocabularies.filter(v => v.sheetId).length} have matching sheets`);
    }

    /**
     * Get list of available sheets in the spreadsheet
     */
    async getAvailableSheets() {
        const url = `${this.baseGoogleSheetsUrl}/${this.spreadsheetId}?key=${this.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch spreadsheet metadata: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.sheets.map(sheet => ({
            title: sheet.properties.title,
            sheetId: sheet.properties.sheetId
        }));
    }

    /**
     * Find a matching sheet for a vocabulary token
     */
    findMatchingSheet(availableSheets, token, title) {
        // Try exact token match first
        let match = availableSheets.find(sheet => 
            sheet.title.toLowerCase() === token.toLowerCase()
        );
        
        if (match) {return match;}
        
        // Try title match
        if (title) {
            match = availableSheets.find(sheet => 
                sheet.title.toLowerCase() === title.toLowerCase()
            );
            if (match) {return match;}
        }
        
        // Special handling for common patterns
        if (token === 'isbdu') {
            match = availableSheets.find(sheet => 
                sheet.title.toLowerCase().includes('unc') || 
                sheet.title.toLowerCase().includes('unconstrained') ||
                sheet.title.toLowerCase() === 'unc/elements'
            );
            if (match) {return match;}
        }
        
        if (token === 'isbd') {
            match = availableSheets.find(sheet => 
                sheet.title.toLowerCase() === 'elements' ||
                (sheet.title.toLowerCase().includes('element') && 
                 !sheet.title.toLowerCase().includes('unc'))
            );
            if (match) {return match;}
        }
        
        // Try partial matches
        match = availableSheets.find(sheet => 
            sheet.title.toLowerCase().includes(token.toLowerCase()) ||
            token.toLowerCase().includes(sheet.title.toLowerCase())
        );
        
        if (match) {return match;}
        
        // Try title partial matches
        if (title) {
            match = availableSheets.find(sheet => 
                sheet.title.toLowerCase().includes(title.toLowerCase()) ||
                title.toLowerCase().includes(sheet.title.toLowerCase())
            );
        }
        
        return match;
    }

    /**
     * Find column index by multiple possible names
     */
    findColumn(headers, possibleNames) {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => 
                h && h.toLowerCase().includes(name.toLowerCase())
            );
            if (index >= 0) {return index;}
        }
        return -1;
    }

    /**
     * Check if a row appears to be instructions rather than data
     */
    isInstructionRow(token, uri) {
        if (!token) {return true;}
        
        // Skip rows that look like instructions
        if (token.includes(':') || token.length > 50) {return true;}
        if (token.toLowerCase().includes('instruction') || token.toLowerCase().includes('example')) {return true;}
        if (uri && !uri.startsWith('http') && uri.length > 0) {return true;}
        
        return false;
    }

    /**
     * Check if URI appears to be a valid RDF endpoint
     */
    hasValidRdfUri(uri) {
        if (!uri || !uri.startsWith('http')) {return false;}
        // Additional validation could be added here
        return true;
    }

    /**
     * Validate sheet structure without RDF comparison
     */
    async validateSheetStructure(vocab) {
        try {
            if (!vocab.sheetId) {
                throw new Error(`No matching sheet found for token '${vocab.token}'`);
            }
            
            const sheetConcepts = await this.fetchSheetConcepts(vocab.sheetName, vocab);
            console.log(`   ✅ ${sheetConcepts.length} concepts parsed from ${vocab.sheetName}`);
            
            // Validate required SKOS properties
            const validation = this.validateSkosStructure(sheetConcepts);
            if (validation.errors.length > 0) {
                console.log(`   ⚠️  ${validation.errors.length} structure warnings`);
                validation.errors.forEach(error => {
                    console.log(`     - ${error}`);
                });
            }
        } catch (error) {
            console.error(`   ❌ Error validating ${vocab.token}:`, error.message);
            this.results.errors.push({
                vocabulary: vocab.token,
                message: error.message
            });
        }
    }

    /**
     * Validate SKOS structure of parsed concepts
     */
    validateSkosStructure(concepts) {
        const errors = [];
        const warnings = [];
        
        concepts.forEach((concept, index) => {
            if (!concept.uri) {
                errors.push(`Row ${concept.rowIndex || index + 2}: Missing URI`);
            }
            if (!concept.prefLabel) {
                warnings.push(`Row ${concept.rowIndex || index + 2}: Missing preferred label`);
            }
        });
        
        return { errors, warnings };
    }

    /**
     * Compare a single vocabulary
     */
    async compareVocabulary(vocab) {
        try {
            if (!vocab.sheetId) {
                throw new Error(`No matching sheet found for token '${vocab.token}'`);
            }
            
            // Fetch concepts from Google Sheet
            const sheetConcepts = await this.fetchSheetConcepts(vocab.sheetName, vocab);

            // Fetch RDF concepts
            const rdfConcepts = await this.fetchRdfConcepts(vocab.uri);

            // Compare concepts
            const comparison = this.compareConcepts(vocab, sheetConcepts, rdfConcepts);

            // Store results
            this.results.matches.push(...comparison.matches);
            this.results.mismatches.push(...comparison.mismatches);
            this.results.missing.push(...comparison.missing);

            console.log(`   ✅ ${comparison.matches.length} matches`);
            console.log(`   ⚠️  ${comparison.mismatches.length} mismatches`);
            console.log(`   ❌ ${comparison.missing.length} missing`);

        } catch (error) {
            console.error(`   ❌ Error processing ${vocab.token}:`, error.message);
            this.results.errors.push({
                vocabulary: vocab.token,
                message: error.message
            });
        }
    }

    /**
     * Fetch data from a specific Google Sheet
     */
    async fetchSheetData(sheetName) {
        const url = `${this.baseGoogleSheetsUrl}/${this.spreadsheetId}/values/${sheetName}?key=${this.apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch sheet ${sheetName}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.values || [];
    }

    /**
     * Parse column header using the specific algorithm:
     * 'skos:definition@es[0]' maps to:
     * - property: 'skos:definition'
     * - language: 'es'
     * - index: 0 (for repeatable values)
     */
    parseColumnHeader(header) {
        if (!header) {return null;}

        // Extract array index [n] if present
        const arrayMatch = header.match(/\[(\d+)\]$/);
        const index = arrayMatch ? parseInt(arrayMatch[1]) : 0;
        const baseHeader = arrayMatch ? header.replace(/\[\d+\]$/, '') : header;

        // Extract language @lang if present
        const langMatch = baseHeader.match(/^(.+)@([a-z]{2}(?:-[A-Z]{2})?)$/);
        const property = langMatch ? langMatch[1] : baseHeader;
        const language = langMatch ? langMatch[2] : null;

        return {
            property: property,
            language: language,
            index: index,
            original: header
        };
    }

    /**
     * Group columns by property and organize by language/index
     */
    organizeColumns(headers) {
        const columnMap = new Map();

        headers.forEach((header, colIndex) => {
            const parsed = this.parseColumnHeader(header);
            if (!parsed) {return;}

            if (!columnMap.has(parsed.property)) {
                columnMap.set(parsed.property, new Map());
            }

            const propertyMap = columnMap.get(parsed.property);
            const key = parsed.language || 'default';

            if (!propertyMap.has(key)) {
                propertyMap.set(key, []);
            }

            propertyMap.get(key)[parsed.index] = colIndex;
        });

        return columnMap;
    }

    /**
     * Extract values for a property considering language and repeatability
     */
    extractPropertyValues(row, propertyMap, language = null) {
        const values = [];

        // Determine which language/variant to use
        const targetKey = language || 'en' || 'default';
        let selectedArray = propertyMap.get(targetKey) || propertyMap.get('en') || propertyMap.get('default');

        // If no specific language found, try first available
        if (!selectedArray && propertyMap.size > 0) {
            selectedArray = propertyMap.values().next().value;
        }

        if (selectedArray) {
            for (let i = 0; i < selectedArray.length; i++) {
                const colIndex = selectedArray[i];
                if (colIndex !== undefined && row[colIndex]) {
                    values.push(row[colIndex].trim());
                }
            }
        }

        return values;
    }

    /**
     * Normalize full URI to prefixed form for comparison
     */
    normalizeUri(fullUri, vocab) {
        if (!fullUri || !fullUri.startsWith('http')) {return fullUri;}
        
        // Define namespace mappings
        const namespaceMappings = {
            'http://iflastandards.info/ns/isbd/elements/': 'isbd:elements/',
            'http://iflastandards.info/ns/isbd/unc/elements/': 'isbd:unc_elements/',
            'http://iflastandards.info/ns/isbd/': 'isbd:',
            'http://www.w3.org/2004/02/skos/core#': 'skos:',
            'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
            'http://www.w3.org/2002/07/owl#': 'owl:'
        };
        
        // Find matching namespace and convert to prefixed form
        for (const [namespace, prefix] of Object.entries(namespaceMappings)) {
            if (fullUri.startsWith(namespace)) {
                const localName = fullUri.substring(namespace.length);
                return prefix + localName;
            }
        }
        
        return fullUri;
    }

    /**
     * Expand prefixed URI to full URI with flexible namespace detection
     */
    expandUri(prefixedUri, vocab) {
        if (!prefixedUri) {return prefixedUri;}
        
        // If it's already a full URI, return as is
        if (prefixedUri.startsWith('http://') || prefixedUri.startsWith('https://')) {
            return prefixedUri;
        }
        
        // Check if it matches the pattern prefix:localname
        const match = prefixedUri.match(/^([^:]+):(.+)$/);
        if (match) {
            const prefix = match[1];
            const localName = match[2];
            
            // Handle special case of prefix:sheetName/identifier (e.g., "isbd:unc_elements/P1001")
            if (vocab.uri && vocab.sheetName && localName.startsWith(`${vocab.sheetName  }/`)) {
                const actualLocalName = localName.substring(vocab.sheetName.length + 1); // Remove "sheetName/"
                if (vocab.uri.endsWith('/')) {
                    return `${vocab.uri}${actualLocalName}`;
                } 
                    return `${vocab.uri}/${actualLocalName}`;
                
            }
            
            // Use the vocab URI as the base namespace if available
            if (vocab.uri) {
                // Handle different URI patterns
                if (vocab.uri.includes('/ns/isbd/terms/')) {
                    // ISBD-specific pattern
                    return `${vocab.uri}/${localName}`;
                } if (vocab.uri.endsWith('/')) {
                    // URI ends with slash
                    return `${vocab.uri}${localName}`;
                } 
                    // Generic pattern - add slash
                    return `${vocab.uri}/${localName}`;
                
            }
        }
        
        // Handle sheet-relative URIs like "unc_elements/P1001" or "elements/P1001"
        if (vocab.uri && vocab.sheetName && prefixedUri.startsWith(`${vocab.sheetName  }/`)) {
            const localName = prefixedUri.substring(vocab.sheetName.length + 1); // Remove "sheetName/"
            if (vocab.uri.endsWith('/')) {
                return `${vocab.uri}${localName}`;
            } 
                return `${vocab.uri}/${localName}`;
            
        }
        
        // Handle simple local identifiers like "P1001" or "C2001"
        if (vocab.uri && prefixedUri.match(/^[PC]\d+$/)) {
            if (vocab.uri.endsWith('/')) {
                return `${vocab.uri}${prefixedUri}`;
            } 
                return `${vocab.uri}/${prefixedUri}`;
            
        }
        
        return prefixedUri;
    }

    /**
     * Fetch concepts from a Google Sheet and parse SKOS structure
     */
    async fetchSheetConcepts(sheetName, vocab = null) {
        const data = await this.fetchSheetData(sheetName);
        if (data.length === 0) {return [];}

        const headers = data[0];
        const columnMap = this.organizeColumns(headers);
        const concepts = [];
        
        // Use provided vocab or find by sheet name
        if (!vocab) {
            vocab = this.vocabularies.find(v => v.sheetName === sheetName);
        }

        console.log(`   📊 Found columns for ${sheetName}:`, Array.from(columnMap.keys()));

        // Process each row (skip header)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];

            // Get URI (required) - try multiple column names
            const uriColumns = ['uri', '@id', 'id', 'concept'];
            let uriValues = [];
            for (const colName of uriColumns) {
                uriValues = this.extractPropertyValues(row, columnMap.get(colName) || new Map());
                if (uriValues.length > 0) {break;}
            }
            if (uriValues.length === 0) {continue;}

            // Extract other properties with flexible property names
            const prefLabelValues = this.extractPropertyValues(row, 
                columnMap.get('skos:prefLabel') || 
                columnMap.get('prefLabel') || 
                columnMap.get('rdfs:label') || 
                columnMap.get('label') || 
                new Map(), 'en');
            const definitionValues = this.extractPropertyValues(row, 
                columnMap.get('skos:definition') || 
                columnMap.get('definition') || 
                new Map(), 'en');
            const notationValues = this.extractPropertyValues(row, 
                columnMap.get('skos:notation') || 
                columnMap.get('notation') || 
                new Map());
            const altLabelValues = this.extractPropertyValues(row, 
                columnMap.get('skos:altLabel') || 
                columnMap.get('altLabel') || 
                new Map(), 'en');

            // Extract RDFS-specific properties
            const subClassOfValues = this.extractPropertyValues(row, 
                columnMap.get('rdfs:subClassOf') || 
                columnMap.get('subClassOf') || 
                new Map());
            const domainValues = this.extractPropertyValues(row, 
                columnMap.get('rdfs:domain') || 
                columnMap.get('domain') || 
                new Map());
            const rangeValues = this.extractPropertyValues(row, 
                columnMap.get('rdfs:range') || 
                columnMap.get('range') || 
                new Map());
            const subPropertyOfValues = this.extractPropertyValues(row, 
                columnMap.get('rdfs:subPropertyOf') || 
                columnMap.get('subPropertyOf') || 
                new Map());

            // Create concept object with expanded URI
            const concept = {
                uri: this.expandUri(uriValues[0], vocab),
                prefLabel: prefLabelValues[0] || '',
                definition: definitionValues[0] || '',
                notation: notationValues[0] || '',
                altLabels: altLabelValues,
                // Add RDFS properties
                subClassOf: subClassOfValues,
                domain: domainValues,
                range: rangeValues,
                subPropertyOf: subPropertyOfValues,
                source: 'sheet',
                rowIndex: i
            };

            // Add additional languages if available
            concept.labels = {};
            const prefLabelMap = columnMap.get('skos:prefLabel') || 
                               columnMap.get('prefLabel') || 
                               columnMap.get('rdfs:label') || 
                               columnMap.get('label');
            if (prefLabelMap) {
                for (const [lang, colIndices] of prefLabelMap) {
                    if (lang !== 'default' && colIndices[0] !== undefined && row[colIndices[0]]) {
                        concept.labels[lang] = row[colIndices[0]].trim();
                    }
                }
            }

            concepts.push(concept);
        }

        console.log(`   📝 Parsed ${concepts.length} concepts from ${sheetName}`);
        return concepts;
    }

    /**
     * Fetch and parse RDF concepts from vocabulary with flexible endpoint discovery
     */
    async fetchRdfConcepts(vocabUri) {
        // Try different RDF endpoint patterns, prioritizing content negotiation
        const endpointStrategies = [
            // First try content negotiation on the base URI with different Accept headers
            { url: vocabUri, headers: { 'Accept': 'application/rdf+xml, application/xml' } },
            { url: vocabUri, headers: { 'Accept': 'application/rdf+xml' } },
            { url: vocabUri, headers: { 'Accept': 'text/turtle, application/turtle' } },
            { url: vocabUri, headers: { 'Accept': 'application/n-triples' } },
            { url: vocabUri, headers: { 'Accept': 'text/rdf+n3' } },
            
            // Then try common file extensions
            { url: `${vocabUri}.rdf`, headers: { 'Accept': 'application/rdf+xml, application/xml' } },
            { url: `${vocabUri}/rdf`, headers: { 'Accept': 'application/rdf+xml, application/xml' } },
            { url: `${vocabUri}.xml`, headers: { 'Accept': 'application/rdf+xml, application/xml' } },
            { url: `${vocabUri}.ttl`, headers: { 'Accept': 'text/turtle, application/turtle' } },
            { url: `${vocabUri}.n3`, headers: { 'Accept': 'text/rdf+n3' } },
            
            // Finally try export endpoints
            { url: `${vocabUri}/export.rdf`, headers: { 'Accept': 'application/rdf+xml, application/xml' } },
            { url: `${vocabUri}/export`, headers: { 'Accept': 'application/rdf+xml, application/xml' } },
            { url: `${vocabUri}/data.rdf`, headers: { 'Accept': 'application/rdf+xml, application/xml' } }
        ];

        for (const strategy of endpointStrategies) {
            try {
                console.log(`   🔍 Trying RDF endpoint: ${strategy.url} (Accept: ${strategy.headers.Accept})`);
                const response = await fetch(strategy.url, {
                    headers: {
                        ...strategy.headers,
                        'User-Agent': 'Vocabulary-Comparison-Tool/1.0'
                    },
                    redirect: 'follow' // Follow redirects for content negotiation
                });

                // Accept both successful responses (2xx) and 303 See Other responses (which include content)
                if (response.ok || response.status === 303) {
                    const rdfText = await response.text();
                    if (rdfText && rdfText.length > 100) { // Ensure we got actual content
                        console.log(`   ✅ Successfully fetched RDF (${rdfText.length} chars) from ${strategy.url} (HTTP ${response.status})`);
                        console.log(`   📄 Content-Type: ${response.headers.get('content-type')}`);
                        return this.parseRdfConcepts(rdfText, vocabUri);
                    } 
                        console.log(`   ⚠️  HTTP ${response.status}: Empty or minimal content from ${strategy.url}`);
                    
                } else {
                    console.log(`   ⚠️  HTTP ${response.status}: ${response.statusText} from ${strategy.url}`);
                }
            } catch (error) {
                console.log(`   ⚠️  Failed to fetch from ${strategy.url}: ${error.message}`);
            }
        }

        throw new Error(`Could not fetch RDF from any endpoint for ${vocabUri}`);
    }

    /**
     * Parse RDF/XML to extract SKOS concepts, RDFS classes, and RDF properties
     * Using basic string parsing since we're in Node.js
     */
    parseRdfConcepts(rdfText, vocabUri) {
        const concepts = [];

        // Remove ConceptScheme blocks to avoid confusion
        const schemeRegex = /<(?:skos:)?ConceptScheme[^>]*>.*?<\/(?:skos:)?ConceptScheme>/gs;
        const rdfWithoutScheme = rdfText.replace(schemeRegex, '');

        // Parse SKOS Concepts
        const skosConceptRegex = /<(?:skos:)?Concept[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/(?:skos:)?Concept>/gs;
        this.parseRdfElements(rdfWithoutScheme, skosConceptRegex, concepts, 'skos:Concept');

        // Parse RDFS Classes
        const rdfsClassRegex = /<(?:rdfs:)?Class[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/(?:rdfs:)?Class>/gs;
        this.parseRdfElements(rdfWithoutScheme, rdfsClassRegex, concepts, 'rdfs:Class');

        // Parse RDF Properties
        const rdfPropertyRegex = /<(?:rdf:)?Property[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/(?:rdf:)?Property>/gs;
        this.parseRdfElements(rdfWithoutScheme, rdfPropertyRegex, concepts, 'rdf:Property');

        // Parse OWL Classes (common in many vocabularies)
        const owlClassRegex = /<(?:owl:)?Class[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/(?:owl:)?Class>/gs;
        this.parseRdfElements(rdfWithoutScheme, owlClassRegex, concepts, 'owl:Class');

        // Parse OWL Object Properties
        const owlObjectPropertyRegex = /<(?:owl:)?ObjectProperty[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/(?:owl:)?ObjectProperty>/gs;
        this.parseRdfElements(rdfWithoutScheme, owlObjectPropertyRegex, concepts, 'owl:ObjectProperty');

        // Parse OWL Datatype Properties
        const owlDatatypePropertyRegex = /<(?:owl:)?DatatypeProperty[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/(?:owl:)?DatatypeProperty>/gs;
        this.parseRdfElements(rdfWithoutScheme, owlDatatypePropertyRegex, concepts, 'owl:DatatypeProperty');

        // Parse rdf:Description elements with rdf:type (common pattern for classes and properties)
        this.parseRdfDescriptionElements(rdfWithoutScheme, concepts);

        console.log(`   📝 Parsed ${concepts.length} elements from RDF (concepts, classes, and properties)`);
        return concepts;
    }

    /**
     * Parse rdf:Description elements with rdf:type to determine element type
     */
    parseRdfDescriptionElements(rdfText, concepts) {
        const descriptionRegex = /<rdf:Description[^>]*(?:rdf:about|about)=["']([^"']+)["'][^>]*>(.*?)<\/rdf:Description>/gs;
        let match;
        let count = 0;
        
        while ((match = descriptionRegex.exec(rdfText)) !== null) {
            const uri = match[1];
            const descriptionContent = match[2];
            
            // Determine element type from rdf:type
            let elementType = 'rdf:Description';
            
            // Check for SKOS Concept
            if (descriptionContent.includes('rdf:resource="http://www.w3.org/2004/02/skos/core#Concept"')) {
                elementType = 'skos:Concept';
            }
            // Check for RDFS Class  
            else if (descriptionContent.includes('rdf:resource="http://www.w3.org/2000/01/rdf-schema#Class"')) {
                elementType = 'rdfs:Class';
            }
            // Check for RDF Property
            else if (descriptionContent.includes('rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"')) {
                elementType = 'rdf:Property';
            }
            // Check for OWL Class
            else if (descriptionContent.includes('rdf:resource="http://www.w3.org/2002/07/owl#Class"')) {
                elementType = 'owl:Class';
            }
            // Check for OWL Object Property
            else if (descriptionContent.includes('rdf:resource="http://www.w3.org/2002/07/owl#ObjectProperty"')) {
                elementType = 'owl:ObjectProperty';
            }
            // Check for OWL Datatype Property
            else if (descriptionContent.includes('rdf:resource="http://www.w3.org/2002/07/owl#DatatypeProperty"')) {
                elementType = 'owl:DatatypeProperty';
            }
            // Skip if it's not a recognized type we care about
            else {
                continue;
            }

            const concept = {
                uri: uri,
                prefLabel: this.extractRdfProperty(descriptionContent, 'prefLabel', 'en') || 
                          this.extractRdfProperty(descriptionContent, 'label', 'en'),
                definition: this.extractRdfProperty(descriptionContent, 'definition', 'en') || 
                           this.extractRdfProperty(descriptionContent, 'comment', 'en'),
                notation: this.extractRdfProperty(descriptionContent, 'notation'),
                elementType: elementType,
                source: 'rdf'
            };

            // Extract alt labels
            concept.altLabels = this.extractRdfPropertyArray(descriptionContent, 'altLabel', 'en');

            // Extract labels in other languages
            concept.labels = {};
            const langRegex = /xml:lang=["']([^"']+)["']/g;
            let langMatch;
            while ((langMatch = langRegex.exec(descriptionContent)) !== null) {
                const lang = langMatch[1];
                if (lang !== 'en') {
                    const label = this.extractRdfProperty(descriptionContent, 'prefLabel', lang) ||
                                 this.extractRdfProperty(descriptionContent, 'label', lang);
                    if (label) {concept.labels[lang] = label;}
                }
            }

            // Add RDFS-specific properties
            if (elementType.includes('Class')) {
                concept.subClassOf = this.extractRdfPropertyArray(descriptionContent, 'subClassOf');
            }
            
            if (elementType.includes('Property')) {
                concept.domain = this.extractRdfPropertyArray(descriptionContent, 'domain');
                concept.range = this.extractRdfPropertyArray(descriptionContent, 'range');
                concept.subPropertyOf = this.extractRdfPropertyArray(descriptionContent, 'subPropertyOf');
            }

            concepts.push(concept);
            count++;
        }

        if (count > 0) {
            console.log(`   📊 Found ${count} rdf:Description elements with recognized types`);
        }
    }

    /**
     * Parse RDF elements using a regex pattern
     */
    parseRdfElements(rdfText, regex, concepts, elementType) {
        let match;
        let count = 0;
        
        while ((match = regex.exec(rdfText)) !== null) {
            const uri = match[1];
            const elementContent = match[2];

            const concept = {
                uri: uri,
                prefLabel: this.extractRdfProperty(elementContent, 'prefLabel', 'en') || 
                          this.extractRdfProperty(elementContent, 'label', 'en'),
                definition: this.extractRdfProperty(elementContent, 'definition', 'en') || 
                           this.extractRdfProperty(elementContent, 'comment', 'en'),
                notation: this.extractRdfProperty(elementContent, 'notation'),
                elementType: elementType,
                source: 'rdf'
            };

            // Extract alt labels
            concept.altLabels = this.extractRdfPropertyArray(elementContent, 'altLabel', 'en');

            // Extract labels in other languages
            concept.labels = {};
            const langRegex = /xml:lang=["']([^"']+)["']/g;
            let langMatch;
            while ((langMatch = langRegex.exec(elementContent)) !== null) {
                const lang = langMatch[1];
                if (lang !== 'en') {
                    const label = this.extractRdfProperty(elementContent, 'prefLabel', lang) ||
                                 this.extractRdfProperty(elementContent, 'label', lang);
                    if (label) {concept.labels[lang] = label;}
                }
            }

            // Add RDFS-specific properties
            if (elementType.includes('Class')) {
                concept.subClassOf = this.extractRdfPropertyArray(elementContent, 'subClassOf');
            }
            
            if (elementType.includes('Property')) {
                concept.domain = this.extractRdfPropertyArray(elementContent, 'domain');
                concept.range = this.extractRdfPropertyArray(elementContent, 'range');
                concept.subPropertyOf = this.extractRdfPropertyArray(elementContent, 'subPropertyOf');
            }

            concepts.push(concept);
            count++;
        }

        if (count > 0) {
            console.log(`   📊 Found ${count} ${elementType} elements`);
        }
    }

    /**
     * Extract a single property value from RDF content
     */
    extractRdfProperty(content, property, language = null) {
        let pattern;
        if (language) {
            // Try multiple namespace prefixes for the property
            pattern = new RegExp(`<(?:skos:|rdfs:|rdf:)?${property}[^>]*xml:lang=["']${language}["'][^>]*>([^<]+)<`, 'i');
        } else {
            pattern = new RegExp(`<(?:skos:|rdfs:|rdf:)?${property}[^>]*>([^<]+)<`, 'i');
        }

        const match = content.match(pattern);
        return match ? match[1].trim() : '';
    }

    /**
     * Extract array of property values from RDF content
     */
    extractRdfPropertyArray(content, property, language = null) {
        const values = [];
        
        if (language) {
            const pattern = new RegExp(`<(?:skos:|rdfs:|rdf:)?${property}[^>]*xml:lang=["']${language}["'][^>]*>([^<]+)<`, 'gi');
            let match;
            while ((match = pattern.exec(content)) !== null) {
                values.push(match[1].trim());
            }
        } else {
            // For properties that might have rdf:resource attributes (preferred for object properties)
            const resourcePattern = new RegExp(`<(?:skos:|rdfs:|rdf:)?${property}[^>]*rdf:resource=["']([^"']+)["']`, 'gi');
            
            let match;
            while ((match = resourcePattern.exec(content)) !== null) {
                values.push(match[1].trim());
            }
            
            // Only try text content if no resources were found
            if (values.length === 0) {
                const textPattern = new RegExp(`<(?:skos:|rdfs:|rdf:)?${property}[^>]*>([^<]+)<`, 'gi');
                while ((match = textPattern.exec(content)) !== null) {
                    const textValue = match[1].trim();
                    if (textValue) { // Only add non-empty values
                        values.push(textValue);
                    }
                }
            }
        }

        return values;
    }

    /**
     * Compare concepts from sheet vs RDF
     */
    compareConcepts(vocab, sheetConcepts, rdfConcepts) {
        const matches = [];
        const mismatches = [];
        const missing = [];

        // Create lookup map for RDF concepts
        const rdfMap = new Map();
        rdfConcepts.forEach(concept => {
            rdfMap.set(concept.uri, concept);
        });

        // Compare each sheet concept
        sheetConcepts.forEach(sheetConcept => {
            const rdfConcept = rdfMap.get(sheetConcept.uri);

            if (!rdfConcept) {
                missing.push({
                    vocabulary: vocab.token,
                    uri: sheetConcept.uri,
                    prefLabel: sheetConcept.prefLabel,
                    issue: 'Not found in RDF',
                    rowIndex: sheetConcept.rowIndex,
                    debug: `Looking for: ${sheetConcept.uri}`
                });
                return;
            }

            // Compare properties
            const comparison = {
                vocabulary: vocab.token,
                uri: sheetConcept.uri,
                rowIndex: sheetConcept.rowIndex,
                elementType: rdfConcept.elementType || 'unknown',
                prefLabelMatch: this.normalizeText(sheetConcept.prefLabel) === this.normalizeText(rdfConcept.prefLabel),
                definitionMatch: this.normalizeText(sheetConcept.definition) === this.normalizeText(rdfConcept.definition),
                notationMatch: sheetConcept.notation === rdfConcept.notation,
                sheetValues: {
                    prefLabel: sheetConcept.prefLabel,
                    definition: sheetConcept.definition,
                    notation: sheetConcept.notation,
                    labels: sheetConcept.labels || {},
                    // Include RDFS-specific properties from sheet
                    subClassOf: sheetConcept.subClassOf || [],
                    domain: sheetConcept.domain || [],
                    range: sheetConcept.range || [],
                    subPropertyOf: sheetConcept.subPropertyOf || []
                },
                rdfValues: {
                    prefLabel: rdfConcept.prefLabel,
                    definition: rdfConcept.definition,
                    notation: rdfConcept.notation,
                    labels: rdfConcept.labels || {},
                    elementType: rdfConcept.elementType,
                    // Include RDFS-specific properties from RDF
                    subClassOf: rdfConcept.subClassOf || [],
                    domain: rdfConcept.domain || [],
                    range: rdfConcept.range || [],
                    subPropertyOf: rdfConcept.subPropertyOf || []
                }
            };

            // Normalize RDF URIs to prefixed form for comparison
            const normalizedRdfSubClassOf = comparison.rdfValues.subClassOf.map(uri => this.normalizeUri(uri, vocab));
            const normalizedRdfDomain = comparison.rdfValues.domain.map(uri => this.normalizeUri(uri, vocab));
            const normalizedRdfRange = comparison.rdfValues.range.map(uri => this.normalizeUri(uri, vocab));
            const normalizedRdfSubPropertyOf = comparison.rdfValues.subPropertyOf.map(uri => this.normalizeUri(uri, vocab));

            // Add RDFS-specific comparisons using normalized URIs
            comparison.subClassOfMatch = this.compareArrays(comparison.sheetValues.subClassOf, normalizedRdfSubClassOf);
            comparison.domainMatch = this.compareArrays(comparison.sheetValues.domain, normalizedRdfDomain);
            comparison.rangeMatch = this.compareArrays(comparison.sheetValues.range, normalizedRdfRange);
            comparison.subPropertyOfMatch = this.compareArrays(comparison.sheetValues.subPropertyOf, normalizedRdfSubPropertyOf);

            // Store normalized values for reporting
            comparison.rdfValues.subClassOf = normalizedRdfSubClassOf;
            comparison.rdfValues.domain = normalizedRdfDomain;
            comparison.rdfValues.range = normalizedRdfRange;
            comparison.rdfValues.subPropertyOf = normalizedRdfSubPropertyOf;

            // Determine if this is a match (all core properties must match)
            const corePropertiesMatch = comparison.prefLabelMatch && 
                                      comparison.definitionMatch && 
                                      comparison.notationMatch;
            
            // For RDFS elements, also check relevant structural properties
            let structuralPropertiesMatch = true;
            if (rdfConcept.elementType && rdfConcept.elementType.includes('Class')) {
                structuralPropertiesMatch = comparison.subClassOfMatch;
            } else if (rdfConcept.elementType && rdfConcept.elementType.includes('Property')) {
                structuralPropertiesMatch = comparison.domainMatch && 
                                         comparison.rangeMatch && 
                                         comparison.subPropertyOfMatch;
            }

            if (corePropertiesMatch && structuralPropertiesMatch) {
                matches.push(comparison);
            } else {
                mismatches.push(comparison);
            }

            // Remove from RDF map to track what's left
            rdfMap.delete(sheetConcept.uri);
        });

        // Any remaining RDF concepts are missing from sheet
        rdfMap.forEach(rdfConcept => {
            missing.push({
                vocabulary: vocab.token,
                uri: rdfConcept.uri,
                prefLabel: rdfConcept.prefLabel,
                issue: 'Not found in sheet'
            });
        });

        return { matches, mismatches, missing };
    }

    /**
     * Normalize text for comparison (trim, lowercase, normalize whitespace)
     */
    normalizeText(text) {
        if (!text) {return '';}
        return text.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    /**
     * Compare two arrays for equality (order-independent)
     */
    compareArrays(arr1, arr2) {
        if (!arr1 && !arr2) {return true;}
        if (!arr1 || !arr2) {return false;}
        if (arr1.length !== arr2.length) {return false;}
        
        const normalized1 = arr1.map(item => this.normalizeText(item)).sort();
        const normalized2 = arr2.map(item => this.normalizeText(item)).sort();
        
        return normalized1.every((item, index) => item === normalized2[index]);
    }

    /**
     * Generate comprehensive comparison report
     */
    generateReport() {
        console.log('\n📊 COMPARISON REPORT');
        console.log('='.repeat(50));

        const totalVocabularies = this.vocabularies.length;
        const vocabsWithRdf = this.vocabularies.filter(v => v.hasRdf).length;
        const totalMatches = this.results.matches.length;
        const totalMismatches = this.results.mismatches.length;
        const totalMissing = this.results.missing.length;
        const totalErrors = this.results.errors.length;

        console.log(`📋 Total Vocabularies: ${totalVocabularies}`);
        console.log(`🔗 Vocabularies with RDF: ${vocabsWithRdf}`);
        console.log(`✅ Perfect Matches: ${totalMatches}`);
        console.log(`⚠️  Mismatches: ${totalMismatches}`);
        console.log(`❌ Missing: ${totalMissing}`);
        console.log(`🚨 Errors: ${totalErrors}`);

        // Detailed mismatch report
        if (totalMismatches > 0) {
            console.log('\n⚠️  DETAILED MISMATCHES:');
            this.results.mismatches.forEach(mismatch => {
                console.log(`\n${mismatch.vocabulary} - Row ${mismatch.rowIndex} - ${mismatch.uri}`);
                console.log(`  🏷️  Element Type: ${mismatch.elementType || 'unknown'}`);
                if (!mismatch.prefLabelMatch) {
                    console.log(`  📝 Label: "${mismatch.sheetValues.prefLabel}" vs "${mismatch.rdfValues.prefLabel}"`);
                }
                if (!mismatch.definitionMatch) {
                    console.log(`  📖 Definition mismatch (lengths: ${mismatch.sheetValues.definition.length} vs ${mismatch.rdfValues.definition.length})`);
                }
                if (!mismatch.notationMatch) {
                    console.log(`  🔢 Notation: "${mismatch.sheetValues.notation}" vs "${mismatch.rdfValues.notation}"`);
                }
                
                // Show RDFS-specific mismatches
                if (mismatch.elementType && mismatch.elementType.includes('Class') && !mismatch.subClassOfMatch) {
                    console.log(`  🔗 rdfs:subClassOf: [${mismatch.sheetValues.subClassOf.join(', ')}] vs [${mismatch.rdfValues.subClassOf.join(', ')}]`);
                }
                if (mismatch.elementType && mismatch.elementType.includes('Property')) {
                    if (!mismatch.domainMatch) {
                        console.log(`  🎯 rdfs:domain: [${mismatch.sheetValues.domain.join(', ')}] vs [${mismatch.rdfValues.domain.join(', ')}]`);
                    }
                    if (!mismatch.rangeMatch) {
                        console.log(`  📐 rdfs:range: [${mismatch.sheetValues.range.join(', ')}] vs [${mismatch.rdfValues.range.join(', ')}]`);
                    }
                    if (!mismatch.subPropertyOfMatch) {
                        console.log(`  🔗 rdfs:subPropertyOf: [${mismatch.sheetValues.subPropertyOf.join(', ')}] vs [${mismatch.rdfValues.subPropertyOf.join(', ')}]`);
                    }
                }
            });
        }

        // Missing concepts report
        if (totalMissing > 0) {
            console.log('\n❌ MISSING CONCEPTS:');
            this.results.missing.forEach(missing => {
                const rowInfo = missing.rowIndex ? ` (Row ${missing.rowIndex})` : '';
                console.log(`  ${missing.vocabulary}${rowInfo}: ${missing.prefLabel} - ${missing.issue}`);
            });
        }

        // Error report
        if (totalErrors > 0) {
            console.log('\n🚨 ERRORS:');
            this.results.errors.forEach(error => {
                console.log(`  ${error.vocabulary || 'General'}: ${error.message}`);
            });
        }

        return this.results;
    }

    /**
     * Generate markdown report
     */
    generateMarkdownReport(results) {
        const timestamp = new Date().toISOString();
        const totalVocabularies = this.vocabularies.length;
        const vocabsWithRdf = this.vocabularies.filter(v => v.hasRdf).length;
        const vocabsWithSheets = this.vocabularies.filter(v => v.sheetId).length;
        const totalMatches = results.matches.length;
        const totalMismatches = results.mismatches.length;
        const totalMissing = results.missing.length;
        const totalErrors = results.errors.length;

        let markdown = `# Vocabulary Comparison Report
Generated: ${timestamp}
Spreadsheet: \`${this.spreadsheetId}\`

## Summary

| Metric | Count |
|--------|-------|
| Total Vocabularies | ${totalVocabularies} |
| Vocabularies with RDF URIs | ${vocabsWithRdf} |
| Vocabularies with Sheets | ${vocabsWithSheets} |
| Perfect Matches | ${totalMatches} |
| Mismatches | ${totalMismatches} |
| Missing Concepts | ${totalMissing} |
| Errors | ${totalErrors} |

## Configuration

- **Index Sheet**: \`${this.options.indexSheet}\`
- **RDF Check**: ${this.options.skipRdfCheck ? 'Disabled' : 'Enabled'}
- **Mode**: ${this.options.skipRdfCheck ? 'Structure Validation Only' : 'Full RDF Comparison'}

## Vocabulary Details

| Token | Title | Sheet Name | RDF URI | Concepts | Status |
|-------|-------|------------|---------|----------|--------|
`;

        // Add vocabulary summary table
        this.vocabularies.forEach(vocab => {
            const conceptCount = this.getConceptCount(vocab);
            const status = this.getVocabStatus(vocab, results);
            const sheetName = vocab.sheetName || 'N/A';
            const rdfUri = vocab.uri || 'N/A';
            
            markdown += `| ${vocab.token} | ${vocab.title || 'N/A'} | ${sheetName} | ${rdfUri} | ${conceptCount} | ${status} |\n`;
        });

        // Available sheets section
        if (this.availableSheets && this.availableSheets.length > 0) {
            markdown += `\n## Available Sheets

The following sheets were found in the spreadsheet:

`;
            this.availableSheets.forEach(sheet => {
                markdown += `- **${sheet.title}** (ID: ${sheet.sheetId})\n`;
            });
        }

        // Detailed results sections
        if (totalMatches > 0) {
            markdown += `\n## ✅ Perfect Matches (${totalMatches})

The following concepts matched perfectly between sheets and RDF:

| Vocabulary | URI | Preferred Label |
|------------|-----|-----------------|
`;
            results.matches.forEach(match => {
                markdown += `| ${match.vocabulary} | ${match.uri} | ${match.sheetValues.prefLabel} |\n`;
            });
        }

        if (totalMismatches > 0) {
            markdown += `\n## ⚠️ Mismatches (${totalMismatches})

The following concepts have differences between sheets and RDF:

`;
            results.mismatches.forEach(mismatch => {
                markdown += `### ${mismatch.vocabulary} - Row ${mismatch.rowIndex}

**URI**: \`${mismatch.uri}\`  
**Element Type**: \`${mismatch.elementType || 'unknown'}\`

| Property | Sheet Value | RDF Value | Match |
|----------|-------------|-----------|-------|
| Preferred Label | ${this.escapeMarkdown(mismatch.sheetValues.prefLabel)} | ${this.escapeMarkdown(mismatch.rdfValues.prefLabel)} | ${mismatch.prefLabelMatch ? '✅' : '❌'} |
| Definition | ${this.truncateText(mismatch.sheetValues.definition, 100)} | ${this.truncateText(mismatch.rdfValues.definition, 100)} | ${mismatch.definitionMatch ? '✅' : '❌'} |
| Notation | ${this.escapeMarkdown(mismatch.sheetValues.notation)} | ${this.escapeMarkdown(mismatch.rdfValues.notation)} | ${mismatch.notationMatch ? '✅' : '❌'} |`;

                // Add RDFS-specific properties for classes
                if (mismatch.elementType && mismatch.elementType.includes('Class')) {
                    markdown += `
| rdfs:subClassOf | ${this.formatArrayForMarkdown(mismatch.sheetValues.subClassOf)} | ${this.formatArrayForMarkdown(mismatch.rdfValues.subClassOf)} | ${mismatch.subClassOfMatch ? '✅' : '❌'} |`;
                }

                // Add RDFS-specific properties for properties
                if (mismatch.elementType && mismatch.elementType.includes('Property')) {
                    markdown += `
| rdfs:domain | ${this.formatArrayForMarkdown(mismatch.sheetValues.domain)} | ${this.formatArrayForMarkdown(mismatch.rdfValues.domain)} | ${mismatch.domainMatch ? '✅' : '❌'} |
| rdfs:range | ${this.formatArrayForMarkdown(mismatch.sheetValues.range)} | ${this.formatArrayForMarkdown(mismatch.rdfValues.range)} | ${mismatch.rangeMatch ? '✅' : '❌'} |
| rdfs:subPropertyOf | ${this.formatArrayForMarkdown(mismatch.sheetValues.subPropertyOf)} | ${this.formatArrayForMarkdown(mismatch.rdfValues.subPropertyOf)} | ${mismatch.subPropertyOfMatch ? '✅' : '❌'} |`;
                }

                markdown += `

`;
            });
        }

        if (totalMissing > 0) {
            markdown += `\n## ❌ Missing Concepts (${totalMissing})

The following concepts are missing in either the sheet or RDF:

| Vocabulary | URI | Preferred Label | Issue |
|------------|-----|-----------------|-------|
`;
            results.missing.forEach(missing => {
                const rowInfo = missing.rowIndex ? ` (Row ${missing.rowIndex})` : '';
                markdown += `| ${missing.vocabulary}${rowInfo} | ${missing.uri} | ${missing.prefLabel} | ${missing.issue} |\n`;
            });
        }

        if (totalErrors > 0) {
            markdown += `\n## 🚨 Errors (${totalErrors})

The following errors occurred during processing:

`;
            results.errors.forEach(error => {
                markdown += `- **${error.vocabulary || 'General'}**: ${error.message}\n`;
            });
        }

        // Recommendations section
        markdown += `\n## Recommendations

`;
        if (totalErrors > 0) {
            markdown += `- **Address Errors**: ${totalErrors} error(s) occurred during processing. Review the errors section above.\n`;
        }
        if (totalMismatches > 0) {
            markdown += `- **Review Mismatches**: ${totalMismatches} concept(s) have differences between sheet and RDF data.\n`;
        }
        if (totalMissing > 0) {
            markdown += `- **Sync Missing Concepts**: ${totalMissing} concept(s) are missing in either the sheet or RDF.\n`;
        }
        if (vocabsWithRdf > vocabsWithSheets) {
            markdown += `- **Missing Sheets**: ${vocabsWithRdf - vocabsWithSheets} vocabular(ies) have RDF URIs but no corresponding sheets.\n`;
        }
        if (totalMatches === (totalMatches + totalMismatches) && totalMissing === 0 && totalErrors === 0) {
            markdown += `- **✅ All Good**: All concepts are properly synchronized between sheets and RDF!\n`;
        }

        // Write to file
        try {
            // Ensure tmp directory exists
            const outputDir = path.dirname(this.options.outputPath);
            if (outputDir && outputDir !== '.') {
                try {
                    import('fs').then(fs => {
                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true });
                        }
                    });
                } catch (e) {
                    // Directory might already exist, continue
                }
            }
            
            writeFileSync(this.options.outputPath, markdown);
            console.log(`\n📄 Markdown report saved to: ${this.options.outputPath}`);
        } catch (error) {
            console.error('Error writing markdown report:', error.message);
            console.log('\n📄 Report content:');
            console.log(markdown);
        }
    }

    /**
     * Get concept count for a vocabulary
     */
    getConceptCount(vocab) {
        // Count from results if available
        const matchCount = this.results.matches.filter(m => m.vocabulary === vocab.token).length;
        const mismatchCount = this.results.mismatches.filter(m => m.vocabulary === vocab.token).length;
        const total = matchCount + mismatchCount;
        
        return total > 0 ? total : 'N/A';
    }

    /**
     * Get status for a vocabulary
     */
    getVocabStatus(vocab, results) {
        const hasErrors = results.errors.some(e => e.vocabulary === vocab.token);
        if (hasErrors) {return '❌ Error';}
        
        if (!vocab.sheetId) {return '⚠️ No Sheet';}
        if (!vocab.hasRdf && !this.options.skipRdfCheck) {return '⚠️ No RDF';}
        
        const matches = results.matches.filter(m => m.vocabulary === vocab.token).length;
        const mismatches = results.mismatches.filter(m => m.vocabulary === vocab.token).length;
        const missing = results.missing.filter(m => m.vocabulary === vocab.token).length;
        
        if (this.options.skipRdfCheck) {return '✅ Validated';}
        if (mismatches === 0 && missing === 0 && matches > 0) {return '✅ Perfect';}
        if (mismatches > 0 || missing > 0) {return '⚠️ Issues';}
        
        return '✅ Processed';
    }

    /**
     * Escape markdown special characters
     */
    escapeMarkdown(text) {
        if (!text) {return '';}
        return text.replace(/[|\\`*_{}[\]()#+\-.!"]/g, '\\$&');
    }

    /**
     * Truncate text for display
     */
    truncateText(text, maxLength) {
        if (!text) {return '';}
        if (text.length <= maxLength) {return this.escapeMarkdown(text);}
        return `${this.escapeMarkdown(text.substring(0, maxLength))  }...`;
    }

    /**
     * Format array for markdown display
     */
    formatArrayForMarkdown(arr) {
        if (!arr || arr.length === 0) {return 'none';}
        if (arr.length === 1) {return this.escapeMarkdown(arr[0]);}
        return arr.map(item => this.escapeMarkdown(item)).join(', ');
    }
}

// Command line argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        spreadsheetId: null,
        indexSheet: 'index',
        skipRdfCheck: false,
        markdown: false,
        outputPath: 'tmp/vocabulary-comparison-report.md',
        help: false
    };

    args.forEach(arg => {
        if (arg.startsWith('--spreadsheet-id=')) {
            options.spreadsheetId = arg.split('=')[1];
        } else if (arg.startsWith('--index-sheet=')) {
            options.indexSheet = arg.split('=')[1];
        } else if (arg.startsWith('--output=')) {
            options.outputPath = arg.split('=')[1];
        } else if (arg === '--skip-rdf-check') {
            options.skipRdfCheck = true;
        } else if (arg === '--markdown' || arg === '-md') {
            options.markdown = true;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
    });

    return options;
}

// Show help
function showHelp() {
    console.log(`
Generic Vocabulary Comparison Tool

Usage:
  node scripts/vocabulary-comparison.js --spreadsheet-id=YOUR_ID [options]
  yarn compare:vocabulary --spreadsheet-id=YOUR_ID [options]

Options:
  --spreadsheet-id=ID    Required: Google Sheets spreadsheet ID
  --index-sheet=NAME     Optional: Name of index sheet (default: 'index')
  --skip-rdf-check       Optional: Skip RDF comparison, only validate sheet structure
  --markdown, -md        Optional: Output results as markdown file
  --output=PATH          Optional: Custom output file path (default: tmp/vocabulary-comparison-report.md)
  --help, -h             Show this help message

Examples:
  # Compare vocabularies with RDF
  yarn compare:vocabulary --spreadsheet-id=1_QI2DqNomn0jCqSdjOxCZVF6wxz6FuRuIKBMweaGmfQ
  
  # Only validate sheet structure
  yarn compare:vocabulary --spreadsheet-id=YOUR_ID --skip-rdf-check
  
  # Generate markdown report
  yarn compare:vocabulary --spreadsheet-id=YOUR_ID --markdown
  
  # Custom output location
  yarn compare:vocabulary --spreadsheet-id=YOUR_ID --markdown --output=reports/my-report.md
  
  # Use custom index sheet name
  yarn compare:vocabulary --spreadsheet-id=YOUR_ID --index-sheet=vocabularies

Environment Variables:
  GOOGLE_SHEETS_API_KEY  Required: Your Google Sheets API key

The tool expects an index sheet with columns like:
- token/name/sheet/vocabulary: The sheet name containing the vocabulary
- title/label/description: Human-readable title (optional)
- id/uri/url/namespace: RDF namespace/endpoint URI (optional, required for RDF comparison)

Each vocabulary sheet should have SKOS-compatible columns like:
- uri/@id/id/concept: Concept URI
- skos:prefLabel@en or prefLabel@en: Preferred label
- skos:definition@en or definition@en: Definition
- skos:notation or notation: Notation
- Additional language variants: @es, @fr, etc.
`);
}

// Main execution function
async function runVocabularyComparison() {
    const options = parseArgs();

    if (options.help) {
        showHelp();
        return;
    }

    if (!options.spreadsheetId) {
        console.error('❌ --spreadsheet-id parameter is required');
        console.error('Use --help for usage information');
        process.exit(1);
    }

    // Load configuration from environment
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!apiKey) {
        console.error('❌ GOOGLE_SHEETS_API_KEY not found in .env file');
        process.exit(1);
    }

    // Create and run comparison
    const tool = new VocabularyComparisonTool(apiKey, options.spreadsheetId, options);
    const results = await tool.runComparison();

    return results;
}

// Run if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
    runVocabularyComparison()
        .then(results => {
            console.log('\n🎉 Comparison completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

export { VocabularyComparisonTool, runVocabularyComparison };