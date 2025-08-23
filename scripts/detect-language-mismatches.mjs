#!/usr/bin/env node

import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import langdetect from 'langdetect';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service account configuration
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join(__dirname, '..', 'tmp', 'service-account-key.json');
const {GSHEETS_SA_KEY} = process.env;

// Concept scheme spreadsheets configuration
const SPREADSHEETS = [
  {
    name: 'Sensory Specification',
    spreadsheetId: '1LYfCSaQD9fUdchSHZjJ1f_n1PxiSJrfMeBBTNrKQMKQ',
    ranges: ['sensory specification vocabulary!A:Z']
  },
  {
    name: 'Polarity',
    spreadsheetId: '15xh5124c4j42Jn_DdhcZcjxnJZSTS2HV5spLflHGsko',
    ranges: ['Sheet1!A:Z']
  },
  {
    name: 'Unit of Measurement',
    spreadsheetId: '1MVaMOHOilfLU00JPMsDDKJhJ7Dxg4Pr7LzVrlQ4hwao',
    ranges: ['Sheet1!A:Z']
  },
  {
    name: 'ISBD Terms',
    spreadsheetId: '1bJ7UQPyU8R7Usj1rJ1suuxDBLFMJ-uqZELW9MdRAric',
    ranges: ['Sheet1!A:Z']
  }
];

// Language code mapping
const LANGUAGE_CODES = {
  'en': 'english',
  'es': 'spanish',
  'fr': 'french',
  'de': 'german',
  'it': 'italian',
  'pt': 'portuguese',
  'ru': 'russian',
  'ja': 'japanese',
  'ko': 'korean',
  'zh': 'chinese',
  'ar': 'arabic',
  'hi': 'hindi',
  'nl': 'dutch',
  'sv': 'swedish',
  'no': 'norwegian',
  'da': 'danish',
  'fi': 'finnish',
  'pl': 'polish',
  'cs': 'czech',
  'hu': 'hungarian',
  'ro': 'romanian',
  'bg': 'bulgarian',
  'hr': 'croatian',
  'sk': 'slovak',
  'sl': 'slovene',
  'et': 'estonian',
  'lv': 'latvian',
  'lt': 'lithuanian',
  'vi': 'vietnamese',
  'th': 'thai',
  'id': 'indonesian',
  'ms': 'malay',
  'tr': 'turkish',
  'el': 'greek',
  'he': 'hebrew',
  'fa': 'persian',
  'ur': 'urdu',
  'bn': 'bengali',
  'ta': 'tamil',
  'te': 'telugu',
  'mr': 'marathi',
  'gu': 'gujarati',
  'kn': 'kannada',
  'ml': 'malayalam',
  'pa': 'punjabi',
  'ne': 'nepali',
  'si': 'sinhala',
  'my': 'burmese',
  'km': 'khmer',
  'lo': 'lao',
  'ka': 'georgian',
  'am': 'amharic',
  'sw': 'swahili',
  'yo': 'yoruba',
  'zu': 'zulu',
  'xh': 'xhosa',
  'af': 'afrikaans',
  'sq': 'albanian',
  'eu': 'basque',
  'be': 'belarusian',
  'bs': 'bosnian',
  'ca': 'catalan',
  'cy': 'welsh',
  'eo': 'esperanto',
  'gl': 'galician',
  'hy': 'armenian',
  'is': 'icelandic',
  'kk': 'kazakh',
  'mk': 'macedonian',
  'mn': 'mongolian',
  'sr': 'serbian',
  'tg': 'tajik',
  'uk': 'ukrainian',
  'uz': 'uzbek',
  'az': 'azerbaijani',
  'mt': 'maltese',
  'ga': 'irish',
  'gd': 'scottish gaelic'
};

// Map detected language to ISO code
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

// Extract language tag from text
function extractLanguageTag(text) {
  if (!text || typeof text !== 'string') {return null;}
  
  const match = text.match(/@(\w{2,3})$/);
  return match ? match[1] : null;
}

// Extract text without language tag
function extractTextContent(text) {
  if (!text || typeof text !== 'string') {return '';}
  
  return text.replace(/@\w{2,3}$/, '').trim();
}

// Detect language of text
function detectLanguage(text) {
  if (!text || text.length < 10) {return null;}
  
  try {
    const results = langdetect.detect(text);
    if (results && results.length > 0) {
      const topResult = results[0];
      return {
        language: topResult.lang,
        confidence: topResult.prob,
        iso: DETECTED_TO_ISO[topResult.lang] || topResult.lang.toLowerCase()
      };
    }
  } catch (error) {
    // Language detection failed
    return null;
  }
  
  return null;
}

// Check a single cell for language mismatch
function checkCell(cellValue, sheetName, row, column, header) {
  const languageTag = extractLanguageTag(cellValue);
  if (!languageTag) {return null;}
  
  const textContent = extractTextContent(cellValue);
  if (!textContent || textContent.length < 10) {return null;}
  
  const detected = detectLanguage(textContent);
  if (!detected) {return null;}
  
  // Check if declared language matches detected language
  if (languageTag !== detected.iso) {
    return {
      sheet: sheetName,
      row: row + 1, // Convert to 1-based row number
      column: header,
      declaredLanguage: languageTag,
      detectedLanguage: detected.iso,
      detectedLanguageFull: detected.language,
      confidence: detected.confidence,
      text: textContent.substring(0, 100) + (textContent.length > 100 ? '...' : '')
    };
  }
  
  return null;
}

// Process a single spreadsheet
async function processSpreadsheet(config, sheets) {
  console.log(`\nProcessing ${config.name}...`);
  const mismatches = [];
  
  try {
    for (const range of config.ranges) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: range
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log(`No data found in ${range}`);
        continue;
      }
      
      // Get headers
      const headers = rows[0];
      
      // Find columns that contain multilingual text
      const textColumns = [];
      headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('preflabel') || 
            lowerHeader.includes('altlabel') || 
            lowerHeader.includes('definition') || 
            lowerHeader.includes('scopenote') ||
            lowerHeader.includes('example') ||
            lowerHeader.includes('note') ||
            lowerHeader.includes('comment')) {
          textColumns.push({ index, name: header });
        }
      });
      
      console.log(`Found ${textColumns.length} text columns to check`);
      
      // Process each row
      for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        
        for (const column of textColumns) {
          const cellValue = row[column.index];
          if (cellValue) {
            const mismatch = checkCell(cellValue, config.name, rowIndex, column.index, column.name);
            if (mismatch) {
              mismatches.push(mismatch);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${config.name}:`, error.message);
  }
  
  return mismatches;
}

// Generate report
function generateReport(allMismatches) {
  const timestamp = new Date().toISOString();
  let report = `# Language Mismatch Detection Report\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  if (allMismatches.length === 0) {
    report += `No language mismatches detected.\n`;
    return report;
  }
  
  report += `## Summary\n`;
  report += `Total mismatches found: ${allMismatches.length}\n\n`;
  
  // Group by sheet
  const bySheet = {};
  allMismatches.forEach(mismatch => {
    if (!bySheet[mismatch.sheet]) {
      bySheet[mismatch.sheet] = [];
    }
    bySheet[mismatch.sheet].push(mismatch);
  });
  
  // Generate detailed report
  report += `## Detailed Findings\n\n`;
  
  for (const [sheetName, mismatches] of Object.entries(bySheet)) {
    report += `### ${sheetName}\n`;
    report += `Found ${mismatches.length} mismatches\n\n`;
    
    report += `| Row | Column | Declared | Detected | Confidence | Text Sample |\n`;
    report += `|-----|--------|----------|----------|------------|-------------|\n`;
    
    mismatches.forEach(mismatch => {
      report += `| ${mismatch.row} | ${mismatch.column} | ${mismatch.declaredLanguage} | ${mismatch.detectedLanguage} (${mismatch.detectedLanguageFull}) | ${(mismatch.confidence * 100).toFixed(1)}% | ${mismatch.text} |\n`;
    });
    
    report += `\n`;
  }
  
  // Language summary
  report += `## Language Summary\n\n`;
  const languagePairs = {};
  allMismatches.forEach(mismatch => {
    const pair = `${mismatch.declaredLanguage} → ${mismatch.detectedLanguage}`;
    languagePairs[pair] = (languagePairs[pair] || 0) + 1;
  });
  
  report += `| Declared → Detected | Count |\n`;
  report += `|---------------------|-------|\n`;
  
  Object.entries(languagePairs)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pair, count]) => {
      report += `| ${pair} | ${count} |\n`;
    });
  
  return report;
}

// Initialize Google Sheets API
async function initializeSheets() {
  let auth;
  
  // Try environment variable first (base64 encoded key)
  if (GSHEETS_SA_KEY) {
    try {
      const credentials = JSON.parse(Buffer.from(GSHEETS_SA_KEY, 'base64').toString('utf8'));
      auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
    } catch (error) {
      console.error('Failed to parse GSHEETS_SA_KEY:', error.message);
    }
  }
  
  // Try service account file
  if (!auth) {
    try {
      await fs.access(SERVICE_ACCOUNT_PATH);
      auth = new GoogleAuth({
        keyFile: SERVICE_ACCOUNT_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
    } catch (error) {
      // Fallback to default credentials
      auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
    }
  }
  
  return google.sheets({ version: 'v4', auth });
}

// Main function
async function main() {
  const sheets = await initializeSheets();
  console.log('Language Mismatch Detection Tool');
  console.log('================================\n');
  
  const allMismatches = [];
  
  for (const spreadsheet of SPREADSHEETS) {
    const mismatches = await processSpreadsheet(spreadsheet, sheets);
    allMismatches.push(...mismatches);
  }
  
  // Generate and save report
  const report = generateReport(allMismatches);
  const reportPath = path.join(__dirname, '..', 'tmp', 'language-mismatch-report.md');
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report);
  
  console.log(`\n\nReport saved to: ${reportPath}`);
  console.log(`Total mismatches found: ${allMismatches.length}`);
  
  // Also output a JSON version for further processing
  const jsonPath = path.join(__dirname, '..', 'tmp', 'language-mismatches.json');
  await fs.writeFile(jsonPath, JSON.stringify(allMismatches, null, 2));
  console.log(`JSON data saved to: ${jsonPath}`);
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});