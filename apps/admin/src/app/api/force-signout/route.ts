import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the current session
    const { userId, sessionId } = await auth();

    // Clear all cookies that might be causing issues
    const response = NextResponse.json({
      message: 'Clearing session',
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    });

    // Clear Clerk session cookies
    response.cookies.delete('__session');
    response.cookies.delete('__client_uat');
    response.cookies.delete('__clerk_db_jwt');

    // Clear with domain variations
    const domains = ['localhost', '.localhost', '.clerk.accounts.dev'];
    const cookieNames = ['__session', '__client_uat', '__clerk_db_jwt'];

    cookieNames.forEach((name) => {
      domains.forEach((domain) => {
        response.cookies.set(name, '', {
          expires: new Date(0),
          path: '/',
          domain,
          secure: false,
          sameSite: 'lax',
        });
      });
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to clear session',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
