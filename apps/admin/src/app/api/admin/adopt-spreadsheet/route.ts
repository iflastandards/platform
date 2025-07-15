import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdoptionService } from '@/lib/services/adoption-service';

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

    // TODO: Check if user is superadmin
    // For now, we'll allow any authenticated user in development

    const body = await request.json();
    const {
      spreadsheetUrl,
      projectId,
      projectName,
      reviewGroup,
      dctapProfileId,
      userName,
    } = body;

    // Validate required fields
    if (!spreadsheetUrl || !dctapProfileId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!projectId && (!projectName || !reviewGroup)) {
      return NextResponse.json(
        { error: 'Either projectId or both projectName and reviewGroup are required' },
        { status: 400 }
      );
    }

    // Create adoption service
    const adoptionService = new AdoptionService();

    // Adopt the spreadsheet
    const result = await adoptionService.adoptSpreadsheet({
      spreadsheetUrl,
      projectId,
      projectName,
      reviewGroup,
      dctapProfileId,
      userId,
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
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheetUrl = searchParams.get('url');

    const adoptionService = new AdoptionService();

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