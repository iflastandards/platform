import { NextRequest, NextResponse } from 'next/server';
import { canPerformAction, getAuthContext } from '@/lib/authorization';
import { AdoptionService } from '@/lib/services/adoption-service';

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      // Basic info
      spreadsheetUrl,
      spreadsheetName,
      namespace,
      
      // Export info
      exportedBy,
      exportedAt,
      exportReason,
      
      // Content info
      contentType,
      worksheets,
      
      // Languages
      languages,
      primaryLanguage,
      
      // DCTAP
      dctapUsed,
      dctapEmbedded,
      
      // Project
      projectId,
      projectName,
      reviewGroup,
      
      // Additional
      notes,
      userName,
    } = body;

    // Validate required fields
    if (!spreadsheetUrl || !namespace || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: spreadsheetUrl, namespace, or contentType' },
        { status: 400 }
      );
    }

    if (!projectId && (!projectName || !reviewGroup)) {
      return NextResponse.json(
        { error: 'Either projectId or both projectName and reviewGroup are required' },
        { status: 400 }
      );
    }

    // Check if user can import spreadsheets for this namespace
    const canImport = await canPerformAction('spreadsheet', 'import', {
      namespaceId: namespace
    });

    if (!canImport) {
      return NextResponse.json(
        { error: 'You do not have permission to adopt spreadsheets for this namespace' },
        { status: 403 }
      );
    }

    // Create adoption service
    const adoptionService = new AdoptionService();

    // Adopt the spreadsheet with comprehensive metadata
    const result = await adoptionService.adoptSpreadsheetWithBirthCertificate({
      // Birth certificate data
      birthCertificate: {
        spreadsheetUrl,
        spreadsheetName,
        namespace,
        exportedBy,
        exportedAt,
        exportReason,
        contentType,
        worksheets,
        languages,
        primaryLanguage,
        dctapUsed,
        dctapEmbedded,
        notes,
      },
      // Project info
      projectId,
      projectName,
      reviewGroup,
      // User info
      userId: authContext.userId,
      userName,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Adoption error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to adopt spreadsheet',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheetUrl = searchParams.get('url');

    const adoptionService = new AdoptionService();

    if (action === 'basic-info' && sheetUrl) {
      // Get basic spreadsheet info (sheet names and headers)
      const sheetId = adoptionService.extractSheetId(sheetUrl);
      if (!sheetId) {
        return NextResponse.json(
          { error: 'Invalid Google Sheets URL' },
          { status: 400 }
        );
      }

      try {
        const analysis = await adoptionService.analyzeSpreadsheet(sheetUrl);
        // Return simplified info for the form
        return NextResponse.json({
          success: true,
          data: {
            sheetId,
            sheetName: analysis.sheetName,
            worksheets: analysis.worksheets.map(ws => ({
              name: ws.name,
              headers: ws.headers,
            })),
          },
        });
      } catch {
        // Even if analysis fails, return minimal info
        return NextResponse.json({
          success: true,
          data: {
            sheetId,
            sheetName: 'Unknown Spreadsheet',
            worksheets: [],
          },
        });
      }
    }

    if (action === 'analyze' && sheetUrl) {
      // Analyze spreadsheet structure
      const analysis = await adoptionService.analyzeSpreadsheet(sheetUrl);
      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (action === 'check' && sheetUrl) {
      // Check if already adopted
      const sheetId = adoptionService.extractSheetId(sheetUrl);
      if (!sheetId) {
        return NextResponse.json(
          { error: 'Invalid Google Sheets URL' },
          { status: 400 }
        );
      }

      const isAdopted = await adoptionService.isSpreadsheetAdopted(sheetId);
      return NextResponse.json({
        success: true,
        data: { isAdopted },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}