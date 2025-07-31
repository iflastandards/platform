import { NextRequest, NextResponse } from 'next/server';
import { ImportService } from '@/lib/services/import-service';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { namespace, spreadsheetUrl, githubIssueNumber } = await request.json();

    // Validate inputs
    if (!namespace || !spreadsheetUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: namespace and spreadsheetUrl' },
        { status: 400 }
      );
    }

    // Validate spreadsheet URL format
    const isValidGoogleSheetUrl = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+/.test(spreadsheetUrl);
    if (!isValidGoogleSheetUrl) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL format' },
        { status: 400 }
      );
    }

    // Check user has appropriate role for this namespace
    const userRoles = (clerkUser.publicMetadata?.roles as string[]) || [];
    const hasAccess = userRoles.some((role: string) => 
      role === 'ifla-admin' || 
      role === 'site-admin' || 
      role.startsWith(`${namespace}-`)
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to scaffold this namespace' },
        { status: 403 }
      );
    }

    console.log(`[SCAFFOLD] Starting scaffold process for ${namespace} from ${spreadsheetUrl}`);

    // Create import job in Supabase
    const importJob = await ImportService.createImportJob({
      namespace_id: namespace,
      spreadsheet_url: spreadsheetUrl,
      github_issue_number: githubIssueNumber,
      created_by: clerkUser.id,
    });

    if (!importJob) {
      return NextResponse.json(
        { error: 'Failed to create import job' },
        { status: 500 }
      );
    }

    // Start processing asynchronously
    // In production, this would be handled by a queue/worker
    ImportService.processImportJob(importJob.id).catch(error => {
      console.error('[SCAFFOLD] Background processing error:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Import job created successfully',
      jobId: importJob.id,
      namespace,
      spreadsheetUrl,
      status: importJob.status,
    });

  } catch (error) {
    console.error('[SCAFFOLD] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 }
    );
  }

  // Check job status from Supabase
  const job = await ImportService.getImportJob(jobId);
  
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  // Calculate progress based on status
  const progressMap = {
    'pending': 10,
    'validating': 30,
    'processing': 60,
    'completed': 100,
    'failed': 0,
  };

  const messageMap = {
    'pending': 'Import job queued...',
    'validating': 'Validating spreadsheet data...',
    'processing': 'Converting to MDX format...',
    'completed': 'Import completed successfully!',
    'failed': job.error_message || 'Import failed',
  };

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    progress: progressMap[job.status],
    message: messageMap[job.status],
    namespace: job.namespace_id,
    spreadsheetUrl: job.spreadsheet_url,
    branchName: job.branch_name,
    validationResults: job.validation_results,
    completedAt: job.completed_at,
    errorMessage: job.error_message,
  });
}