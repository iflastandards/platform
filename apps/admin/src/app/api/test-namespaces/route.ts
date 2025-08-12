import { NextResponse } from 'next/server';
import { mockNamespaceData } from '@/lib/mock-namespace-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockNamespaceData,
    meta: {
      total: mockNamespaceData.length,
      timestamp: new Date().toISOString(),
    },
  });
}