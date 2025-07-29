import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  row?: number;
  column?: string;
  suggestion?: string;
  worksheet?: string;
}

interface DCTAPConstraint {
  propertyID: string;
  propertyLabel?: string;
  mandatory: boolean;
  repeatable: boolean;
  valueConstraint?: string;
  valueConstraintType?: string;
  valueShape?: string;
  note?: string;
}

interface DCTAPProfile {
  id: string;
  name: string;
  namespace: string;
  shapeID: string;
  shapeLabel: string;
  constraints: DCTAPConstraint[];
}

class DCTAPValidator {
  private profilesCache: Map<string, DCTAPProfile> = new Map();

  /**
   * Load a DCTAP profile from CSV content
   */
  loadProfileFromCSV(profileId: string, csvContent: string): DCTAPProfile {
    // Check cache first
    if (this.profilesCache.has(profileId)) {
      return this.profilesCache.get(profileId)!;
    }

    try {
      // Parse CSV content
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const constraints: DCTAPConstraint[] = [];
      let shapeID = '';
      let shapeLabel = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const record: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        // Get shape info from first row
        if (!shapeID && record['shapeID']) {
          shapeID = record['shapeID'];
          shapeLabel = record['shapeLabel'] || shapeID;
        }

        // Build constraint
        const propertyID = record['propertyID'] || record['*propertyID'] || record['uri'] || record['*uri'];
        if (propertyID) {
          constraints.push({
            propertyID: propertyID.replace('*', ''), // Remove mandatory marker
            propertyLabel: record['propertyLabel'],
            mandatory: propertyID.startsWith('*') || record['mandatory'] === 'TRUE',
            repeatable: record['repeatable'] !== 'FALSE',
            valueConstraint: record['valueConstraint'],
            valueConstraintType: record['valueConstraintType'],
            valueShape: record['valueShape'],
            note: record['note'],
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
   * Validate spreadsheet data against a DCTAP profile
   */
  validateSpreadsheet(
    csvData: string,
    profileId: string,
    profileContent: string,
    worksheetName?: string
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    try {
      const profile = this.loadProfileFromCSV(profileId, profileContent);
      
      // Parse CSV data
      const lines = csvData.split('\n');
      if (lines.length === 0) {
        issues.push({
          type: 'error',
          message: 'Empty CSV file',
          worksheet: worksheetName,
        });
        return issues;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const spreadsheetData: string[][] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        spreadsheetData.push(values);
      }
      
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { csvData, profileId, profileContent, worksheetName } = await req.json();

    if (!csvData || !profileId || !profileContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: csvData, profileId, profileContent' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const validator = new DCTAPValidator();
    const issues = validator.validateSpreadsheet(csvData, profileId, profileContent, worksheetName);

    return new Response(JSON.stringify({ issues }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Validation service error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
