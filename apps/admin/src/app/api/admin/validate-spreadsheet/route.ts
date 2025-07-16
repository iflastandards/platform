import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ImportService } from '@/lib/services/import-service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { spreadsheetUrl, namespace, dctapProfile } = body;

    if (!spreadsheetUrl || !namespace || !dctapProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: spreadsheetUrl, namespace, or dctapProfile' },
        { status: 400 }
      );
    }

    // Use the import service to validate
    const results = await ImportService.validateSpreadsheet(spreadsheetUrl, namespace, dctapProfile);

    return NextResponse.json({
      success: true,
      results,
      namespace,
      dctapProfile,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to validate spreadsheet',
      },
      { status: 500 }
    );
  }
}