import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';

export interface DCTAPConstraint {
  propertyID: string;
  propertyLabel?: string;
  mandatory: boolean;
  repeatable: boolean;
  valueConstraint?: string;
  valueConstraintType?: string;
  valueShape?: string;
  note?: string;
}

export interface DCTAPProfile {
  id: string;
  name: string;
  namespace: string;
  shapeID: string;
  shapeLabel: string;
  constraints: DCTAPConstraint[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  row?: number;
  column?: string;
  suggestion?: string;
  worksheet?: string;
}

export class DCTAPValidator {
  private profilesCache: Map<string, DCTAPProfile> = new Map();

  /**
   * Load a DCTAP profile from a CSV file
   */
  async loadProfile(profileId: string, profilePath: string): Promise<DCTAPProfile> {
    // Check cache first
    if (this.profilesCache.has(profileId)) {
      return this.profilesCache.get(profileId)!;
    }

    try {
      const csvContent = await fs.readFile(profilePath, 'utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true,
      });

      // Parse DCTAP format
      const constraints: DCTAPConstraint[] = [];
      let shapeID = '';
      let shapeLabel = '';

for (const record of records as Record<string, unknown>[]) {
  // Get shape info from first row
  if (!shapeID && typeof record['shapeID'] === 'string') {
    shapeID = record['shapeID'];
    shapeLabel = typeof record['shapeLabel'] === 'string' ? record['shapeLabel'] : shapeID;
  }

        // Build constraint
        const propertyID = (record['propertyID'] || record['*propertyID'] || record['uri'] || record['*uri']) as string;
        if (propertyID && typeof propertyID === 'string') {
          constraints.push({
            propertyID: propertyID.replace('*', ''), // Remove mandatory marker
            propertyLabel: record['propertyLabel'] as string | undefined,
            mandatory: propertyID.startsWith('*') || record['mandatory'] === 'TRUE',
            repeatable: record['repeatable'] !== 'FALSE',
            valueConstraint: record['valueConstraint'] as string | undefined,
            valueConstraintType: record['valueConstraintType'] as string | undefined,
            valueShape: record['valueShape'] as string | undefined,
            note: record['note'] as string | undefined,
          });
        }
      }

      const profile: DCTAPProfile = {
        id: profileId,
        name: profileId,
        namespace: profileId.split('-')[0], // Extract namespace from ID
        shapeID,
        shapeLabel,
        constraints,
      };

      this.profilesCache.set(profileId, profile);
      return profile;
    } catch (error) {
      console.error(`Failed to load DCTAP profile ${profileId}:`, error);
      throw new Error(`Failed to load DCTAP profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available DCTAP profiles
   */
  async getAvailableProfiles(): Promise<Map<string, string>> {
    const profiles = new Map<string, string>();
    
    // Define known profiles and their paths
    // Navigate to project root from admin app directory
    const projectRoot = path.resolve(process.cwd(), '../..');
    const standardsDir = path.join(projectRoot, 'standards');
    
    profiles.set('isbd-elements', path.join(standardsDir, 'ISBD/static/data/DCTAP/isbd-elements-profile.csv'));
    profiles.set('isbd-concepts', path.join(standardsDir, 'ISBD/static/data/DCTAP/isbd-concepts-profile.csv'));
    profiles.set('isbdm-elements', path.join(standardsDir, 'ISBDM/static/data/DCTAP/isbdm-elements-profile.csv'));
    profiles.set('isbdm-concepts', path.join(standardsDir, 'ISBDM/static/data/DCTAP/isbdm-concepts-profile.csv'));
    
    return profiles;
  }

  /**
   * Validate spreadsheet data against a DCTAP profile
   */
  async validateSpreadsheet(
    spreadsheetData: any[][],
    headers: string[],
    profileId: string,
    worksheetName?: string
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Load the profile
      const profiles = await this.getAvailableProfiles();
      const profilePath = profiles.get(profileId);
      
      if (!profilePath) {
        issues.push({
          type: 'error',
          message: `Unknown DCTAP profile: ${profileId}`,
          worksheet: worksheetName,
        });
        return issues;
      }

      const profile = await this.loadProfile(profileId, profilePath);
      
      // Check for mandatory columns
      const mandatoryConstraints = profile.constraints.filter(c => c.mandatory);
      const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
      
      for (const constraint of mandatoryConstraints) {
        const propertyID = constraint.propertyID.toLowerCase();
        const found = normalizedHeaders.some(h => 
          h === propertyID || 
          h.startsWith(propertyID + '@') || // Language-tagged
          h === '*' + propertyID // Mandatory marker
        );
        
        if (!found) {
          issues.push({
            type: 'error',
            message: `Missing required column: ${constraint.propertyID}`,
            column: constraint.propertyID,
            suggestion: `Add a column named "${constraint.propertyID}" to your spreadsheet`,
            worksheet: worksheetName,
          });
        }
      }

      // Validate each row
      const columnMap = new Map<string, number>();
      headers.forEach((header, index) => {
        const normalized = header.toLowerCase().trim().replace('*', '');
        columnMap.set(normalized, index);
      });

      spreadsheetData.forEach((row, rowIndex) => {
        // Check mandatory fields
        for (const constraint of mandatoryConstraints) {
          const propertyID = constraint.propertyID.toLowerCase();
          const columnIndex = columnMap.get(propertyID);
          
          if (columnIndex !== undefined) {
            const value = row[columnIndex];
            if (!value || value.toString().trim() === '') {
              issues.push({
                type: 'error',
                message: `Missing required value for ${constraint.propertyID}`,
                row: rowIndex + 2, // +2 for header row and 1-based indexing
                column: constraint.propertyID,
                suggestion: `Provide a value for ${constraint.propertyID}`,
                worksheet: worksheetName,
              });
            }
          }
        }

        // Check value constraints
        for (const constraint of profile.constraints) {
          const propertyID = constraint.propertyID.toLowerCase();
          const columnIndex = columnMap.get(propertyID);
          
          if (columnIndex !== undefined && constraint.valueConstraint) {
            const value = row[columnIndex];
            if (value && constraint.valueConstraintType === 'picklist') {
              const allowedValues = constraint.valueConstraint.split(',').map((v: string) => v.trim());
              const cellValues = value.toString().split(';').map((v: string) => v.trim());
              
              for (const cellValue of cellValues) {
                if (cellValue && !allowedValues.includes(cellValue)) {
                  issues.push({
                    type: 'warning',
                    message: `Invalid value "${cellValue}" for ${constraint.propertyID}`,
                    row: rowIndex + 2,
                    column: constraint.propertyID,
                    suggestion: `Use one of: ${allowedValues.join(', ')}`,
                    worksheet: worksheetName,
                  });
                }
              }
            }
          }
        }
      });

      // Add info about detected languages
      const languageColumns = headers.filter(h => h.includes('@'));
      if (languageColumns.length > 0) {
        const languages = new Set<string>();
        languageColumns.forEach(col => {
          const match = col.match(/@(\w+)$/);
          if (match) {
            languages.add(match[1]);
          }
        });
        
        issues.push({
          type: 'info',
          message: `Detected ${languages.size} language(s): ${Array.from(languages).join(', ')}`,
          worksheet: worksheetName,
        });
      }

      return issues;
    } catch (error) {
      issues.push({
        type: 'error',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        worksheet: worksheetName,
      });
      return issues;
    }
  }
}

// Export singleton instance
export const dctapValidator = new DCTAPValidator();