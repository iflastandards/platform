import { auth } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// CORS configuration for localhost development
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000', // Portal
          'http://localhost:3001', // ISBDM
          'http://localhost:3002', // LRM
          'http://localhost:3003', // FRBR
          'http://localhost:3004', // ISBD
          'http://localhost:3005', // MulDiCat
          'http://localhost:3006', // UniMARC
          'http://localhost:3008', // NewTest
        ]
      : [], // No CORS in production (same domain)
  credentials: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

function addCorsHeaders(response: NextResponse, origin?: string | null) {
  if (process.env.NODE_ENV !== 'development') {
    return response; // No CORS in production
  }

  if (origin && corsOptions.origin.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      corsOptions.methods.join(', '),
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      corsOptions.allowedHeaders.join(', '),
    );
  }

  return response;
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, origin);
}

// Get current session data as JSON
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const origin = request.headers.get('origin');

    const response = NextResponse.json(session || null, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('Session API error:', error);
    const origin = request.headers.get('origin');

    const response = NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 },
    );

    return addCorsHeaders(response, origin);
  }
}
