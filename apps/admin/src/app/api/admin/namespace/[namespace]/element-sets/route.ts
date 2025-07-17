import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ namespace: string }> }
) {
  try {
    const { namespace } = await params;
    
    if (!namespace) {
      return NextResponse.json(
        { error: 'Namespace is required' },
        { status: 400 }
      );
    }
    
    // Read the site configuration for the namespace
    const siteConfigPath = join(process.cwd(), '..', '..', 'standards', namespace, 'site-config.json');
    
    let siteConfig;
    try {
      const configContent = readFileSync(siteConfigPath, 'utf8');
      siteConfig = JSON.parse(configContent);
    } catch {
      return NextResponse.json(
        { error: `Site configuration not found for namespace: ${namespace}` },
        { status: 404 }
      );
    }
    
    // Extract element sets from the site configuration
    const elementSets = siteConfig.elementSets || [];
    
    return NextResponse.json({
      namespace,
      elementSets: elementSets.map((es: {
        id: string;
        title: string;
        description: string;
        prefix: string;
        numberPrefix: string;
        baseIRI: string;
        categories: string[];
        elementCount: number;
      }) => ({
        id: es.id,
        title: es.title,
        description: es.description,
        prefix: es.prefix,
        numberPrefix: es.numberPrefix,
        baseIRI: es.baseIRI,
        categories: es.categories,
        elementCount: es.elementCount
      }))
    });
    
  } catch (error) {
    console.error('Error fetching element sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch element sets' },
      { status: 500 }
    );
  }
}