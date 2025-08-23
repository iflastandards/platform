#!/usr/bin/env tsx
// scripts/create-vocabulary-sheet.ts
import { google, type sheets_v4, type drive_v3 } from 'googleapis';
import * as readline from 'readline';

// Types
interface VocabularyConfig {
  profileType: 'values' | 'elements';
  vocabularyName: string;
  title: string;
  description: string;
  languages: string[];
}

interface DctapProfile {
  columns: string[];
  // Add more profile-specific config as needed
}

// Define DCTAP profiles
const DCTAP_PROFILES: Record<string, DctapProfile> = {
  values: {
    columns: ['valueID', 'label', 'definition', 'scopeNote', 'example', 'source', 'status']
  },
  elements: {
    columns: ['elementID', 'label', 'definition', 'comment', 'cardinality', 'datatype', 'status']
  }
};

// Initialize Google APIs
function initializeGoogle() {
  const creds = JSON.parse(
    Buffer.from(process.env.GSHEETS_SA_KEY!, 'base64').toString('utf8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    drive: google.drive({ version: 'v3', auth })
  };
}

// Get user input via command line
async function getUserInput(): Promise<VocabularyConfig> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });

  console.log('=== ISBDM Vocabulary Creation ===\n');

  // Profile type selection
  const profileType = await question('Select profile type (values/elements): ') as 'values' | 'elements';
  if (!['values', 'elements'].includes(profileType)) {
    throw new Error('Invalid profile type. Must be "values" or "elements"');
  }

  // Vocabulary details
  const vocabularyName = await question('Enter vocabulary name (no spaces, e.g., "sensory-specification"): ');
  const title = await question('Enter vocabulary title: ');
  const description = await question('Enter vocabulary description: ');
  
  // Languages
  const languagesInput = await question('Enter languages (comma-separated, e.g., "en,fr,es"): ');
  const languages = languagesInput.split(',').map(lang => lang.trim());

  rl.close();

  return {
    profileType,
    vocabularyName,
    title,
    description,
    languages
  };
}

// Find or create workbook
async function findOrCreateWorkbook(
  drive: drive_v3.Drive, 
  sheets: sheets_v4.Sheets,
  repoName: string,
  profileType: string
): Promise<string> {
  const workbookName = `${repoName}-${profileType}`;
  
  // Search for existing workbook
  const searchResponse = await drive.files.list({
    q: `name='${workbookName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    console.log(`Found existing workbook: ${workbookName}`);
    return searchResponse.data.files[0].id!;
  }

  // Create new workbook
  console.log(`Creating new workbook: ${workbookName}`);
  const createResponse = await drive.files.create({
    requestBody: {
      name: workbookName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    },
    fields: 'id',
  });

  return createResponse.data.id!;
}

// Create DCTAP profile sheet
async function createDctapProfileSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  profileType: string
): Promise<void> {
  const profile = DCTAP_PROFILES[profileType];
  
  // Check if DCTAP sheet already exists
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const dctapSheetExists = spreadsheet.data.sheets?.some(
    sheet => sheet.properties?.title === `DCTAP-${profileType}`
  );

  if (!dctapSheetExists) {
    // Add new sheet for DCTAP profile
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: `DCTAP-${profileType}`,
            }
          }
        }]
      }
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `DCTAP-${profileType}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [profile.columns]
      }
    });
  }
}

// Create vocabulary sheet with language columns
async function createVocabularySheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  config: VocabularyConfig
): Promise<number> {
  const profile = DCTAP_PROFILES[config.profileType];
  
  // Add new sheet for vocabulary
  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: config.vocabularyName,
          }
        }
      }]
    }
  });

  // Create headers with language variants
  const headers: string[] = [];
  profile.columns.forEach(column => {
    // Add base column
    headers.push(column);
    
    // Add language-specific columns for translatable fields
    if (['label', 'definition', 'scopeNote', 'comment'].includes(column)) {
      config.languages.forEach(lang => {
        headers.push(`${column}_${lang}`);
      });
    }
  });

  // Add headers to sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${config.vocabularyName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers]
    }
  });

  // Extract and return the sheet ID
  const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId || 0;
  return sheetId;
}

// Create or update index sheet
async function updateIndexSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  config: VocabularyConfig
): Promise<void> {
  // Check if Index sheet exists
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const indexSheetExists = spreadsheet.data.sheets?.some(
    sheet => sheet.properties?.title === 'Index'
  );

  if (!indexSheetExists) {
    // Create Index sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Index',
              index: 0 // Place at beginning
            }
          }
        }]
      }
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Index!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Vocabulary Name', 'Title', 'Description', 'Languages', 'Link']]
      }
    });
  }

  // Get current index data
  const indexData = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Index!A:E',
  });

  const currentRows = indexData.data.values || [['Vocabulary Name', 'Title', 'Description', 'Languages', 'Link']];
  
  // Add new vocabulary entry
  const vocabularyUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${
    spreadsheet.data.sheets?.find(s => s.properties?.title === config.vocabularyName)?.properties?.sheetId || 0
  }`;
  
  currentRows.push([
    config.vocabularyName,
    config.title,
    config.description,
    config.languages.join(', '),
    vocabularyUrl
  ]);

  // Update index sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Index!A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: currentRows
    }
  });
}

// Main function
async function main() {
  try {
    // Get configuration from user
    const config = await getUserInput();
    
    // Initialize Google APIs
    const { sheets, drive } = initializeGoogle();
    
    // Get repo name from environment or use default
    const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'ISBDM';
    
    // Find or create workbook
    const spreadsheetId = await findOrCreateWorkbook(drive, sheets, repoName, config.profileType);
    
    // Create DCTAP profile sheet
    await createDctapProfileSheet(sheets, spreadsheetId, config.profileType);
    
    // Create vocabulary sheet
    await createVocabularySheet(sheets, spreadsheetId, config);
    
    // Update index sheet
    await updateIndexSheet(sheets, spreadsheetId, config);
    
    // Get the final URL
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    console.log('\n✅ Vocabulary sheet created successfully!');
    console.log(`📊 Spreadsheet URL: ${spreadsheetUrl}`);
    console.log(`📝 Vocabulary sheet: ${config.vocabularyName}`);
    
  } catch (error) {
    console.error('❌ Error creating vocabulary sheet:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { VocabularyConfig, initializeGoogle, findOrCreateWorkbook, createVocabularySheet, DCTAP_PROFILES };