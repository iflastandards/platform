#!/usr/bin/env tsx
// scripts/spreadsheet-api.ts
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { google } from 'googleapis';
import { createSpreadsheetAPI, UnifiedSpreadsheetAPI } from '@ifla/unified-spreadsheet';
import type { Workbook, Sheet, Row } from '@ifla/unified-spreadsheet';

export interface VocabularyInfo {
  name: string;
  title: string;
  description: string;
  csvPath: string;
  relativeDir: string;
  profileType: 'elements' | 'values';
  rowCount: number;
  languages: string[];
  headers: string[];
}

export interface WorkbookGroup {
  name: string;
  title: string;
  vocabularies: VocabularyInfo[];
  totalRows: number;
}

export interface SpreadsheetConfig {
  name: string;
  baseDir: string;
  outputDir: string;
  groupBy: 'profile' | 'directory' | 'all';
}

export class SpreadsheetAPI {
  private config: SpreadsheetConfig;
  private unifiedAPI: UnifiedSpreadsheetAPI;

  constructor(config: SpreadsheetConfig) {
    this.config = config;
    // Initialize unified API with Google auth if available
    this.unifiedAPI = createSpreadsheetAPI({
      googleAuth: process.env.GSHEETS_SA_KEY ? this.createGoogleAuth() : undefined
    });
  }

  private createGoogleAuth() {
    const credentials = JSON.parse(
      Buffer.from(process.env.GSHEETS_SA_KEY!, 'base64').toString('utf8')
    );

    return new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });
  }

  /**
   * Recursively discover all CSV files in the base directory
   */
  async discoverVocabularies(): Promise<VocabularyInfo[]> {
    const vocabularies: VocabularyInfo[] = [];
    const csvFiles = this.findCSVFiles(this.config.baseDir);

    console.log(`🔍 Found ${csvFiles.length} CSV files in ${this.config.baseDir}`);

    for (const csvPath of csvFiles) {
      try {
        const vocab = await this.analyzeCSV(csvPath);
        vocabularies.push(vocab);
        console.log(`   📊 ${vocab.name}: ${vocab.rowCount} rows, ${vocab.languages.length} languages`);
      } catch (error) {
        console.warn(`   ⚠️  Skipped ${csvPath}: ${error}`);
      }
    }

    return vocabularies;
  }

  /**
   * Recursively find all CSV files
   */
  private findCSVFiles(dir: string): string[] {
    const csvFiles: string[] = [];
    
    const scan = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (stat.isFile() && item.endsWith('.csv')) {
          csvFiles.push(fullPath);
        }
      }
    };

    scan(dir);
    return csvFiles;
  }

  /**
   * Analyze a CSV file to extract vocabulary information
   */
  private async analyzeCSV(csvPath: string): Promise<VocabularyInfo> {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const firstLine = csvContent.split('\n')[0];
    const headers = firstLine.split(',').map(h => h.trim());
    
    // Parse CSV to get row count
    const parsed = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Extract languages from headers
    const languages = this.extractLanguages(headers);
    
    // Determine profile type and create name
    const relativePath = path.relative(this.config.baseDir, csvPath);
    const relativeDir = path.dirname(relativePath);
    const fileName = path.basename(csvPath, '.csv');
    
    const profileType = this.determineProfileType(headers, relativePath);
    const name = this.generateName(fileName, relativeDir);
    const title = this.generateTitle(fileName, relativeDir);
    const description = this.generateDescription(fileName, relativeDir, profileType);

    return {
      name,
      title,
      description,
      csvPath,
      relativeDir,
      profileType,
      rowCount: parsed.length,
      languages,
      headers
    };
  }

  /**
   * Extract language codes from headers
   */
  private extractLanguages(headers: string[]): string[] {
    const languageSet = new Set<string>();
    
    headers.forEach(header => {
      const match = header.match(/@(\w+)/);
      if (match) {
        languageSet.add(match[1]);
      }
    });

    return Array.from(languageSet).sort();
  }

  /**
   * Determine if this is elements or values vocabulary
   */
  private determineProfileType(headers: string[], path: string): 'elements' | 'values' {
    // Check for elements-specific headers
    if (headers.some(h => h.includes('rdfs:domain') || h.includes('rdfs:range') || h.includes('owl:Class'))) {
      return 'elements';
    }
    
    // Check path for indicators
    if (path.includes('/elements') || path.includes('/unc/')) {
      return 'elements';
    }
    
    return 'values';
  }

  /**
   * Generate a clean name for the vocabulary
   */
  private generateName(fileName: string, relativeDir: string): string {
    const dirParts = relativeDir.split('/').filter(p => p && p !== '.');
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    if (dirParts.length > 0) {
      const lastDir = dirParts[dirParts.length - 1];
      if (lastDir !== cleanFileName) {
        return `${lastDir}-${cleanFileName}`;
      }
    }
    
    return cleanFileName;
  }

  /**
   * Generate a human-readable title
   */
  private generateTitle(fileName: string, relativeDir: string): string {
    const words = fileName.split(/[_-]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    
    return words.join(' ');
  }

  /**
   * Generate description
   */
  private generateDescription(fileName: string, relativeDir: string, profileType: string): string {
    const title = this.generateTitle(fileName, relativeDir);
    const typeLabel = profileType === 'elements' ? 'elements and classes' : 'vocabulary terms';
    
    return `ISBD ${title} ${typeLabel}`;
  }

  /**
   * Group vocabularies into workbooks
   */
  groupVocabularies(vocabularies: VocabularyInfo[]): WorkbookGroup[] {
    switch (this.config.groupBy) {
      case 'profile':
        return this.groupByProfile(vocabularies);
      case 'directory':
        return this.groupByDirectory(vocabularies);
      case 'all':
        return [{
          name: 'all-vocabularies',
          title: 'All Vocabularies',
          vocabularies,
          totalRows: vocabularies.reduce((sum, v) => sum + v.rowCount, 0)
        }];
      default:
        return this.groupByProfile(vocabularies);
    }
  }

  private groupByProfile(vocabularies: VocabularyInfo[]): WorkbookGroup[] {
    const elements = vocabularies.filter(v => v.profileType === 'elements');
    const values = vocabularies.filter(v => v.profileType === 'values');

    const groups: WorkbookGroup[] = [];

    if (elements.length > 0) {
      groups.push({
        name: 'elements',
        title: 'Elements',
        vocabularies: elements,
        totalRows: elements.reduce((sum, v) => sum + v.rowCount, 0)
      });
    }

    if (values.length > 0) {
      groups.push({
        name: 'values',
        title: 'Values',
        vocabularies: values,
        totalRows: values.reduce((sum, v) => sum + v.rowCount, 0)
      });
    }

    return groups;
  }

  private groupByDirectory(vocabularies: VocabularyInfo[]): WorkbookGroup[] {
    const groups = new Map<string, VocabularyInfo[]>();

    vocabularies.forEach(vocab => {
      const topDir = vocab.relativeDir.split('/')[0] || 'root';
      if (!groups.has(topDir)) {
        groups.set(topDir, []);
      }
      groups.get(topDir)!.push(vocab);
    });

    return Array.from(groups.entries()).map(([dirName, vocabs]) => ({
      name: dirName,
      title: dirName.charAt(0).toUpperCase() + dirName.slice(1),
      vocabularies: vocabs,
      totalRows: vocabs.reduce((sum, v) => sum + v.rowCount, 0)
    }));
  }

  /**
   * Create Excel workbooks using unified API
   */
  async createExcelWorkbooks(workbookGroups: WorkbookGroup[]): Promise<string[]> {
    const outputPaths: string[] = [];
    fs.mkdirSync(this.config.outputDir, { recursive: true });

    for (const group of workbookGroups) {
      console.log(`\n📊 Creating Excel workbook: ${group.title}`);
      
      // Create unified workbook structure
      const sheets: Sheet[] = [];
      
      // Create index sheet
      const indexHeaders = ['Vocabulary Name', 'Title', 'Description', 'Directory', 'Row Count', 'Languages', 'Sheet Name'];
      const indexData: Row[] = [];
      
      group.vocabularies.forEach(vocab => {
        indexData.push({
          'Vocabulary Name': vocab.name,
          'Title': vocab.title,
          'Description': vocab.description,
          'Directory': vocab.relativeDir,
          'Row Count': vocab.rowCount.toString(),
          'Languages': vocab.languages.join(', '),
          'Sheet Name': vocab.name
        });
      });
      
      sheets.push({
        name: 'Index',
        headers: indexHeaders,
        data: indexData
      });

      // Create vocabulary sheets
      for (const vocab of group.vocabularies) {
        const csvData = await this.loadCSVData(vocab.csvPath);
        const sheetData: Row[] = csvData.map(row => {
          const rowData: Row = {};
          vocab.headers.forEach(header => {
            rowData[header] = row[header] || '';
          });
          return rowData;
        });
        
        sheets.push({
          name: vocab.name.substring(0, 31), // Excel sheet name limit
          headers: vocab.headers,
          data: sheetData
        });
        
        console.log(`   📝 Added sheet: ${vocab.name} (${vocab.rowCount} rows)`);
      }

      // Create workbook and write using unified API
      const workbook: Workbook = {
        sheets,
        metadata: {
          title: `${this.config.name} - ${group.title}`,
          author: 'IFLA Standards Platform',
          created: new Date()
        }
      };

      const outputPath = path.join(this.config.outputDir, `${this.config.name}-${group.name}.xlsx`);
      await this.unifiedAPI.write(workbook, {
        type: 'xlsx',
        path: outputPath
      });
      
      outputPaths.push(outputPath);
      console.log(`   ✅ Created: ${outputPath}`);
    }

    return outputPaths;
  }

  /**
   * Create Google Sheets workbooks using unified API
   */
  async createGoogleWorkbooks(workbookGroups: WorkbookGroup[]): Promise<string[]> {
    if (!process.env.GSHEETS_SA_KEY) {
      throw new Error('GSHEETS_SA_KEY environment variable not set for Google Sheets');
    }

    const googleAdapter = this.unifiedAPI.getAdapters().google;
    if (!googleAdapter) {
      throw new Error('Google Sheets adapter not initialized');
    }

    const spreadsheetIds: string[] = [];

    for (const group of workbookGroups) {
      console.log(`\n📊 Creating Google Sheets workbook: ${group.title}`);
      
      // Create unified workbook structure
      const sheets: Sheet[] = [];
      
      // Create index sheet
      const indexHeaders = ['Vocabulary Name', 'Title', 'Description', 'Directory', 'Row Count', 'Languages'];
      const indexData: Row[] = [];
      
      group.vocabularies.forEach(vocab => {
        indexData.push({
          'Vocabulary Name': vocab.name,
          'Title': vocab.title,
          'Description': vocab.description,
          'Directory': vocab.relativeDir,
          'Row Count': vocab.rowCount.toString(),
          'Languages': vocab.languages.join(', ')
        });
      });
      
      sheets.push({
        name: 'Index',
        headers: indexHeaders,
        data: indexData,
        metadata: {
          frozenRows: 1,
          frozenColumns: 1,
          columnWidths: new Array(indexHeaders.length).fill(80)
        }
      });

      // Create vocabulary sheets
      for (const vocab of group.vocabularies) {
        const csvData = await this.loadCSVData(vocab.csvPath);
        const sheetData: Row[] = csvData.map(row => {
          const rowData: Row = {};
          vocab.headers.forEach(header => {
            rowData[header] = row[header] || '';
          });
          return rowData;
        });
        
        sheets.push({
          name: vocab.name,
          headers: vocab.headers,
          data: sheetData,
          metadata: {
            frozenRows: 1,
            frozenColumns: 1,
            columnWidths: new Array(vocab.headers.length).fill(80)
          }
        });
        
        console.log(`   📝 Added sheet: ${vocab.name} (${vocab.rowCount} rows)`);
      }

      // Create workbook
      const workbook: Workbook = {
        sheets,
        metadata: {
          title: `${this.config.name}-${group.name}`,
          author: 'IFLA Standards Platform',
          created: new Date()
        }
      };

      // Create Google Sheets document
      const spreadsheetId = await googleAdapter.create(workbook.metadata?.title || 'Untitled', workbook);
      spreadsheetIds.push(spreadsheetId);

      console.log(`   ✅ Created: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    }

    return spreadsheetIds;
  }

  private async loadCSVData(csvPath: string): Promise<any[]> {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  }

}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`
Usage: pnpm dlx tsx scripts/spreadsheet-api.ts <format> <name> [groupBy] [baseDir]

Arguments:
  format   - Output format: 'excel', 'google', or 'both'
  name     - Project name (used in file/workbook names)
  groupBy  - Grouping strategy: 'profile' (default), 'directory', or 'all'  
  baseDir  - Base directory to scan (default: standards/ISBDM/static/vocabs/xml_csv_new/ns/isbd)

Examples:
  pnpm dlx tsx scripts/spreadsheet-api.ts excel ISBDM profile
  pnpm dlx tsx scripts/spreadsheet-api.ts google ISBDM-Test directory
  pnpm dlx tsx scripts/spreadsheet-api.ts both MyProject all /path/to/csv/files
`);
    process.exit(1);
  }

  const format = args[0] as 'excel' | 'google' | 'both';
  const name = args[1];
  const groupBy = (args[2] || 'profile') as 'profile' | 'directory' | 'all';
  const baseDir = args[3] || '/Users/jonphipps/Code/IFLA/standards-dev/standards/ISBDM/static/vocabs/xml_csv_new/ns/isbd';

  if (!['excel', 'google', 'both'].includes(format)) {
    console.error('Format must be "excel", "google", or "both"');
    process.exit(1);
  }

  const config: SpreadsheetConfig = {
    name,
    baseDir,
    outputDir: path.join(process.cwd(), 'output', `${name}-spreadsheets`),
    groupBy
  };

  console.log(`🚀 Spreadsheet API: Creating ${format} workbooks for ${name}`);
  console.log(`📁 Scanning: ${baseDir}`);
  console.log(`📊 Grouping: ${groupBy}`);
  console.log(`📂 Output: ${config.outputDir}`);

  const api = new SpreadsheetAPI(config);
  
  // Discover vocabularies
  const vocabularies = await api.discoverVocabularies();
  console.log(`\n✅ Discovered ${vocabularies.length} vocabularies`);
  
  // Group into workbooks
  const workbookGroups = api.groupVocabularies(vocabularies);
  console.log(`📚 Created ${workbookGroups.length} workbook groups`);
  
  workbookGroups.forEach(group => {
    console.log(`   📖 ${group.title}: ${group.vocabularies.length} vocabularies, ${group.totalRows} total rows`);
  });

  // Create spreadsheets
  if (format === 'excel' || format === 'both') {
    console.log('\n📊 Creating Excel workbooks...');
    const excelPaths = await api.createExcelWorkbooks(workbookGroups);
    console.log(`✅ Created ${excelPaths.length} Excel workbooks`);
  }

  if (format === 'google' || format === 'both') {
    console.log('\n📊 Creating Google Sheets workbooks...');
    if (!process.env.GSHEETS_SA_KEY) {
      console.error('❌ GSHEETS_SA_KEY environment variable not set for Google Sheets');
      process.exit(1);
    }
    const googleIds = await api.createGoogleWorkbooks(workbookGroups);
    console.log(`✅ Created ${googleIds.length} Google Sheets workbooks`);
    googleIds.forEach(id => {
      console.log(`   🔗 https://docs.google.com/spreadsheets/d/${id}`);
    });
  }

  console.log('\n🎉 Spreadsheet creation complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export default SpreadsheetAPI;