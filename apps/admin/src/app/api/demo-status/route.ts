import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_IFLA_DEMO: process.env.NEXT_PUBLIC_IFLA_DEMO,
    IFLA_DEMO: process.env.IFLA_DEMO,
    NODE_ENV: process.env.NODE_ENV,
    isDemoMode: process.env.NEXT_PUBLIC_IFLA_DEMO === 'true',
    timestamp: new Date().toISOString(),
  });
}
