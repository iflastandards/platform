#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import langdetect from 'langdetect';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language code mapping
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

// Extract language code from column header
function extractLanguageFromHeader(header) {
  const match = header.match(/@(\w{2,3})(?:\[|$)/);
  return match ? match[1] : null;
}

// Detect language of text
function detectLanguage(text) {
  if (!text || text.length < 10) {return null;}
  
  try {
    const results = langdetect.detect(text);
    if (results && results.length > 0) {
      const topResult = results[0];
      const mappedLang = DETECTED_TO_ISO[topResult.lang] || topResult.lang.split('-')[0];
      return {
        language: topResult.lang,
        confidence: topResult.prob,
        iso: mappedLang
      };
    }
  } catch (error) {
    // Language detection failed
    return null;
  }
  
  return null;
}

// Process SKOS CSV data
function processSkosCSVData(csvData, sourceName) {
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
  
  // Get all columns that have language tags
  const headers = Object.keys(records[0] || {});
  const languageColumns = [];
  
  headers.forEach(header => {
    const lang = extractLanguageFromHeader(header);
    if (lang) {
      languageColumns.push({ header, language: lang });
    }
  });
  
  console.log(`Found ${languageColumns.length} language-tagged columns`);
  if (languageColumns.length > 0 && sourceName.includes('test')) {
    console.log('Language columns:', languageColumns.map(c => c.header).join(', '));
  }
  
  // Process each record
  records.forEach((record, index) => {
    // Get the URI for reference
    const uri = record.uri || record.URI || `Row ${index + 2}`;
    
    // Check each language-tagged column
    languageColumns.forEach(col => {
      const value = record[col.header];
      if (!value || value.length < 10) {return;}
      
      const detected = detectLanguage(value);
      if (!detected) {
        console.log(`Could not detect language for: "${value.substring(0, 50)}..."`);
        return;
      }
      
      // Check if declared language matches detected language
      if (sourceName.includes('test') && index === 0) {
        console.log(`Checking ${col.header}: declared=${col.language}, detected=${detected.iso}, confidence=${detected.confidence.toFixed(2)}`);
      }
      if (col.language !== detected.iso) {
        mismatches.push({
          source: sourceName,
          uri: uri,
          row: index + 2, // +1 for header, +1 for 1-based counting
          column: col.header,
          declaredLanguage: col.language,
          detectedLanguage: detected.iso,
          detectedLanguageFull: detected.language,
          confidence: detected.confidence,
          text: value.substring(0, 100) + (value.length > 100 ? '...' : ''),
          fullText: value
        });
      }
    });
  });
  
  return mismatches;
}

// Generate report
function generateReport(allMismatches) {
  const timestamp = new Date().toISOString();
  let report = `# Language Mismatch Detection Report (SKOS CSV Format)\n`;
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
    mismatches.sort((a, b) => b.confidence - a.confidence);
    
    report += `| URI | Row | Column | Declared | Detected | Confidence | Text Sample |\n`;
    report += `|-----|-----|--------|----------|----------|------------|-------------|\n`;
    
    mismatches.forEach(mismatch => {
      const shortUri = mismatch.uri.split('/').pop() || mismatch.uri;
      report += `| ${shortUri} | ${mismatch.row} | ${mismatch.column} | ${mismatch.declaredLanguage} | ${mismatch.detectedLanguage} (${mismatch.detectedLanguageFull}) | ${(mismatch.confidence * 100).toFixed(1)}% | ${mismatch.text} |\n`;
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
      const shortUri = mismatch.uri.split('/').pop() || mismatch.uri;
      report += `- **${mismatch.source}** ${shortUri} (Row ${mismatch.row}), ${mismatch.column}: "${mismatch.fullText}" tagged as @${mismatch.declaredLanguage} but detected as ${mismatch.detectedLanguageFull} (${(mismatch.confidence * 100).toFixed(1)}%)\n`;
    });
  }
  
  // Look for specific patterns like Chinese text marked as English
  const chineseAsEnglish = allMismatches.filter(m => 
    m.declaredLanguage === 'en' && m.detectedLanguage === 'zh' && m.confidence > 0.8
  );
  
  if (chineseAsEnglish.length > 0) {
    report += `\n## Chinese Text Marked as English\n\n`;
    report += `Found ${chineseAsEnglish.length} cases of Chinese text marked as English:\n\n`;
    
    chineseAsEnglish.forEach(mismatch => {
      const shortUri = mismatch.uri.split('/').pop() || mismatch.uri;
      report += `- **${mismatch.source}** ${shortUri} (Row ${mismatch.row}), ${mismatch.column}: "${mismatch.fullText}"\n`;
    });
  }
  
  return report;
}

// Main function
async function main() {
  console.log('Language Mismatch Detection Tool (SKOS CSV Format)');
  console.log('==================================================\n');
  
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
      const mismatches = processSkosCSVData(csvData, file);
      allMismatches.push(...mismatches);
    }
  } catch (error) {
    console.error(`Error reading CSV directory: ${error.message}`);
    console.log('\nPlease ensure CSV files are available in static/data/CSV/\n');
    process.exit(1);
  }
  
  // Generate and save report
  const report = generateReport(allMismatches);
  const reportPath = path.join(__dirname, '..', 'tmp', 'language-mismatch-report-skos.md');
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report);
  
  console.log(`\nReport saved to: ${reportPath}`);
  console.log(`Total mismatches found: ${allMismatches.length}`);
  
  // Also output a JSON version for further processing
  const jsonPath = path.join(__dirname, '..', 'tmp', 'language-mismatches-skos.json');
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
      highConfidence.slice(0, 5).forEach(m => {
        const shortUri = m.uri.split('/').pop() || m.uri;
        console.log(`- ${m.source} ${shortUri}: "${m.text}" tagged as @${m.declaredLanguage} but is ${m.detectedLanguageFull}`);
      });
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});