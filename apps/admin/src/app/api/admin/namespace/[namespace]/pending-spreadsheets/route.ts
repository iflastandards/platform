import { NextRequest, NextResponse } from 'next/server';
import { canPerformAction } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ namespace: string }> }
) {
  try {
    const { namespace } = await context.params;

    // Check if user can read spreadsheets for this namespace
    const canRead = await canPerformAction('spreadsheet', 'read', {
      namespaceId: namespace
    });

    if (!canRead) {
      return NextResponse.json(
        { error: 'You do not have permission to view spreadsheets for this namespace' },
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