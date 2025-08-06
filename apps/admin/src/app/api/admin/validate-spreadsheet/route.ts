import { NextRequest, NextResponse } from 'next/server';
import { canPerformAction } from '@/lib/authorization';
import { ImportService } from '@/lib/services/import-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetUrl, namespace, dctapProfile } = body;

    if (!spreadsheetUrl || !namespace || !dctapProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: spreadsheetUrl, namespace, or dctapProfile' },
        { status: 400 }
      );
    }

    // Check if user can import spreadsheets for this namespace
    const canImport = await canPerformAction('spreadsheet', 'import', {
      namespaceId: namespace
    });

    if (!canImport) {
      return NextResponse.json(
        { error: 'You do not have permission to import spreadsheets for this namespace' },
        { status: 403 }
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