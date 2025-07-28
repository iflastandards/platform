import { NextRequest, NextResponse } from 'next/server';
import { dctapValidator } from '@/lib/services/dctap-validation';
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvData, profileId, worksheetName } = body;

    if (!csvData || !profileId) {
      return NextResponse.json(
        { error: 'Missing required fields: csvData, profileId' },
        { status: 400 }
      );
    }

    // Get the profile path from the available profiles
    const profiles = await dctapValidator.getAvailableProfiles();
    const profilePath = profiles.get(profileId);

    if (!profilePath) {
      return NextResponse.json(
        { error: `Unknown DCTAP profile: ${profileId}` },
        { status: 400 }
      );
    }

    // Check if profile file exists
    try {
      await fs.access(profilePath);
    } catch (error) {
      return NextResponse.json(
        { error: `DCTAP profile file not found: ${profilePath}` },
        { status: 404 }
      );
    }

    // Parse CSV data to array format that validator expects
    const lines = csvData.split('\n').filter((line: string) => line.trim());
    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'Empty CSV data' },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
    const spreadsheetData: string[][] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
      spreadsheetData.push(values);
    }

    // Perform validation
    const issues = await dctapValidator.validateSpreadsheet(
      spreadsheetData,
      headers,
      profileId,
      worksheetName
    );

    return NextResponse.json({ issues });

  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
