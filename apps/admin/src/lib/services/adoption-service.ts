import { db, type Database } from '@/lib/supabase/client';
import { ImportService } from './import-service';

type ActiveSheet = Database['public']['Tables']['active_sheets']['Insert'];

export interface AdoptionOptions {
  spreadsheetUrl: string;
  projectId: string;
  projectName?: string;
  reviewGroup?: string;
  dctapProfileId: string;
  userId: string;
  userName?: string;
}

export interface BirthCertificate {
  // Basic info
  spreadsheetUrl: string;
  spreadsheetName: string;
  namespace: string;
  
  // Export info (who created this spreadsheet)
  exportedBy: string;
  exportedAt: string;
  exportReason?: string;
  
  // Content type
  contentType: 'element-sets' | 'concept-schemes' | 'mixed';
  
  // Worksheets to import
  worksheets: {
    name: string;
    type: 'element-set' | 'concept-scheme' | 'index' | 'dctap' | 'skip';
    elementSetName?: string;
    conceptSchemeName?: string;
  }[];
  
  // Languages
  languages: string[];
  primaryLanguage: string;
  
  // DCTAP info
  dctapUsed?: string;
  dctapEmbedded: boolean;
  
  // Additional notes
  notes?: string;
}

export interface AdoptionWithBirthCertificateOptions {
  birthCertificate: BirthCertificate;
  projectId?: string;
  projectName?: string;
  reviewGroup?: string;
  userId: string;
  userName?: string;
}

export interface AdoptionResult {
  activeSheetId: string;
  importJobId?: string;
  projectId: string;
  sheetId: string;
  sheetUrl: string;
  analysis: SpreadsheetAnalysis;
}

export interface SpreadsheetAnalysis {
  sheetId: string;
  sheetName: string;
  worksheets: WorksheetInfo[];
  inferredType: 'element-sets' | 'concept-schemes' | 'mixed' | 'unknown';
  languages: string[];
  totalRows: number;
  totalColumns: number;
}

export interface WorksheetInfo {
  name: string;
  type: 'element-set' | 'concept-scheme' | 'index' | 'dctap' | 'unknown';
  rows: number;
  columns: number;
  headers: string[];
  languages: string[];
}

export class AdoptionService {
  private analyzer: GoogleSheetsAnalyzer;
  private importService: ImportService;

  constructor() {
    this.analyzer = new GoogleSheetsAnalyzer();
    this.importService = new ImportService();
  }

  /**
   * Extract Google Sheets ID from URL
   */
  extractSheetId(url: string): string | null {
    const match = url.match(/\/d\/([\w-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Validate Google Sheets URL
   */
  isValidGoogleSheetsUrl(url: string): boolean {
    const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+/;
    return pattern.test(url);
  }

  /**
   * Analyze spreadsheet structure
   */
  async analyzeSpreadsheet(url: string): Promise<SpreadsheetAnalysis> {
    const sheetId = this.extractSheetId(url);
    if (!sheetId) {
      throw new Error('Invalid Google Sheets URL');
    }

    // In production, this would call the Google Sheets API
    // For now, return mock data based on sheet ID
    return this.analyzer.analyze(sheetId);
  }

  /**
   * Adopt a spreadsheet with comprehensive birth certificate metadata
   */
  async adoptSpreadsheetWithBirthCertificate(options: AdoptionWithBirthCertificateOptions): Promise<AdoptionResult> {
    const { birthCertificate, projectId, userId, userName } = options;

    // Validate URL
    if (!this.isValidGoogleSheetsUrl(birthCertificate.spreadsheetUrl)) {
      throw new Error('Invalid Google Sheets URL');
    }

    const sheetId = this.extractSheetId(birthCertificate.spreadsheetUrl);
    if (!sheetId) {
      throw new Error('Could not extract sheet ID from URL');
    }

    // Create or ensure project exists
    let finalProjectId = projectId;
    if (options.projectName && options.reviewGroup) {
      // Create new project
      finalProjectId = await this.createProject({
        name: options.projectName,
        reviewGroup: options.reviewGroup,
        userId,
      });
    }

    if (!finalProjectId) {
      throw new Error('Project ID is required');
    }

    // Check if already adopted
    const isAdopted = await this.isSpreadsheetAdopted(sheetId);
    if (isAdopted) {
      throw new Error('This spreadsheet has already been adopted');
    }

    // Register as active sheet with comprehensive metadata
    const activeSheet: ActiveSheet = {
      namespace_id: birthCertificate.namespace,
      sheet_id: sheetId,
      sheet_url: birthCertificate.spreadsheetUrl,
      created_by: userId,
      status: 'ready',
      project_id: finalProjectId,
      metadata: {
        adoptedBy: userName || userId,
        adoptedAt: new Date().toISOString(),
        birthCertificate: {
          ...birthCertificate,
          // Store the original export metadata
          export: {
            exportedBy: birthCertificate.exportedBy,
            exportedAt: birthCertificate.exportedAt,
            exportReason: birthCertificate.exportReason,
          },
          // Store content configuration
          content: {
            type: birthCertificate.contentType,
            worksheets: birthCertificate.worksheets,
          },
          // Store language configuration
          languages: {
            available: birthCertificate.languages,
            primary: birthCertificate.primaryLanguage,
          },
          // Store DCTAP info
          dctap: {
            reference: birthCertificate.dctapUsed,
            embedded: birthCertificate.dctapEmbedded,
          },
        },
      },
    };

    const { data: sheetData, error: sheetError } = await db
      .from('active_sheets')
      .insert(activeSheet)
      .select()
      .single();

    if (sheetError) {
      throw new Error(`Failed to register active sheet: ${sheetError.message}`);
    }

    // Log the adoption
    await this.logActivity({
      action: 'spreadsheet_adopted_with_birth_certificate',
      userId,
      userName,
      details: {
        sheetId,
        projectId: finalProjectId,
        namespace: birthCertificate.namespace,
        contentType: birthCertificate.contentType,
        worksheetCount: birthCertificate.worksheets.filter(ws => ws.type !== 'skip').length,
        languages: birthCertificate.languages,
      },
    });

    // Generate an analysis-like object for compatibility
    const analysis: SpreadsheetAnalysis = {
      sheetId,
      sheetName: birthCertificate.spreadsheetName,
      worksheets: birthCertificate.worksheets.map(ws => ({
        name: ws.name,
        type: ws.type as any,
        rows: 0, // Unknown from birth certificate
        columns: 0, // Unknown from birth certificate
        headers: [], // Unknown from birth certificate
        languages: birthCertificate.languages,
      })),
      inferredType: birthCertificate.contentType as any,
      languages: birthCertificate.languages,
      totalRows: 0, // Unknown from birth certificate
      totalColumns: 0, // Unknown from birth certificate
    };

    return {
      activeSheetId: sheetData.id,
      projectId: finalProjectId,
      sheetId,
      sheetUrl: birthCertificate.spreadsheetUrl,
      analysis,
    };
  }

  /**
   * Adopt an existing spreadsheet into the system (legacy method)
   */
  async adoptSpreadsheet(options: AdoptionOptions): Promise<AdoptionResult> {
    const { spreadsheetUrl, projectId, dctapProfileId, userId, userName } = options;

    // Validate URL
    if (!this.isValidGoogleSheetsUrl(spreadsheetUrl)) {
      throw new Error('Invalid Google Sheets URL');
    }

    const sheetId = this.extractSheetId(spreadsheetUrl);
    if (!sheetId) {
      throw new Error('Could not extract sheet ID from URL');
    }

    // Analyze spreadsheet structure
    const analysis = await this.analyzeSpreadsheet(spreadsheetUrl);

    // Create or ensure project exists
    let finalProjectId = projectId;
    if (options.projectName && options.reviewGroup) {
      // Create new project
      finalProjectId = await this.createProject({
        name: options.projectName,
        reviewGroup: options.reviewGroup,
        userId,
      });
    }

    // Register as active sheet
    const activeSheet: ActiveSheet = {
      namespace_id: this.getNamespaceFromProject(finalProjectId),
      sheet_id: sheetId,
      sheet_url: spreadsheetUrl,
      created_by: userId,
      status: 'ready',
      project_id: finalProjectId,
      metadata: {
        adoptedBy: userName || userId,
        adoptedAt: new Date().toISOString(),
        analysis,
        dctapProfileId,
      },
    };

    const { data: sheetData, error: sheetError } = await db
      .from('active_sheets')
      .insert(activeSheet)
      .select()
      .single();

    if (sheetError) {
      throw new Error(`Failed to register active sheet: ${sheetError.message}`);
    }

    // Log the adoption
    await this.logActivity({
      action: 'spreadsheet_adopted',
      userId,
      userName,
      details: {
        sheetId,
        projectId: finalProjectId,
        worksheetCount: analysis.worksheets.length,
        totalRows: analysis.totalRows,
      },
    });

    return {
      activeSheetId: sheetData.id,
      projectId: finalProjectId,
      sheetId,
      sheetUrl: spreadsheetUrl,
      analysis,
    };
  }

  /**
   * Create a new project (mock implementation)
   */
  private async createProject(options: {
    name: string;
    reviewGroup: string;
    userId: string;
  }): Promise<string> {
    // In production, this would create a GitHub project and database record
    // For now, return a mock ID
    const projectId = `project-${Date.now()}`;
    
    await this.logActivity({
      action: 'project_created',
      userId: options.userId,
      details: {
        projectId,
        name: options.name,
        reviewGroup: options.reviewGroup,
      },
    });

    return projectId;
  }

  /**
   * Get namespace from project (mock implementation)
   */
  private getNamespaceFromProject(projectId: string): string {
    // In production, this would look up the project's namespaces
    // For now, return a default based on project ID
    const projectNamespaceMap: Record<string, string> = {
      'project-1': 'isbd',
      'project-2': 'lrm',
      'project-3': 'muldicat',
    };

    return projectNamespaceMap[projectId] || 'default';
  }

  /**
   * Log activity
   */
  private async logActivity(options: {
    action: string;
    userId: string;
    userName?: string;
    details: Record<string, unknown>;
  }): Promise<void> {
    const result = await db.from('activity_logs').insert({
      log_name: options.action,
      causer_id: options.userId,
      properties: {
        userName: options.userName,
        ...options.details,
      },
    });

    // Type guard to check if it's an error response
    if ('error' in result && result.error) {
      console.error('Failed to log activity:', result.error);
    }
  }

  /**
   * Get active sheets for a project
   */
  async getProjectActiveSheets(projectId: string): Promise<ActiveSheet[]> {
    const { data, error } = await db
      .from('active_sheets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active sheets: ${error.message}`);
    }

    return (data || []) as ActiveSheet[];
  }

  /**
   * Check if a spreadsheet is already adopted
   */
  async isSpreadsheetAdopted(sheetId: string): Promise<boolean> {
    const { data, error } = await db
      .from('active_sheets')
      .select('id')
      .eq('sheet_id', sheetId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to check adoption status: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Download adopted spreadsheet to CSV files
   * Note: This uses the Google Sheets API directly rather than sheet-sync
   * because adopted sheets may not have a standard configuration
   */
  async downloadAdoptedSheet(
    sheetId: string,
    namespace: string,
    outputDir: string
  ): Promise<{ csvFiles: string[]; totalRows: number }> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Use our analyzer which already has Google Sheets API access
      const analysis = await this.analyzer.analyze(sheetId);
      
      // If we have API access, download the sheets
      if (this.analyzer.hasApiAccess()) {
        const { google } = require('googleapis');
        const auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(Buffer.from(process.env.GSHEETS_SA_KEY!, 'base64').toString('utf8')),
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });

        const csvFiles: string[] = [];
        let totalRows = 0;

        // Download each worksheet
        for (const worksheet of analysis.worksheets) {
          if (worksheet.type === 'index' || worksheet.type === 'dctap') {
            continue; // Skip index and dctap sheets
          }

          try {
            // Get worksheet data
            const range = `${worksheet.name}!A:ZZ`;
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: sheetId,
              range,
            });

            const rows = response.data.values || [];
            if (rows.length === 0) continue;

            // Convert to CSV
            const { stringify } = require('csv-stringify/sync');
            const csvContent = stringify(rows);

            // Write to file
            const fileName = `${worksheet.name}.csv`;
            const csvPath = path.join(outputDir, fileName);
            await fs.writeFile(csvPath, csvContent, 'utf8');

            csvFiles.push(fileName);
            totalRows += rows.length;
            
            console.log(`Downloaded ${worksheet.name}: ${rows.length} rows`);
          } catch (error) {
            console.error(`Failed to download worksheet ${worksheet.name}:`, error);
          }
        }

        return { csvFiles, totalRows };
      } else {
        // No API access, just return the analysis info
        console.warn('No Google Sheets API access, cannot download actual data');
        return { 
          csvFiles: analysis.worksheets.map(w => `${w.name}.csv`),
          totalRows: analysis.totalRows 
        };
      }
    } catch (error) {
      console.error('Failed to download adopted sheet:', error);
      throw new Error(`Failed to download spreadsheet: ${error}`);
    }
  }
}

// Google Sheets Analyzer using the actual API
class GoogleSheetsAnalyzer {
  private auth: unknown;
  private sheets: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor() {
    // Initialize only if we have credentials
    if (process.env.GSHEETS_SA_KEY) {
      try {
        const { google } = require('googleapis');
        this.auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(Buffer.from(process.env.GSHEETS_SA_KEY, 'base64').toString('utf8')),
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      } catch (error) {
        console.warn('Failed to initialize Google Sheets API:', error);
      }
    }
  }

  /**
   * Check if we have API access
   */
  hasApiAccess(): boolean {
    return !!this.sheets;
  }

  async analyze(sheetId: string): Promise<SpreadsheetAnalysis> {
    // If we don't have real API access, return mock data
    if (!this.sheets) {
      return this.getMockAnalysis(sheetId);
    }

    try {
      // Get spreadsheet metadata
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        includeGridData: false,
      });

      const sheetName = spreadsheet.data.properties?.title || 'Unknown Spreadsheet';
      const worksheets: WorksheetInfo[] = [];
      const allLanguages = new Set<string>();
      let totalRows = 0;
      let totalColumns = 0;

      // Analyze each sheet
      for (const sheet of spreadsheet.data.sheets || []) {
        const title = sheet.properties?.title;
        if (!title) continue;

        // Get first few rows to analyze structure
        const range = `${title}!A1:Z10`;
        try {
          const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
          });

          const rows = response.data.values || [];
          if (rows.length === 0) continue;

          const headers = rows[0] || [];
          const rowCount = sheet.properties?.gridProperties?.rowCount || rows.length;
          const columnCount = sheet.properties?.gridProperties?.columnCount || headers.length;

          totalRows += rowCount;
          totalColumns = Math.max(totalColumns, columnCount);

          // Detect worksheet type and languages
          const worksheetInfo = this.analyzeWorksheet(title, headers, rowCount, columnCount);
          worksheets.push(worksheetInfo);

          // Collect all languages
          worksheetInfo.languages.forEach(lang => allLanguages.add(lang));
        } catch (error) {
          console.error(`Failed to analyze sheet ${title}:`, error);
        }
      }

      // Infer overall type
      const hasElementSets = worksheets.some(w => w.type === 'element-set');
      const hasConceptSchemes = worksheets.some(w => w.type === 'concept-scheme');
      let inferredType: 'element-sets' | 'concept-schemes' | 'mixed' | 'unknown' = 'unknown';
      
      if (hasElementSets && hasConceptSchemes) {
        inferredType = 'mixed';
      } else if (hasElementSets) {
        inferredType = 'element-sets';
      } else if (hasConceptSchemes) {
        inferredType = 'concept-schemes';
      }

      return {
        sheetId,
        sheetName,
        worksheets,
        inferredType,
        languages: Array.from(allLanguages).sort(),
        totalRows,
        totalColumns,
      };
    } catch (error) {
      console.error('Failed to analyze spreadsheet:', error);
      // Fall back to mock data
      return this.getMockAnalysis(sheetId);
    }
  }

  private analyzeWorksheet(name: string, headers: string[], rows: number, columns: number): WorksheetInfo {
    // Detect languages from headers (e.g., Label@en, Label@fr)
    const languages = new Set<string>();
    const languagePattern = /@(\w{2})$/;
    
    headers.forEach(header => {
      const match = header.match(languagePattern);
      if (match) {
        languages.add(match[1]);
      }
    });

    // Detect worksheet type based on headers
    let type: WorksheetInfo['type'] = 'unknown';
    
    if (name.toLowerCase() === 'index') {
      type = 'index';
    } else if (name.toLowerCase() === 'dctap') {
      type = 'dctap';
    } else if (headers.some(h => h.match(/^(pref)?label/i))) {
      // Headers like PrefLabel, AltLabel suggest concept scheme
      type = 'concept-scheme';
    } else if (headers.some(h => h.match(/^label/i)) && headers.some(h => h.match(/^definition/i))) {
      // Headers like Label, Definition suggest element set
      type = 'element-set';
    }

    return {
      name,
      type,
      rows,
      columns,
      headers,
      languages: Array.from(languages).sort(),
    };
  }

  private getMockAnalysis(sheetId: string): SpreadsheetAnalysis {
    // Return mock data for development/testing
    return {
      sheetId,
      sheetName: 'ISBD Vocabulary Export (Mock)',
      worksheets: [
        {
          name: 'Index',
          type: 'index',
          rows: 10,
          columns: 2,
          headers: ['Section', 'Description'],
          languages: [],
        },
        {
          name: 'Elements',
          type: 'element-set',
          rows: 150,
          columns: 12,
          headers: ['URI', 'Label@en', 'Label@fr', 'Label@es', 'Definition@en', 'Definition@fr'],
          languages: ['en', 'fr', 'es'],
        },
        {
          name: 'Concepts',
          type: 'concept-scheme',
          rows: 75,
          columns: 10,
          headers: ['URI', 'PrefLabel@en', 'PrefLabel@fr', 'Definition@en', 'Broader'],
          languages: ['en', 'fr'],
        },
      ],
      inferredType: 'mixed',
      languages: ['en', 'fr', 'es'],
      totalRows: 235,
      totalColumns: 24,
    };
  }
}