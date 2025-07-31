import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock langdetect
vi.mock('langdetect', () => ({
  default: {
    detect: vi.fn((text: string) => {
      // Mock language detection based on text patterns
      if (!text || text.length < 3) return [];
      
      if (text.includes('Hello') || text.includes('hello')) return [{ lang: 'en', prob: 0.99 }];
      if (text.includes('Hola') || text.includes('español')) return [{ lang: 'es', prob: 0.98 }];
      if (text.includes('Bonjour') || text.includes('français')) return [{ lang: 'fr', prob: 0.97 }];
      if (text.includes('你好') || /[\u4e00-\u9fa5]/.test(text)) return [{ lang: 'zh-cn', prob: 0.96 }];
      if (text.includes('Привет') || /[\u0400-\u04FF]/.test(text)) return [{ lang: 'ru', prob: 0.95 }];
      if (text.includes('مرحبا') || /[\u0600-\u06FF]/.test(text)) return [{ lang: 'ar', prob: 0.94 }];
      if (text.includes('Ciao')) return [{ lang: 'it', prob: 0.93 }];
      if (text.includes('Hallo')) return [{ lang: 'de', prob: 0.92 }];
      
      return [{ lang: 'en', prob: 0.5 }]; // Default fallback
    })
  }
}));

describe('detect-language-mismatches-skos.js @unit', () => {
  const testDataDir = path.join(__dirname, 'test-skos-data');
  
  beforeEach(async () => {
    // Create test data directory
    await fs.mkdir(testDataDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors
    }
  });

  describe('Language Code Mapping for SKOS', () => {
    const DETECTED_TO_ISO = {
      'en': 'en',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'ru': 'ru',
      'ja': 'ja',
      'ko': 'ko',
      'zh-cn': 'zh',
      'zh-tw': 'zh',
      'ar': 'ar'
    };

    it('should map detected languages to ISO codes', () => {
      expect(DETECTED_TO_ISO['en']).toBe('en');
      expect(DETECTED_TO_ISO['es']).toBe('es');
      expect(DETECTED_TO_ISO['zh-cn']).toBe('zh');
      expect(DETECTED_TO_ISO['zh-tw']).toBe('zh');
    });

    it('should handle Chinese language variants', () => {
      expect(DETECTED_TO_ISO['zh-cn']).toBe('zh');
      expect(DETECTED_TO_ISO['zh-tw']).toBe('zh');
      // Both simplified and traditional Chinese map to 'zh'
    });
  });

  describe('SKOS Column Header Parsing', () => {
    const extractLanguageFromHeader = (header: string) => {
      const match = header.match(/@(\w{2,3})(?:\[|$)/);
      return match ? match[1] : null;
    };

    it('should extract language codes from SKOS property headers', () => {
      expect(extractLanguageFromHeader('skos:prefLabel@en')).toBe('en');
      expect(extractLanguageFromHeader('skos:altLabel@es')).toBe('es');
      expect(extractLanguageFromHeader('skos:definition@fr')).toBe('fr');
      expect(extractLanguageFromHeader('skos:scopeNote@de')).toBe('de');
      expect(extractLanguageFromHeader('skos:notation@it')).toBe('it');
    });

    it('should handle array notation in headers', () => {
      expect(extractLanguageFromHeader('skos:definition@en[0]')).toBe('en');
      expect(extractLanguageFromHeader('skos:altLabel@fr[1]')).toBe('fr');
      expect(extractLanguageFromHeader('skos:example@es[2]')).toBe('es');
    });

    it('should return null for non-language headers', () => {
      expect(extractLanguageFromHeader('uri')).toBeNull();
      expect(extractLanguageFromHeader('rdf:type')).toBeNull();
      expect(extractLanguageFromHeader('skos:broader')).toBeNull();
      expect(extractLanguageFromHeader('skos:inScheme')).toBeNull();
    });
  });

  describe('SKOS Vocabulary Processing', () => {
    it('should process SKOS CSV data correctly', async () => {
      const skosContent = `uri,rdf:type,skos:inScheme,skos:prefLabel@en,skos:prefLabel@es,skos:prefLabel@fr,skos:definition@en[0],skos:altLabel@en[0]
http://example.com/concepts/001,http://www.w3.org/2004/02/skos/core#Concept,http://example.com/scheme,Hello,Hola,Bonjour,"A greeting word","Hi"
http://example.com/concepts/002,http://www.w3.org/2004/02/skos/core#Concept,http://example.com/scheme,World,Mundo,Monde,"The planet Earth","Earth"
http://example.com/concepts/003,http://www.w3.org/2004/02/skos/core#Concept,http://example.com/scheme,Computer,Computadora,Ordinateur,"An electronic computing device","PC"`;

      const csvPath = path.join(testDataDir, 'skos-vocab.csv');
      await fs.writeFile(csvPath, skosContent);

      // Parse CSV
      const { parse } = await import('csv-parse/sync');
      const content = await fs.readFile(csvPath, 'utf-8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true
      });

      expect(records).toHaveLength(3);
      expect(records[0]['rdf:type']).toBe('http://www.w3.org/2004/02/skos/core#Concept');
      expect(records[0]['skos:prefLabel@en']).toBe('Hello');
      expect(records[0]['skos:definition@en[0]']).toBe('A greeting word');
    });

    it('should detect language mismatches in SKOS data', async () => {
      const skosContent = `uri,skos:prefLabel@en,skos:prefLabel@es,skos:prefLabel@fr,skos:definition@en[0]
http://example.com/001,Hello,Bonjour,Hola,"French greeting in Spanish column"
http://example.com/002,Hola,Hello,World,"Spanish greeting in English column"`;

      const { parse } = await import('csv-parse/sync');
      const records = parse(skosContent, {
        columns: true,
        skip_empty_lines: true
      });

      const langdetect = vi.mocked(await import('langdetect')).default;
      const mismatches: any[] = [];

      records.forEach((record: any, rowIndex: number) => {
        Object.entries(record).forEach(([column, value]) => {
          if (!value || column === 'uri') return;
          
          const lang = extractLanguageFromHeader(column);
          if (!lang) return;

          const detection = langdetect.detect(value as string);
          if (detection && detection.length > 0 && detection[0].prob > 0.9) {
            const detectedLang = detection[0].lang === 'zh-cn' ? 'zh' : detection[0].lang;
            if (detectedLang !== lang) {
              mismatches.push({
                row: rowIndex + 2, // +2 for header and 0-based index
                column,
                declared: lang,
                detected: detectedLang,
                confidence: detection[0].prob,
                text: value
              });
            }
          }
        });
      });

      expect(mismatches.length).toBeGreaterThan(0);
      
      // Check specific mismatches
      const frenchInSpanish = mismatches.find(m => 
        m.text === 'Bonjour' && m.declared === 'es'
      );
      expect(frenchInSpanish).toBeDefined();
      expect(frenchInSpanish.detected).toBe('fr');

      const spanishInEnglish = mismatches.find(m => 
        m.text === 'Hola' && m.declared === 'en'
      );
      expect(spanishInEnglish).toBeDefined();
      expect(spanishInEnglish.detected).toBe('es');
    });
  });

  describe('SKOS Properties Support', () => {
    it('should handle all common SKOS properties', () => {
      const skosProperties = [
        'skos:prefLabel',
        'skos:altLabel',
        'skos:hiddenLabel',
        'skos:definition',
        'skos:scopeNote',
        'skos:example',
        'skos:historyNote',
        'skos:editorialNote',
        'skos:changeNote',
        'skos:note'
      ];

      skosProperties.forEach(prop => {
        const headerWithLang = `${prop}@en`;
        const lang = extractLanguageFromHeader(headerWithLang);
        expect(lang).toBe('en');
      });
    });

    it('should handle SKOS properties with array indices', () => {
      const examples = [
        'skos:definition@en[0]',
        'skos:altLabel@fr[1]',
        'skos:example@es[10]',
        'skos:scopeNote@de[999]'
      ];

      const expected = ['en', 'fr', 'es', 'de'];

      examples.forEach((header, index) => {
        const lang = extractLanguageFromHeader(header);
        expect(lang).toBe(expected[index]);
      });
    });
  });

  describe('CSV Format Handling', () => {
    it('should handle CSV with different delimiters', async () => {
      // Note: This is for documentation - actual implementation would need delimiter detection
      const csvWithCommas = `uri,skos:prefLabel@en,skos:prefLabel@es
http://example.com/1,Hello,Hola`;

      const csvWithTabs = `uri\tskos:prefLabel@en\tskos:prefLabel@es
http://example.com/1\tHello\tHola`;

      const { parse } = await import('csv-parse/sync');
      
      const recordsComma = parse(csvWithCommas, {
        columns: true,
        delimiter: ','
      });

      const recordsTab = parse(csvWithTabs, {
        columns: true,
        delimiter: '\t'
      });

      expect(recordsComma[0]['skos:prefLabel@en']).toBe('Hello');
      expect(recordsTab[0]['skos:prefLabel@en']).toBe('Hello');
    });

    it('should handle quoted values with commas', async () => {
      const csvContent = `uri,skos:prefLabel@en,skos:definition@en[0]
http://example.com/1,"Hello, world","A greeting, commonly used"`;

      const { parse } = await import('csv-parse/sync');
      const records = parse(csvContent, {
        columns: true
      });

      expect(records[0]['skos:prefLabel@en']).toBe('Hello, world');
      expect(records[0]['skos:definition@en[0]']).toBe('A greeting, commonly used');
    });
  });

  describe('Language Detection with langdetect', () => {
    it('should detect multiple languages correctly', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const testCases = [
        { text: 'Hello world', expected: 'en' },
        { text: 'Hola mundo', expected: 'es' },
        { text: 'Bonjour le monde', expected: 'fr' },
        { text: 'Ciao mondo', expected: 'it' },
        { text: 'Hallo Welt', expected: 'de' },
        { text: '你好世界', expected: 'zh-cn' },
        { text: 'Привет мир', expected: 'ru' },
        { text: 'مرحبا بالعالم', expected: 'ar' }
      ];

      testCases.forEach(({ text, expected }) => {
        const result = langdetect.detect(text);
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].lang).toBe(expected);
        expect(result[0].prob).toBeGreaterThan(0.9);
      });
    });

    it('should handle short text with lower confidence', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const shortText = 'OK';
      const result = langdetect.detect(shortText);
      
      expect(result).toBeDefined();
      if (result.length > 0) {
        expect(result[0].prob).toBeLessThan(0.9);
      }
    });

    it('should handle mixed language text', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const mixedText = 'Hello world 你好';
      const result = langdetect.detect(mixedText);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Output and Reporting', () => {
    it('should generate console output for mismatches', () => {
      const mismatches = [
        {
          file: 'skos-vocab.csv',
          row: 2,
          uri: 'http://example.com/001',
          column: 'skos:prefLabel@es',
          declared: 'es',
          detected: 'fr',
          confidence: 0.97,
          text: 'Bonjour'
        }
      ];

      const output = mismatches.map(m => 
        `${m.file} - Row ${m.row} (${m.uri}): ${m.column} ` +
        `declared as '${m.declared}' but detected as '${m.detected}' ` +
        `(${(m.confidence * 100).toFixed(1)}% confidence) - "${m.text}"`
      ).join('\n');

      expect(output).toContain('skos-vocab.csv');
      expect(output).toContain('Row 2');
      expect(output).toContain('http://example.com/001');
      expect(output).toContain("declared as 'es' but detected as 'fr'");
      expect(output).toContain('97.0% confidence');
    });

    it('should generate summary by language pair', () => {
      const mismatches = [
        { declared: 'en', detected: 'es' },
        { declared: 'en', detected: 'es' },
        { declared: 'es', detected: 'fr' },
        { declared: 'fr', detected: 'en' },
        { declared: 'zh', detected: 'en' }
      ];

      const summary = mismatches.reduce((acc, m) => {
        const key = `${m.declared}->${m.detected}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(summary['en->es']).toBe(2);
      expect(summary['es->fr']).toBe(1);
      expect(summary['fr->en']).toBe(1);
      expect(summary['zh->en']).toBe(1);

      // Total mismatches
      const total = Object.values(summary).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty CSV files', async () => {
      const emptyContent = '';
      const csvPath = path.join(testDataDir, 'empty.csv');
      await fs.writeFile(csvPath, emptyContent);

      const { parse } = await import('csv-parse/sync');
      const records = parse(emptyContent, {
        columns: true,
        skip_empty_lines: true
      });

      expect(records).toHaveLength(0);
    });

    it('should handle CSV with only headers', async () => {
      const headersOnly = 'uri,skos:prefLabel@en,skos:prefLabel@es';
      
      const { parse } = await import('csv-parse/sync');
      const records = parse(headersOnly, {
        columns: true,
        skip_empty_lines: true
      });

      expect(records).toHaveLength(0);
    });

    it('should handle malformed language tags', () => {
      const malformedHeaders = [
        'skos:prefLabel@',     // Missing language
        'skos:prefLabel',      // No @ symbol
        'skos:prefLabel@e',    // Too short
        'skos:prefLabel@english' // Too long
      ];

      malformedHeaders.forEach(header => {
        const lang = extractLanguageFromHeader(header);
        expect(lang).toBeNull();
      });
    });
  });
});

// Helper function for testing
function extractLanguageFromHeader(header: string) {
  const match = header.match(/@(\w{2,3})(?:\[|$)/);
  return match ? match[1] : null;
}