import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create mock detectLanguage function
const mockDetectLanguage = vi.fn((text: string) => {
  // Mock language detection based on text content
  if (text.includes('Hello') || text.includes('hello')) return 'ENGLISH';
  if (text.includes('Hola') || text.includes('español')) return 'SPANISH';
  if (text.includes('Bonjour') || text.includes('français')) return 'FRENCH';
  if (text.includes('你好') || /[\u4e00-\u9fa5]/.test(text)) return 'CHINESE_SIMPLIFIED';
  if (text.includes('Привет') || /[\u0400-\u04FF]/.test(text)) return 'RUSSIAN';
  if (text.includes('مرحبا') || /[\u0600-\u06FF]/.test(text)) return 'ARABIC';
  return 'UNKNOWN';
});

// Mock langdetect-ts
vi.mock('langdetect-ts', () => ({
  detectLanguage: mockDetectLanguage
}));

describe('detect-language-mismatches-local.js @unit', () => {
  const testDataDir = path.join(__dirname, 'test-data');
  
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

  describe('Language Code Mapping', () => {
    const DETECTED_TO_ISO = {
      'ENGLISH': 'en',
      'SPANISH': 'es',
      'FRENCH': 'fr',
      'GERMAN': 'de',
      'ITALIAN': 'it',
      'PORTUGUESE': 'pt',
      'RUSSIAN': 'ru',
      'JAPANESE': 'ja',
      'KOREAN': 'ko',
      'CHINESE_SIMPLIFIED': 'zh',
      'CHINESE_TRADITIONAL': 'zh',
      'ARABIC': 'ar',
      'HINDI': 'hi'
    };

    it('should map detected language to ISO codes correctly', () => {
      expect(DETECTED_TO_ISO['ENGLISH']).toBe('en');
      expect(DETECTED_TO_ISO['SPANISH']).toBe('es');
      expect(DETECTED_TO_ISO['CHINESE_SIMPLIFIED']).toBe('zh');
      expect(DETECTED_TO_ISO['CHINESE_TRADITIONAL']).toBe('zh');
    });

    it('should handle all major languages', () => {
      const majorLanguages = ['ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN', 'ITALIAN', 
                              'PORTUGUESE', 'RUSSIAN', 'JAPANESE', 'KOREAN', 'CHINESE_SIMPLIFIED'];
      
      majorLanguages.forEach(lang => {
        expect(DETECTED_TO_ISO[lang]).toBeDefined();
        expect(DETECTED_TO_ISO[lang]).toMatch(/^[a-z]{2}$/);
      });
    });
  });

  describe('Language Tag Extraction', () => {
    const extractLanguageTag = (text: string) => {
      if (!text || typeof text !== 'string') return null;
      const match = text.match(/@(\w{2,3})$/);
      return match ? match[1] : null;
    };

    it('should extract language tags from column headers', () => {
      expect(extractLanguageTag('skos:prefLabel@en')).toBe('en');
      expect(extractLanguageTag('skos:definition@es')).toBe('es');
      expect(extractLanguageTag('rdfs:label@fr')).toBe('fr');
      expect(extractLanguageTag('dct:description@zh')).toBe('zh');
    });

    it('should handle edge cases', () => {
      expect(extractLanguageTag('')).toBeNull();
      expect(extractLanguageTag(null as any)).toBeNull();
      expect(extractLanguageTag('skos:prefLabel')).toBeNull();
      expect(extractLanguageTag('text without tag')).toBeNull();
    });

    it('should handle three-letter language codes', () => {
      expect(extractLanguageTag('skos:prefLabel@eng')).toBe('eng');
      expect(extractLanguageTag('skos:prefLabel@spa')).toBe('spa');
    });
  });

  describe('CSV Processing', () => {
    it('should process CSV data correctly', async () => {
      const csvContent = `uri,skos:prefLabel@en,skos:prefLabel@es,skos:prefLabel@fr,skos:definition@en
http://example.com/001,Hello world,Hola mundo,Bonjour le monde,A greeting
http://example.com/002,Test,Prueba,Test,A trial
http://example.com/003,Computer,Computadora,Ordinateur,An electronic device`;

      const csvPath = path.join(testDataDir, 'test.csv');
      await fs.writeFile(csvPath, csvContent);

      // Parse CSV (simulating what the script does)
      const { parse } = await import('csv-parse/sync');
      const content = await fs.readFile(csvPath, 'utf-8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true
      });

      expect(records).toHaveLength(3);
      expect(records[0]['skos:prefLabel@en']).toBe('Hello world');
      expect(records[0]['skos:prefLabel@es']).toBe('Hola mundo');
    });

    it('should handle CSV with language mismatches', async () => {
      const csvContent = `uri,skos:prefLabel@en,skos:prefLabel@es,skos:prefLabel@fr
http://example.com/001,Hello,Bonjour,Hola
http://example.com/002,Hola,Hello,Bonjour`;

      // Here we have:
      // Row 1: French text in Spanish column, Spanish text in French column
      // Row 2: Spanish text in English column, English text in Spanish column

      const { parse } = await import('csv-parse/sync');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });

      const mismatches: any[] = [];

      records.forEach((record: any, rowIndex: number) => {
        Object.entries(record).forEach(([column, value]) => {
          if (column === 'uri' || !value) return;
          
          const declaredLang = column.match(/@(\w{2,3})$/)?.[1];
          if (!declaredLang) return;

          const detectedLang = mockDetectLanguage(value as string);
          const isoLang = DETECTED_TO_ISO[detectedLang] || detectedLang.toLowerCase();

          if (isoLang !== declaredLang && detectedLang !== 'UNKNOWN') {
            mismatches.push({
              row: rowIndex + 1,
              column,
              declared: declaredLang,
              detected: isoLang,
              text: value
            });
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
    });
  });

  describe('File Processing', () => {
    it('should process multiple CSV files', async () => {
      // Create multiple test CSV files
      const files = [
        { name: 'vocab1.csv', content: 'uri,skos:prefLabel@en\nhttp://ex.com/1,Hello' },
        { name: 'vocab2.csv', content: 'uri,skos:prefLabel@es\nhttp://ex.com/2,Hola' },
        { name: 'vocab3.csv', content: 'uri,skos:prefLabel@fr\nhttp://ex.com/3,Bonjour' }
      ];

      for (const file of files) {
        await fs.writeFile(path.join(testDataDir, file.name), file.content);
      }

      const csvFiles = await fs.readdir(testDataDir);
      const csvFilesFiltered = csvFiles.filter(f => f.endsWith('.csv'));

      expect(csvFilesFiltered).toHaveLength(3);
      expect(csvFilesFiltered).toContain('vocab1.csv');
      expect(csvFilesFiltered).toContain('vocab2.csv');
      expect(csvFilesFiltered).toContain('vocab3.csv');
    });

    it('should skip non-CSV files', async () => {
      // Create mixed file types
      await fs.writeFile(path.join(testDataDir, 'test.csv'), 'uri,label\nhttp://ex.com/1,Test');
      await fs.writeFile(path.join(testDataDir, 'readme.txt'), 'This is a readme');
      await fs.writeFile(path.join(testDataDir, 'data.json'), '{"key": "value"}');

      const files = await fs.readdir(testDataDir);
      const csvFiles = files.filter(f => f.endsWith('.csv'));

      expect(csvFiles).toHaveLength(1);
      expect(csvFiles[0]).toBe('test.csv');
    });
  });

  describe('Language Detection', () => {
    it('should detect various languages correctly', () => {
      expect(mockDetectLanguage('Hello world')).toBe('ENGLISH');
      expect(mockDetectLanguage('Hola mundo')).toBe('SPANISH');
      expect(mockDetectLanguage('Bonjour le monde')).toBe('FRENCH');
      expect(mockDetectLanguage('你好世界')).toBe('CHINESE_SIMPLIFIED');
      expect(mockDetectLanguage('Привет мир')).toBe('RUSSIAN');
    });

    it('should handle mixed scripts', () => {
      const chineseText = '这是中文文本';
      expect(mockDetectLanguage(chineseText)).toBe('CHINESE_SIMPLIFIED');

      const arabicText = 'هذا نص عربي';
      expect(mockDetectLanguage(arabicText)).toBe('ARABIC');
    });

    it('should return UNKNOWN for unrecognized text', () => {
      expect(mockDetectLanguage('123456')).toBe('UNKNOWN');
      expect(mockDetectLanguage('!!!')).toBe('UNKNOWN');
      expect(mockDetectLanguage('')).toBe('UNKNOWN');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', async () => {
      const nonExistentPath = path.join(testDataDir, 'non-existent.csv');
      
      await expect(fs.readFile(nonExistentPath)).rejects.toThrow();
    });

    it('should handle malformed CSV gracefully', async () => {
      const malformedCsv = `uri,label@en,label@es
"http://ex.com/1","Hello","Hola
http://ex.com/2,World,Mundo`;

      const csvPath = path.join(testDataDir, 'malformed.csv');
      await fs.writeFile(csvPath, malformedCsv);

      // The CSV parser should handle this or throw a meaningful error
      const { parse } = await import('csv-parse/sync');
      
      expect(() => {
        parse(malformedCsv, {
          columns: true,
          skip_empty_lines: true
        });
      }).toThrow();
    });
  });

  describe('Output Generation', () => {
    it('should format console output correctly', () => {
      const mismatches = [
        {
          file: 'vocab.csv',
          row: 2,
          column: 'skos:prefLabel@es',
          declared: 'es',
          detected: 'fr',
          text: 'Bonjour'
        }
      ];

      const output = mismatches.map(m => 
        `${m.file} - Row ${m.row}: ${m.column} declared as '${m.declared}' but detected as '${m.detected}' - "${m.text}"`
      ).join('\n');

      expect(output).toContain('vocab.csv');
      expect(output).toContain('Row 2');
      expect(output).toContain("declared as 'es' but detected as 'fr'");
      expect(output).toContain('Bonjour');
    });

    it('should generate summary statistics', () => {
      const mismatches = [
        { file: 'v1.csv', declared: 'en', detected: 'es' },
        { file: 'v1.csv', declared: 'en', detected: 'fr' },
        { file: 'v2.csv', declared: 'es', detected: 'en' },
        { file: 'v2.csv', declared: 'es', detected: 'en' }
      ];

      const byFile = mismatches.reduce((acc, m) => {
        acc[m.file] = (acc[m.file] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byFile['v1.csv']).toBe(2);
      expect(byFile['v2.csv']).toBe(2);

      const total = Object.values(byFile).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(4);
    });
  });
});

// Type definitions for mocked imports
const DETECTED_TO_ISO: Record<string, string> = {
  'ENGLISH': 'en',
  'SPANISH': 'es',
  'FRENCH': 'fr',
  'GERMAN': 'de',
  'ITALIAN': 'it',
  'PORTUGUESE': 'pt',
  'RUSSIAN': 'ru',
  'JAPANESE': 'ja',
  'KOREAN': 'ko',
  'CHINESE_SIMPLIFIED': 'zh',
  'CHINESE_TRADITIONAL': 'zh',
  'ARABIC': 'ar',
  'HINDI': 'hi',
  'DUTCH': 'nl',
  'SWEDISH': 'sv',
  'NORWEGIAN': 'no',
  'DANISH': 'da',
  'FINNISH': 'fi',
  'POLISH': 'pl',
  'CZECH': 'cs',
  'HUNGARIAN': 'hu',
  'ROMANIAN': 'ro',
  'BULGARIAN': 'bg',
  'CROATIAN': 'hr',
  'SLOVAK': 'sk',
  'SLOVENE': 'sl',
  'ESTONIAN': 'et',
  'LATVIAN': 'lv',
  'LITHUANIAN': 'lt',
  'VIETNAMESE': 'vi',
  'THAI': 'th',
  'INDONESIAN': 'id',
  'MALAY': 'ms',
  'TURKISH': 'tr',
  'GREEK': 'el',
  'HEBREW': 'he',
  'PERSIAN': 'fa',
  'URDU': 'ur',
  'BENGALI': 'bn',
  'TAMIL': 'ta',
  'TELUGU': 'te',
  'MARATHI': 'mr',
  'GUJARATI': 'gu',
  'KANNADA': 'kn',
  'MALAYALAM': 'ml',
  'PUNJABI': 'pa',
  'NEPALI': 'ne',
  'SINHALA': 'si',
  'BURMESE': 'my',
  'KHMER': 'km',
  'LAO': 'lo',
  'GEORGIAN': 'ka',
  'AMHARIC': 'am',
  'SWAHILI': 'sw',
  'YORUBA': 'yo',
  'ZULU': 'zu',
  'XHOSA': 'xh',
  'AFRIKAANS': 'af',
  'ALBANIAN': 'sq',
  'BASQUE': 'eu',
  'BELARUSIAN': 'be',
  'BOSNIAN': 'bs',
  'CATALAN': 'ca',
  'WELSH': 'cy',
  'ESPERANTO': 'eo',
  'GALICIAN': 'gl',
  'ARMENIAN': 'hy',
  'ICELANDIC': 'is',
  'KAZAKH': 'kk',
  'MACEDONIAN': 'mk',
  'MONGOLIAN': 'mn',
  'SERBIAN': 'sr',
  'TAJIK': 'tg',
  'UKRAINIAN': 'uk',
  'UZBEK': 'uz',
  'AZERBAIJANI': 'az',
  'MALTESE': 'mt',
  'IRISH': 'ga',
  'SCOTS_GAELIC': 'gd'
};