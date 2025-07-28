#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'node:url';

interface ProfileProperty {
  propertyID: string;
  propertyLabel: string;
  mandatory: string;
  repeatable: string;
  valueDataType?: string;
  note?: string;
}

interface LanguageReport {
  file: string;
  totalRows: number;
  vocabularyType: 'elements' | 'concepts' | 'unknown';
  missingData: {
    [attribute: string]: {
      [language: string]: number;
    };
  };
  errors: string[];
}

interface SummaryStats {
  totalFiles: number;
  totalErrors: number;
  fileReports: LanguageReport[];
}

// Expected languages based on the CSV structure
const EXPECTED_LANGUAGES = ['bg', 'en', 'es', 'fr', 'it', 'lv', 'ru', 'zh', 'hr'];

// Profile paths
const ELEMENT_PROFILE_PATH = path.join(process.cwd(), 'static/data/DCTAP/element_langmap_profile.csv');
const CONCEPT_PROFILE_PATH = path.join(process.cwd(), 'static/data/DCTAP/concepts_langmap_profile.csv');

function loadProfile(profilePath: string): Map<string, ProfileProperty> {
  const profileMap = new Map<string, ProfileProperty>();
  
  try {
    const fileContent = fs.readFileSync(profilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    (records as ProfileProperty[]).forEach((record: ProfileProperty) => {
      if (record.propertyID) {
        profileMap.set(record.propertyID, record);
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not load profile from ${profilePath}: ${error}`);
  }
  
  return profileMap;
}

function determineVocabularyType(records: any[]): 'elements' | 'concepts' | 'unknown' {
  // Check the rdf:type values in the records
  for (const record of records) {
    if (record['rdf:type']) {
      if (record['rdf:type'].includes('Property') || record['rdf:type'].includes('Class')) {
        return 'elements';
      }
      if (record['rdf:type'].includes('Concept') || record['rdf:type'].includes('ConceptScheme')) {
        return 'concepts';
      }
    }
  }
  
  // Check file path as fallback
  if (records.length > 0 && records[0].uri) {
    const uri = records[0].uri;
    if (uri.includes('/elements/') || uri.includes(':elements/')) {
      return 'elements';
    }
    if (uri.includes('/terms/') || uri.includes('sensoryspecfication') || 
        uri.includes('contentform') || uri.includes('mediatype')) {
      return 'concepts';
    }
  }
  
  return 'unknown';
}

function getLanguagePropertiesFromProfile(profile: Map<string, ProfileProperty>): Set<string> {
  const languageProperties = new Set<string>();
  
  profile.forEach((prop, propId) => {
    // Check if it's a language-tagged property
    if (prop.valueDataType === 'rdf:langString' || 
        prop.note?.toLowerCase().includes('language') ||
        propId.includes('Label') || 
        propId.includes('definition') ||
        propId.includes('note') ||
        propId.includes('comment')) {
      languageProperties.add(propId);
    }
  });
  
  return languageProperties;
}

function getMandatoryPropertiesFromProfile(profile: Map<string, ProfileProperty>): Set<string> {
  const mandatoryProperties = new Set<string>();
  
  profile.forEach((prop, propId) => {
    if (prop.mandatory === 'true') {
      mandatoryProperties.add(propId);
    }
  });
  
  return mandatoryProperties;
}

function findLanguageColumns(headers: string[], languageProperties: Set<string>): Map<string, Set<string>> {
  const attributeLanguages = new Map<string, Set<string>>();
  
  headers.forEach(header => {
    languageProperties.forEach(prop => {
      if (header.startsWith(prop)) {
        const match = header.match(new RegExp(`^${prop}@([a-z]{2})$`));
        if (match) {
          if (!attributeLanguages.has(prop)) {
            attributeLanguages.set(prop, new Set());
          }
          attributeLanguages.get(prop)!.add(match[1]);
        }
      }
    });
  });
  
  return attributeLanguages;
}

function analyzeCSVFile(filePath: string): LanguageReport {
  const report: LanguageReport = {
    file: path.relative(process.cwd(), filePath),
    totalRows: 0,
    vocabularyType: 'unknown',
    missingData: {},
    errors: []
  };

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    });

    if (records.length === 0) {
      report.errors.push('No data rows found');
      return report;
    }

    // Determine vocabulary type
    report.vocabularyType = determineVocabularyType(records);
    
    // Load appropriate profile
    const profile = report.vocabularyType === 'elements' 
      ? loadProfile(ELEMENT_PROFILE_PATH)
      : loadProfile(CONCEPT_PROFILE_PATH);
    
    const languageProperties = getLanguagePropertiesFromProfile(profile);
    const mandatoryProperties = getMandatoryPropertiesFromProfile(profile);
    
    const headers = Object.keys(records[0] as Record<string, unknown>);
    const attributeLanguages = findLanguageColumns(headers, languageProperties);

    // Check for mandatory language properties
    mandatoryProperties.forEach(prop => {
      if (languageProperties.has(prop) && !attributeLanguages.has(prop)) {
        report.errors.push(`ERROR: No ${prop} columns found in the file (mandatory property)`);
      }
    });

    // Initialize missing data structure
    attributeLanguages.forEach((languages, attribute) => {
      report.missingData[attribute] = {};
      EXPECTED_LANGUAGES.forEach(lang => {
        if (!languages.has(lang)) {
          report.missingData[attribute][lang] = -1; // -1 indicates column doesn't exist
        } else {
          report.missingData[attribute][lang] = 0;
        }
      });
    });

    // Analyze each row
    (records as { [key: string]: string }[]).forEach((row: { [key: string]: string }, index : number  ) => {
      // Skip ConceptScheme rows and metadata rows
      if (row['rdf:type'] === 'skos:ConceptScheme' || 
          row['uri'] === 'metadataregistry.org:uri/RegStatus/1001' ||
          row['uri']?.includes('RegStatus')) {
        return;
      }

      report.totalRows++;

      attributeLanguages.forEach((languages, attribute) => {
        languages.forEach(lang => {
          const columnName = `${attribute}@${lang}`;
          if (!row[columnName] || row[columnName].trim() === '') {
            report.missingData[attribute][lang]++;
            
            // Special error for missing mandatory properties
            if (mandatoryProperties.has(attribute)) {
              report.errors.push(
                `ERROR: Missing ${columnName} for ${report.vocabularyType === 'elements' ? 'element' : 'concept'}: ${row['uri'] || `row ${index + 2}`}`
              );
            }
          }
        });
      });
    });

  } catch (error) {
    report.errors.push(`Failed to process file: ${error}`);
  }

  return report;
}

function generateReport(vocabsPath: string): SummaryStats {
  const summary: SummaryStats = {
    totalFiles: 0,
    totalErrors: 0,
    fileReports: []
  };

  function processDirectory(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.name.endsWith('.csv')) {
        summary.totalFiles++;
        const report = analyzeCSVFile(fullPath);
        summary.fileReports.push(report);
        summary.totalErrors += report.errors.length;
      }
    });
  }

  processDirectory(vocabsPath);
  return summary;
}

function printReport(summary: SummaryStats) {
  console.log('=== ISBD CSV Language Coverage Report ===\n');
  console.log(`Total files analyzed: ${summary.totalFiles}`);
  console.log(`Total errors found: ${summary.totalErrors}\n`);

  summary.fileReports.forEach(report => {
    console.log(`\nFile: ${report.file}`);
    console.log(`Vocabulary type: ${report.vocabularyType}`);
    console.log(`Total rows: ${report.totalRows}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      report.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (Object.keys(report.missingData).length > 0) {
      console.log('\nMissing translations by attribute:');
      Object.entries(report.missingData).forEach(([attribute, languages]) => {
        console.log(`\n  ${attribute}:`);
        Object.entries(languages).forEach(([lang, count]) => {
          if (count === -1) {
            console.log(`    ${lang}: COLUMN MISSING`);
          } else if (count > 0) {
            const percentage = report.totalRows > 0 
              ? ((count / report.totalRows) * 100).toFixed(1)
              : '0.0';
            console.log(`    ${lang}: ${count} missing (${percentage}%)`);
          }
        });
      });
    }
    
    console.log('\n' + '─'.repeat(60));
  });

  // Summary statistics
  console.log('\n=== SUMMARY ===');
  const attributeSummary: { [key: string]: { [key: string]: number } } = {};
  
  summary.fileReports.forEach(report => {
    Object.entries(report.missingData).forEach(([attr, langs]) => {
      if (!attributeSummary[attr]) {
        attributeSummary[attr] = {};
        EXPECTED_LANGUAGES.forEach(lang => {
          attributeSummary[attr][lang] = 0;
        });
      }
      Object.entries(langs).forEach(([lang, count]) => {
        if (count > 0) {
          attributeSummary[attr][lang] += count;
        }
      });
    });
  });

  console.log('\nTotal missing translations across all files:');
  Object.entries(attributeSummary).forEach(([attr, langs]) => {
    const total = Object.values(langs).reduce((sum, count) => sum + count, 0);
    if (total > 0) {
      console.log(`\n${attr}:`);
      Object.entries(langs)
        .filter(([_, count]) => count > 0)
        .sort(([_, a], [__, b]) => b - a)
        .forEach(([lang, count]) => {
          console.log(`  ${lang}: ${count} missing`);
        });
    }
  });
}

function generateMarkdownReport(summary: SummaryStats) {
  const date = new Date().toISOString().split('T')[0];
  let markdown = `# ISBD CSV Language Coverage Report\n\n`;
  markdown += `**Generated:** ${date}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total files analyzed:** ${summary.totalFiles}\n`;
  markdown += `- **Total errors found:** ${summary.totalErrors}\n\n`;
  
  // Group files by vocabulary type
  const elementFiles = summary.fileReports.filter(r => r.vocabularyType === 'elements');
  const conceptFiles = summary.fileReports.filter(r => r.vocabularyType === 'concepts');
  const unknownFiles = summary.fileReports.filter(r => r.vocabularyType === 'unknown');
  
  markdown += `### Files by Type\n\n`;
  markdown += `- **Element vocabularies:** ${elementFiles.length}\n`;
  markdown += `- **Concept vocabularies:** ${conceptFiles.length}\n`;
  if (unknownFiles.length > 0) {
    markdown += `- **Unknown type:** ${unknownFiles.length}\n`;
  }
  markdown += '\n';
  
  if (summary.totalErrors > 0) {
    markdown += `## ⚠️ Critical Issues\n\n`;
    markdown += `### Missing Mandatory Properties\n\n`;
    
    summary.fileReports.forEach(report => {
      const mandatoryErrors = report.errors.filter(e => e.includes('mandatory'));
      if (mandatoryErrors.length > 0) {
        markdown += `#### ${report.file} (${report.vocabularyType})\n\n`;
        mandatoryErrors.forEach(error => {
          markdown += `- ${error}\n`;
        });
        markdown += '\n';
      }
    });
  }
  
  markdown += `## Detailed Analysis by File\n\n`;
  
  ['elements', 'concepts', 'unknown'].forEach(vocabType => {
    const files = summary.fileReports.filter(r => r.vocabularyType === vocabType);
    if (files.length > 0) {
      markdown += `### ${vocabType.charAt(0).toUpperCase() + vocabType.slice(1)} Vocabularies\n\n`;
      
      files.forEach(report => {
        markdown += `#### ${report.file}\n\n`;
        markdown += `- **Total rows:** ${report.totalRows}\n`;
        markdown += `- **Errors:** ${report.errors.length}\n\n`;
        
        if (Object.keys(report.missingData).length > 0) {
          markdown += `| Attribute | Language | Missing | Percentage |\n`;
          markdown += `|-----------|----------|---------|------------|\n`;
          
          Object.entries(report.missingData).forEach(([attribute, languages]) => {
            Object.entries(languages).forEach(([lang, count]) => {
              if (count === -1) {
                markdown += `| ${attribute} | ${lang} | COLUMN MISSING | - |\n`;
              } else if (count > 0) {
                const percentage = report.totalRows > 0 
                  ? ((count / report.totalRows) * 100).toFixed(1)
                  : '0.0';
                markdown += `| ${attribute} | ${lang} | ${count} | ${percentage}% |\n`;
              }
            });
          });
          markdown += '\n';
        }
      });
    }
  });
  
  // Language-specific summary
  markdown += `## Missing Translations by Language\n\n`;
  const languageSummary: { [lang: string]: number } = {};
  EXPECTED_LANGUAGES.forEach(lang => languageSummary[lang] = 0);
  
  summary.fileReports.forEach(report => {
    Object.entries(report.missingData).forEach(([_, languages]) => {
      Object.entries(languages).forEach(([lang, count]) => {
        if (count > 0) {
          languageSummary[lang] += count;
        }
      });
    });
  });
  
  markdown += `| Language | Total Missing | Priority |\n`;
  markdown += `|----------|---------------|----------|\n`;
  Object.entries(languageSummary)
    .sort(([_, a], [__, b]) => b - a)
    .forEach(([lang, count]) => {
      const priority = count > 100 ? '🔴 High' : count > 50 ? '🟡 Medium' : '🟢 Low';
      markdown += `| ${lang} | ${count} | ${priority} |\n`;
    });
  
  const mdPath = path.join(process.cwd(), 'tmp/language-coverage-report.md');
  fs.writeFileSync(mdPath, markdown);
  console.log(`\nMarkdown report saved to: ${mdPath}`);
}

// Main execution block
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const vocabsPath = process.argv[2] || path.join(process.cwd(), 'static/vocabs/csv');

  if (!fs.existsSync(vocabsPath)) {
    console.error(`Error: Path "${vocabsPath}" does not exist`);
    process.exit(1);
  }

  const summary = generateReport(vocabsPath);
  printReport(summary);

  // Write detailed report to file
  const reportPath = path.join(process.cwd(), 'tmp/language-coverage-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);

  // Generate markdown report
  generateMarkdownReport(summary);

  // Exit with error code if errors were found
  if (summary.totalErrors > 0) {
    process.exit(1);
  }
}

export { analyzeCSVFile, generateReport };
