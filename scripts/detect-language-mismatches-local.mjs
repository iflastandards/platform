#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectLanguage as detectLang } from 'langdetect-ts';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language code mapping
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
    const results = detectLang(text);
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

// Process CSV data
function processCSVData(csvData, sourceName) {
  const mismatches = [];
  
  let records;
  try {
    records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      skip_records_with_error: true,
      trim: true
    });
  } catch (parseError) {
    console.error(`Error parsing CSV ${sourceName}: ${parseError.message}`);
    return mismatches;
  }
  
  console.log(`Processing ${records.length} records from ${sourceName}...`);
  
  records.forEach((record, index) => {
    // Check all fields in the record
    Object.entries(record).forEach(([field, value]) => {
      if (!value || typeof value !== 'string') {return;}
      
      // Check if this field might contain multilingual text
      const fieldLower = field.toLowerCase();
      if (fieldLower.includes('label') || 
          fieldLower.includes('definition') || 
          fieldLower.includes('note') ||
          fieldLower.includes('comment') ||
          fieldLower.includes('example')) {
        
        const languageTag = extractLanguageTag(value);
        if (!languageTag) {return;}
        
        const textContent = extractTextContent(value);
        if (!textContent || textContent.length < 10) {return;}
        
        const detected = detectLanguage(textContent);
        if (!detected) {return;}
        
        // Check if declared language matches detected language
        if (languageTag !== detected.iso) {
          mismatches.push({
            source: sourceName,
            row: index + 2, // +1 for header, +1 for 1-based counting
            column: field,
            declaredLanguage: languageTag,
            detectedLanguage: detected.iso,
            detectedLanguageFull: detected.language,
            confidence: detected.confidence,
            text: textContent.substring(0, 100) + (textContent.length > 100 ? '...' : ''),
            fullText: textContent
          });
        }
      }
    });
  });
  
  return mismatches;
}

// Generate report
function generateReport(allMismatches) {
  const timestamp = new Date().toISOString();
  let report = `# Language Mismatch Detection Report (Local CSV Files)\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  if (allMismatches.length === 0) {
    report += `No language mismatches detected.\n`;
    return report;
  }
  
  report += `## Summary\n`;
  report += `Total mismatches found: ${allMismatches.length}\n\n`;
  
  // Group by source
  const bySource = {};
  allMismatches.forEach(mismatch => {
    if (!bySource[mismatch.source]) {
      bySource[mismatch.source] = [];
    }
    bySource[mismatch.source].push(mismatch);
  });
  
  // Generate detailed report
  report += `## Detailed Findings\n\n`;
  
  for (const [sourceName, mismatches] of Object.entries(bySource)) {
    report += `### ${sourceName}\n`;
    report += `Found ${mismatches.length} mismatches\n\n`;
    
    // Sort by confidence (lowest first to highlight potential issues)
    mismatches.sort((a, b) => a.confidence - b.confidence);
    
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
  
  // High confidence mismatches (likely real issues)
  const highConfidenceMismatches = allMismatches.filter(m => m.confidence > 0.9);
  if (highConfidenceMismatches.length > 0) {
    report += `\n## High Confidence Mismatches (>90% confidence)\n\n`;
    report += `These are most likely actual language tagging errors:\n\n`;
    
    highConfidenceMismatches.forEach(mismatch => {
      report += `- **${mismatch.source}** Row ${mismatch.row}, ${mismatch.column}: "${mismatch.fullText}" tagged as @${mismatch.declaredLanguage} but detected as ${mismatch.detectedLanguageFull} (${(mismatch.confidence * 100).toFixed(1)}%)\n`;
    });
  }
  
  return report;
}

// Main function
async function main() {
  console.log('Language Mismatch Detection Tool (Local CSV Files)');
  console.log('=================================================\n');
  
  const allMismatches = [];
  
  // Look for CSV files in the static/data/CSV directory
  const csvDir = path.join(__dirname, '..', 'static', 'data', 'CSV');
  
  try {
    const files = await fs.readdir(csvDir);
    const csvFiles = files.filter(f => f.endsWith('.csv'));
    
    console.log(`Found ${csvFiles.length} CSV files to process\n`);
    
    for (const file of csvFiles) {
      const filePath = path.join(csvDir, file);
      const csvData = await fs.readFile(filePath, 'utf-8');
      const mismatches = processCSVData(csvData, file);
      allMismatches.push(...mismatches);
    }
  } catch (error) {
    console.error(`Error reading CSV directory: ${error.message}`);
    console.log('\nTrying to download CSV files from Google Sheets first...');
    console.log('Please run: yarn compare:vocabs to download the latest CSV files\n');
    process.exit(1);
  }
  
  // Generate and save report
  const report = generateReport(allMismatches);
  const reportPath = path.join(__dirname, '..', 'tmp', 'language-mismatch-report-local.md');
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report);
  
  console.log(`\nReport saved to: ${reportPath}`);
  console.log(`Total mismatches found: ${allMismatches.length}`);
  
  // Also output a JSON version for further processing
  const jsonPath = path.join(__dirname, '..', 'tmp', 'language-mismatches-local.json');
  await fs.writeFile(jsonPath, JSON.stringify(allMismatches, null, 2));
  console.log(`JSON data saved to: ${jsonPath}`);
  
  // Print summary to console
  if (allMismatches.length > 0) {
    console.log('\n--- Quick Summary ---');
    const highConfidence = allMismatches.filter(m => m.confidence > 0.9);
    console.log(`High confidence mismatches: ${highConfidence.length}`);
    
    // Show a few examples
    if (highConfidence.length > 0) {
      console.log('\nExamples of likely errors:');
      highConfidence.slice(0, 3).forEach(m => {
        console.log(`- ${m.source}: "${m.text}" tagged as @${m.declaredLanguage} but is ${m.detectedLanguageFull}`);
      });
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});