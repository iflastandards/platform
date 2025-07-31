import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ namespace: string }> }
) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { namespace } = await context.params;

    // TODO: Implement proper role checking without Cerbos
    // For now, allow all authenticated users
    const hasAccess = true;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to view this namespace' },
        { status: 403 }
      );
    }

    // TODO: In production, this would:
    // 1. Check GitHub issues for spreadsheet submissions
    // 2. Check Supabase queue for pending imports
    // 3. Return any pending spreadsheets for this namespace

    // For now, return mock data for testing
    // Simulating that there might be a pending spreadsheet from a GitHub issue
    const mockPendingSpreadsheet = Math.random() > 0.7 ? {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1ABC123DEF456/edit',
      submittedBy: 'contributor-user',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      issueNumber: 42,
      issueUrl: `https://github.com/iflastandards/platform/issues/42`,
    } : null;

    return NextResponse.json({
      namespace,
      spreadsheetUrl: mockPendingSpreadsheet?.spreadsheetUrl || null,
      pendingSubmission: mockPendingSpreadsheet,
    });

  } catch (error) {
    console.error('[PENDING-SPREADSHEETS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}